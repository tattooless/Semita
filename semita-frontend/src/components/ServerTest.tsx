import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { api } from "../utils/api";

export function ServerTest() {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  const runTest = async () => {
    setTestStatus('testing');
    setTestResult('');

    try {
      const response = await api.initializeApp();
      if (response.success) {
        setTestStatus('success');
        setTestResult('Server connection successful! All features are now active.');
      } else {
        setTestStatus('error');
        setTestResult('Server responded but initialization failed.');
      }
    } catch (error) {
      setTestStatus('error');
      if (error instanceof Error) {
        if (error.message.includes('SERVER_UNAVAILABLE')) {
          setTestResult('Server not deployed yet. Please follow the deployment instructions above.');
        } else {
          setTestResult(`Connection failed: ${error.message}`);
        }
      } else {
        setTestResult('Unknown error occurred during server test.');
      }
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (testStatus) {
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Test Server Connection</span>
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test if your Supabase Edge Function is deployed and working correctly.
        </p>
        
        <Button 
          onClick={runTest} 
          disabled={testStatus === 'testing'}
          className="w-full"
        >
          {testStatus === 'testing' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Server Connection
            </>
          )}
        </Button>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${
            testStatus === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}
      </CardContent>
    </Card>
  );
}