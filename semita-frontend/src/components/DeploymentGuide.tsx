import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Copy, ExternalLink, Server, Database, Zap } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { ServerTest } from "./ServerTest";

export function DeploymentGuide() {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-4">Deploy Semita Backend</h1>
        <p className="text-muted-foreground">
          Follow these steps to deploy your Supabase Edge Function and enable real-time features
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Server className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Currently running in demo mode. Deploy the backend to enable real-time synchronization across all residents.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <ServerTest />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Step 1: Setup Supabase</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a new Supabase project and get your credentials
            </p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></li>
              <li>Create a new project</li>
              <li>Go to Project Settings → API</li>
              <li>Copy your Project URL and anon key</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Step 2: Deploy Edge Function</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deploy the server code to handle real-time updates
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Install Supabase CLI:</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    npm install -g supabase
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard('npm install -g supabase', 'Command')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Login and link project:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      supabase login
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard('supabase login', 'Command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      supabase link --project-ref YOUR_PROJECT_ID
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard('supabase link --project-ref YOUR_PROJECT_ID', 'Command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Deploy the server function:</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    supabase functions deploy server
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard('supabase functions deploy server', 'Command')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What happens after deployment?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Real-time Updates</h4>
              <p className="text-sm text-muted-foreground">
                Service status changes sync instantly across all residents
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Persistent Data</h4>
              <p className="text-sm text-muted-foreground">
                Complaints and reports are saved and tracked over time
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Community Sync</h4>
              <p className="text-sm text-muted-foreground">
                All residents see the same live data and notifications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          asChild
          size="lg"
          className="inline-flex items-center space-x-2"
        >
          <a 
            href="https://supabase.com/docs/guides/functions" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Full Documentation</span>
          </a>
        </Button>
      </div>
    </div>
  );
}