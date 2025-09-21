import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db, isFirebaseInitialized } from './config';

// Collection names
export const COLLECTIONS = {
  SERVICES: 'services',
  COMPLAINTS: 'complaints',
  NOTIFICATIONS: 'notifications',
  INSIGHTS: 'insights',
  USERS: 'users',
  SERVICE_REPORTS: 'service_reports'
} as const;

// Types
export interface FirestoreService {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'outage';
  description: string;
  lastUpdate: Timestamp;
  reportsCount: number;
  icon?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FirestoreComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  upvotes: number;
  upvotedBy: string[];
  submittedBy: string;
  dateSubmitted: Timestamp;
  tags?: string[];
  attachments?: string[];
}

export interface FirestoreNotification {
  id: string;
  title: string;
  message: string;
  type: 'outage' | 'maintenance' | 'update' | 'complaint';
  read: boolean;
  timestamp: Timestamp;
  serviceId?: string;
  priority: 'high' | 'medium' | 'low';
}

// Generic Firestore operations
export class FirestoreService {
  // Get a single document
  static async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      if (!db || !isFirebaseInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  }

  // Get multiple documents with optional constraints
  static async getDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      if (!db || !isFirebaseInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Add a new document
  static async addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      if (!db || !isFirebaseInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  // Update a document
  static async updateDocument(
    collectionName: string,
    docId: string,
    data: Partial<any>
  ): Promise<void> {
    try {
      if (!db || !isFirebaseInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  }

  // Set a document (create or overwrite)
  static async setDocument<T>(
    collectionName: string,
    docId: string,
    data: Omit<T, 'id'>
  ): Promise<void> {
    try {
      if (!db || !isFirebaseInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error setting document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  }

  // Delete a document
  static async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      if (!db || !isFirebaseInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  static subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ): () => void {
    if (!db || !isFirebaseInitialized) {
      throw new Error('Firebase not initialized');
    }
    
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(data);
    }, (error) => {
      console.error(`Error in subscription to ${collectionName}:`, error);
    });
  }

  // Subscribe to a single document
  static subscribeToDocument<T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ): () => void {
    if (!db || !isFirebaseInitialized) {
      throw new Error('Firebase not initialized');
    }
    
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error in subscription to document ${docId} in ${collectionName}:`, error);
    });
  }
}

// Helper functions for common queries
export const firestoreHelpers = {
  // Get services ordered by priority
  async getServices() {
    return FirestoreService.getDocuments<FirestoreService>(
      COLLECTIONS.SERVICES,
      [orderBy('priority', 'desc'), orderBy('name', 'asc')]
    );
  },

  // Get recent complaints
  async getRecentComplaints(limitCount = 50) {
    return FirestoreService.getDocuments<FirestoreComplaint>(
      COLLECTIONS.COMPLAINTS,
      [orderBy('dateSubmitted', 'desc'), limit(limitCount)]
    );
  },

  // Get unread notifications
  async getUnreadNotifications() {
    return FirestoreService.getDocuments<FirestoreNotification>(
      COLLECTIONS.NOTIFICATIONS,
      [where('read', '==', false), orderBy('timestamp', 'desc')]
    );
  },

  // Get complaints by category
  async getComplaintsByCategory(category: string) {
    return FirestoreService.getDocuments<FirestoreComplaint>(
      COLLECTIONS.COMPLAINTS,
      [where('category', '==', category), orderBy('dateSubmitted', 'desc')]
    );
  }
};