import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RequestResetFormData = z.infer<typeof requestResetSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const isResetMode = !!token;

  const requestResetForm = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onRequestReset = async (_data: RequestResetFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (_data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsPasswordReset(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPasswordReset) {
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
            <h1 className="text-3xl font-bold text-foreground">Password Reset!</h1>
            <p className="text-muted-foreground mt-2">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </div>

          <Card className="animate-fade-in-up">
            <CardContent className="pt-6">
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                variant="gradient"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Email Sent State */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
            <p className="text-muted-foreground mt-2">
              We've sent a password reset link to your email address
            </p>
          </div>

          <Card className="animate-fade-in-up">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Click the link in the email to reset your password. The link will expire in 1 hour.
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsEmailSent(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="gradient"
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                </div>
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
          <h1 className="text-3xl font-bold gradient-text">
            {isResetMode ? 'Reset your password' : 'Forgot your password?'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isResetMode 
              ? 'Enter your new password below'
              : 'Enter your email address and we\'ll send you a reset link'
            }
          </p>
        </div>

        {/* Reset Form */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              {isResetMode ? (
                <>
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  New Password
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Reset Password
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isResetMode 
                ? 'Choose a strong password for your account'
                : 'We\'ll send you a secure link to reset your password'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isResetMode ? (
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    {...resetPasswordForm.register('password')}
                    className={resetPasswordForm.formState.errors.password ? 'border-destructive' : ''}
                  />
                  {resetPasswordForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {resetPasswordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    {...resetPasswordForm.register('confirmPassword')}
                    className={resetPasswordForm.formState.errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {resetPasswordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {resetPasswordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            ) : (
              <form onSubmit={requestResetForm.handleSubmit(onRequestReset)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sarah@company.com"
                    {...requestResetForm.register('email')}
                    className={requestResetForm.formState.errors.email ? 'border-destructive' : ''}
                  />
                  {requestResetForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {requestResetForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}