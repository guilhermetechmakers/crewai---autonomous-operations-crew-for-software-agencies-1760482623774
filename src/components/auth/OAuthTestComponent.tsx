import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  provider: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
}

export function OAuthTestComponent() {
  const { initiateOAuth, isOAuthLoading } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const providers = [
    { id: 'google' as const, name: 'Google' },
    { id: 'github' as const, name: 'GitHub' },
    { id: 'microsoft' as const, name: 'Microsoft' },
  ];

  const addTestResult = (provider: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      provider,
      status,
      message,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };

  const testProvider = async (provider: 'google' | 'github' | 'microsoft') => {
    addTestResult(provider, 'pending', 'Initiating OAuth flow...');
    
    try {
      await initiateOAuth(provider);
      addTestResult(provider, 'success', 'OAuth flow initiated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(provider, 'error', `Failed: ${errorMessage}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const provider of providers) {
      await testProvider(provider.id);
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          OAuth Provider Test
          {isOAuthLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Test OAuth integration with Google, GitHub, and Microsoft providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {providers.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => testProvider(provider.id)}
              disabled={isOAuthLoading || isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isOAuthLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Test {provider.name}
            </Button>
          ))}
          <Button
            onClick={runAllTests}
            disabled={isOAuthLoading || isRunning}
            variant="default"
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test All
          </Button>
          <Button
            onClick={clearResults}
            variant="ghost"
            size="sm"
          >
            Clear Results
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.provider}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Note:</strong> This test will redirect you to the OAuth provider's login page.</p>
          <p>After successful authentication, you'll be redirected back to the callback page.</p>
        </div>
      </CardContent>
    </Card>
  );
}