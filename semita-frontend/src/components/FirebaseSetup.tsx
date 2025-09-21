import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Copy, ExternalLink, Play, Settings, Database, Shield, Cloud } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/api';
import { isDemoMode } from '../utils/firebase/demo-config';

interface FirebaseSetupProps {
  onClose?: () => void;
}

export function FirebaseSetup({ onClose }: FirebaseSetupProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationStatus, setInitializationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard!`);
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const result = await api.initializeApp();
      if (result.success) {
        setInitializationStatus('success');
        toast.success('Firebase initialized successfully!');
      } else {
        setInitializationStatus('error');
        toast.error('Failed to initialize Firebase');
      }
    } catch (error) {
      setInitializationStatus('error');
      toast.error('Error initializing Firebase');
      console.error('Firebase initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const firebaseConfig = `{
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:your-app-id"
}`;

  const configCode = `// Replace the configuration in /utils/firebase/config.ts
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id", 
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:your-app-id"
};`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read services
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Anyone can read complaints and notifications
    match /complaints/{complaintId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /notifications/{notificationId} {
      allow read, write: if true;
    }
    
    // Service reports require authentication
    match /service_reports/{reportId} {
      allow read, write: if request.auth != null;
    }
    
    // Insights are read-only for authenticated users
    match /insights/{insightId} {
      allow read: if request.auth != null;
    }
  }
}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Firebase Setup Guide</h1>
          <p className="text-muted-foreground">
            Configure Firebase to enable real-time features for Semita
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isDemoMode() ? "secondary" : api.isFirebaseAvailable() ? "default" : "destructive"}>
            {isDemoMode() ? "Demo Mode" : api.isFirebaseAvailable() ? "Firebase Connected" : "Firebase Error"}
          </Badge>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                1. Create Firebase Project
              </CardTitle>
              <CardDescription>
                Set up a new Firebase project for your Semita deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>Follow these steps to create your Firebase project:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <Button variant="link" className="p-0 h-auto" onClick={() => window.open('https://console.firebase.google.com', '_blank')}>
                    Firebase Console <ExternalLink className="h-3 w-3 ml-1" />
                  </Button></li>
                  <li>Click "Create a project" or "Add project"</li>
                  <li>Enter project name (e.g., "semita-neighborhood-hub")</li>
                  <li>Choose whether to enable Google Analytics (optional)</li>
                  <li>Click "Create project"</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                2. Enable Services
              </CardTitle>
              <CardDescription>
                Enable Firestore Database and Authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Enable Firestore Database:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>In Firebase Console, go to "Firestore Database"</li>
                    <li>Click "Create database"</li>
                    <li>Choose "Start in production mode"</li>
                    <li>Select a location close to your users</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Enable Authentication:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to "Authentication" in the left sidebar</li>
                    <li>Click "Get started"</li>
                    <li>Go to "Sign-in method" tab</li>
                    <li>Enable "Email/Password" provider</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                3. Get Configuration
              </CardTitle>
              <CardDescription>
                Get your Firebase configuration keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>To get your Firebase config:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>In Firebase Console, go to Project Settings (gear icon)</li>
                  <li>Scroll down to "Your apps" section</li>
                  <li>Click "Web" icon to add a web app</li>
                  <li>Enter app name (e.g., "Semita Web App")</li>
                  <li>Copy the configuration object</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Add these environment variables to your deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Update Firebase Configuration</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(configCode, 'Firebase configuration')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">{configCode}</pre>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  Replace the configuration object in /utils/firebase/config.ts with your actual Firebase project values.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Firebase Configuration</CardTitle>
              <CardDescription>
                Example configuration object structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Firebase Config Object</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(firebaseConfig, 'Firebase configuration')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">{firebaseConfig}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Firestore Security Rules
              </CardTitle>
              <CardDescription>
                Configure security rules for your Firestore database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>Apply these security rules to your Firestore database:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to Firestore Database in Firebase Console</li>
                  <li>Click on "Rules" tab</li>
                  <li>Replace the default rules with the ones below</li>
                  <li>Click "Publish" to save the rules</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Firestore Rules</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(firestoreRules, 'Firestore rules')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">{firestoreRules}</pre>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  These rules provide a good starting point for security. You may need to adjust them based on your specific requirements.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Test Firebase Connection
              </CardTitle>
              <CardDescription>
                Initialize and test your Firebase setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={handleInitialize}
                    disabled={isInitializing}
                    size="lg"
                    className="w-full"
                  >
                    {isInitializing ? 'Initializing...' : 'Initialize Firebase'}
                  </Button>
                </div>

                {initializationStatus === 'success' && (
                  <Alert>
                    <AlertDescription className="text-green-700">
                      🎉 Firebase initialized successfully! Your app is now connected to Firebase and ready for real-time features.
                    </AlertDescription>
                  </Alert>
                )}

                {initializationStatus === 'error' && (
                  <Alert>
                    <AlertDescription className="text-red-700">
                      ❌ Firebase initialization failed. Please check your configuration and try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Test Checklist:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Environment variables are set correctly</li>
                    <li>✅ Firestore database is created</li>
                    <li>✅ Authentication is enabled</li>
                    <li>✅ Security rules are configured</li>
                    <li>✅ Firebase SDK is connected</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}