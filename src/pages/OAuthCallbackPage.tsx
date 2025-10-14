import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AuthService from '@/services/AuthService';
import { OAuthErrorHandler, logOAuthError } from '@/lib/oauth-errors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [canRetry, setCanRetry] = useState(false);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        const oauthError = OAuthErrorHandler.parseError(errorParam, state || undefined);
        logOAuthError(oauthError, 'OAuthCallbackPage');
        setError(oauthError.message);
        setErrorDetails(oauthError);
        setCanRetry(OAuthErrorHandler.shouldRetry(oauthError.type));
        setStatus('error');
        return;
      }

      if (!code || !state) {
        const oauthError = OAuthErrorHandler.parseError('invalid_request', state || undefined);
        logOAuthError(oauthError, 'OAuthCallbackPage');
        setError('Missing authorization code or state parameter');
        setErrorDetails(oauthError);
        setCanRetry(true);
        setStatus('error');
        return;
      }

      try {
        const result = await authService.handleOAuthCallback(code, state);
        
        if (result.success) {
          setStatus('success');
          toast.success('Successfully signed in!');
          
          // Redirect to the original URL or dashboard
          const redirectUrl = localStorage.getItem('oauth_redirect_url') || '/dashboard';
          localStorage.removeItem('oauth_redirect_url');
          
          setTimeout(() => {
            navigate(redirectUrl);
          }, 1500);
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

    handleOAuthCallback();
  }, [searchParams, navigate, authService]);

  const handleRetry = () => {
    if (canRetry) {
      navigate('/login');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetryOAuth = () => {
    if (errorDetails?.provider) {
      authService.initiateOAuth(errorDetails.provider as 'google' | 'github' | 'microsoft');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-success" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Completing sign in...'}
            {status === 'success' && 'Sign in successful!'}
            {status === 'error' && 'Sign in failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete your authentication.'}
            {status === 'success' && 'You will be redirected to your dashboard shortly.'}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>
        
        {status === 'error' && (
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {errorDetails?.description || 'There was a problem signing you in.'}
              </p>
              {errorDetails && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <strong>Error Type:</strong> {errorDetails.type}
                  {errorDetails.provider && (
                    <>
                      <br />
                      <strong>Provider:</strong> {errorDetails.provider}
                    </>
                  )}
                </div>
              )}
              <div className="flex gap-2 justify-center">
                {canRetry && (
                  <Button onClick={handleRetryOAuth} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry OAuth
                  </Button>
                )}
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button onClick={handleGoHome} variant="ghost">
                  Go Home
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
