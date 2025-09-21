import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  Auth
} from 'firebase/auth';
import { auth } from './config';
import { FirestoreService, COLLECTIONS } from './firestore';
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  address?: string;
  apartment?: string;
  phone?: string;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
  };
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export class AuthService {
  // Sign up new user
  static async signUp(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<{ user: User; profile: UserProfile }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName || user.displayName || undefined,
        preferences: {
          notifications: true,
          emailUpdates: true,
          smsAlerts: false
        },
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };

      await FirestoreService.setDocument(COLLECTIONS.USERS, user.uid, userProfile);

      return { user, profile: userProfile };
    } catch (error: any) {
      console.error('Error during sign up:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string): Promise<{ user: User; profile: UserProfile | null }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await FirestoreService.updateDocument(COLLECTIONS.USERS, user.uid, {
        lastLogin: Timestamp.now()
      });

      // Get user profile
      const profile = await FirestoreService.getDocument<UserProfile>(COLLECTIONS.USERS, user.uid);

      return { user, profile };
    } catch (error: any) {
      console.error('Error during sign in:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Get user profile
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      return await FirestoreService.getDocument<UserProfile>(COLLECTIONS.USERS, uid);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await FirestoreService.updateDocument(COLLECTIONS.USERS, uid, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // Get user's display name or email
  static getUserDisplayName(): string {
    const user = auth.currentUser;
    if (!user) return 'Anonymous';
    return user.displayName || user.email || 'User';
  }

  // Get auth error messages
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// Hook for React components to use auth state
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signUp: AuthService.signUp,
    signIn: AuthService.signIn,
    signOut: AuthService.signOut,
    getUserProfile: AuthService.getUserProfile,
    updateUserProfile: AuthService.updateUserProfile,
    getUserDisplayName: AuthService.getUserDisplayName
  };
}