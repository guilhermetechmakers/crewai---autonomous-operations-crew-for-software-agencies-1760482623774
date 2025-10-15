import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AuthService from '@/services/AuthService';
import { OAuthErrorHandler, logOAuthError } from '@/lib/oauth-errors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw, Home, LogIn, AlertTriangle } from 'lucide-react';
import type { OAuthError } from '@/lib/oauth-errors';

type CallbackStatus = 'loading' | 'success' | 'error' | 'timeout';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<OAuthError | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth error parameters
      if (errorParam) {
        const oauthError = OAuthErrorHandler.parseError(errorParam, state || undefined);
        if (errorDescription) {
          oauthError.description = decodeURIComponent(errorDescription);
        }
        logOAuthError(oauthError, 'OAuthCallbackPage');
        setError(oauthError.message);
        setErrorDetails(oauthError);
        setCanRetry(OAuthErrorHandler.shouldRetry(oauthError.type));
        setStatus('error');
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        const oauthError = OAuthErrorHandler.parseError('invalid_request', state || undefined);
        oauthError.description = 'Missing authorization code or state parameter. This may indicate an invalid OAuth request.';
        logOAuthError(oauthError, 'OAuthCallbackPage');
        setError(oauthError.message);
        setErrorDetails(oauthError);
        setCanRetry(true);
        setStatus('error');
        return;
      }

      // Validate state parameter (should match the provider)
      const validProviders = ['google', 'github', 'microsoft'];
      if (!validProviders.includes(state)) {
        const oauthError = OAuthErrorHandler.parseError('invalid_request', state);
        oauthError.description = 'Invalid OAuth provider. Please try signing in again.';
        logOAuthError(oauthError, 'OAuthCallbackPage');
        setError(oauthError.message);
        setErrorDetails(oauthError);
        setCanRetry(true);
        setStatus('error');
        return;
      }

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const result = await authService.handleOAuthCallback(code, state);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        if (result.success) {
          setStatus('success');
          toast.success('Successfully signed in!', {
            description: `Welcome back! Redirecting to your dashboard...`,
          });
          
          // Redirect to the original URL or dashboard
          const redirectUrl = localStorage.getItem('oauth_redirect_url') || '/dashboard';
          localStorage.removeItem('oauth_redirect_url');
          
          setTimeout(() => {
            navigate(redirectUrl, { replace: true });
          }, 2000);
        } else {
          const oauthError = OAuthErrorHandler.parseError(result.error, state);
          logOAuthError(oauthError, 'OAuthCallbackPage');
          setError(oauthError.message);
          setErrorDetails(oauthError);
          setCanRetry(OAuthErrorHandler.shouldRetry(oauthError.type));
          setStatus('error');
        }
      } catch (err) {
        const oauthError = OAuthErrorHandler.parseError(err, state);
        logOAuthError(oauthError, 'OAuthCallbackPage');
        setError(oauthError.message);
        setErrorDetails(oauthError);
        setCanRetry(OAuthErrorHandler.shouldRetry(oauthError.type));
        setStatus('error');
      }
    };

    // Set a timeout to handle cases where the callback takes too long
    const timeout = setTimeout(() => {
      if (status === 'loading') {
        setStatus('timeout');
        setError('Authentication is taking longer than expected');
        setCanRetry(true);
      }
    }, 30000); // 30 second timeout

    handleOAuthCallback();

    return () => clearTimeout(timeout);
  }, [searchParams, navigate, authService, status]);

  const handleRetry = () => {
    if (canRetry) {
      setRetryCount(prev => prev + 1);
      navigate('/login', { replace: true });
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleRetryOAuth = async () => {
    if (errorDetails?.provider) {
      try {
        await authService.initiateOAuth(errorDetails.provider as 'google' | 'github' | 'microsoft');
      } catch (err) {
        console.error('Failed to retry OAuth:', err);
        toast.error('Failed to retry authentication');
      }
    } else {
      navigate('/login', { replace: true });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-destructive" />;
      case 'timeout':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      default:
        return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Completing sign in...';
      case 'success':
        return 'Sign in successful!';
      case 'error':
        return 'Sign in failed';
      case 'timeout':
        return 'Authentication timeout';
      default:
        return 'Processing...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'loading':
        return 'Please wait while we complete your authentication.';
      case 'success':
        return 'You will be redirected to your dashboard shortly.';
      case 'error':
        return error;
      case 'timeout':
        return 'The authentication process is taking longer than expected. Please try again.';
      default:
        return 'Processing your request...';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-base">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        
        {status === 'loading' && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing authentication...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        )}
        
        {(status === 'error' || status === 'timeout') && (
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorDetails?.description || 'There was a problem signing you in.'}
              </AlertDescription>
            </Alert>
            
            {errorDetails && (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md space-y-1">
                <div><strong>Error Type:</strong> {errorDetails.type}</div>
                {errorDetails.provider && (
                  <div><strong>Provider:</strong> {errorDetails.provider}</div>
                )}
                {errorDetails.code && (
                  <div><strong>Error Code:</strong> {errorDetails.code}</div>
                )}
                {retryCount > 0 && (
                  <div><strong>Retry Attempt:</strong> {retryCount}</div>
                )}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              {canRetry && (
                <Button 
                  onClick={handleRetryOAuth} 
                  variant="default" 
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again with {errorDetails?.provider || 'OAuth'}
                </Button>
              )}
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Back to Login
              </Button>
              <Button 
                onClick={handleGoHome} 
                variant="ghost" 
                className="w-full flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
