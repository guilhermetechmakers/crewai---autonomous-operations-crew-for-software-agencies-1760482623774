import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailVerificationPage() {
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      // Simulate API call to check verification status
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsVerified(true);
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error('Email not yet verified. Please check your inbox.');
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Success State */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Email Verified!</h1>
            <p className="text-muted-foreground mt-2">
              Your account has been successfully verified. You can now access your workspace.
            </p>
          </div>

          <Card className="animate-fade-in-up">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Welcome to CrewAI! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    Your workspace is ready. Let's set up your first project.
                  </p>
                </div>
                
                <Button
                  onClick={() => navigate('/onboarding')}
                  className="w-full"
                  variant="gradient"
                >
                  Continue to Onboarding
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We've sent a verification link to your email address
          </p>
        </div>

        {/* Verification Card */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-primary" />
              Email Verification
            </CardTitle>
            <CardDescription>
              Please check your inbox and click the verification link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Didn't receive the email?</p>
                  <p className="text-muted-foreground">
                    Check your spam folder or try resending the verification email.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>

                <Button
                  onClick={handleCheckVerification}
                  variant="gradient"
                  className="w-full"
                >
                  I've Verified My Email
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Need help?{' '}
                <Link
                  to="/support"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Wrong email address?{' '}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign up again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}