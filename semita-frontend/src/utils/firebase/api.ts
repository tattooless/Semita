import { FirestoreService, COLLECTIONS, firestoreHelpers } from './firestore';
import { where, orderBy, Timestamp } from 'firebase/firestore';
import { mockServices, mockComplaints, mockNotifications, mockInsights } from '../mockData';
import { isFirebaseInitialized } from './config';

// Track Firebase availability
let firebaseAvailable = false;
let lastFirebaseCheck = 0;
const FIREBASE_CHECK_INTERVAL = 30000; // 30 seconds

// Helper function to handle Firebase operations with fallback
async function executeWithFallback<T>(
  operation: () => Promise<T>,
  fallbackData: T,
  operationName: string
): Promise<T> {
  try {
    const result = await operation();
    firebaseAvailable = true;
    lastFirebaseCheck = Date.now();
    return result;
  } catch (error) {
    console.warn(`Firebase ${operationName} failed, using fallback data:`, error);
    firebaseAvailable = false;
    lastFirebaseCheck = Date.now();
    return fallbackData;
  }
}

// Check if Firebase should be attempted
function shouldUseFirebase(): boolean {
  const now = Date.now();
  if (now - lastFirebaseCheck > FIREBASE_CHECK_INTERVAL) {
    // Reset Firebase check after interval, but only if it was initialized
    firebaseAvailable = isFirebaseInitialized;
  }
  return firebaseAvailable && isFirebaseInitialized;
}

// Convert Firestore timestamps to readable format
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return 'Just now';
}

// Convert Firebase data to app format
function convertFirebaseService(service: any) {
  return {
    ...service,
    lastUpdate: formatTimestamp(service.lastUpdate)
  };
}

function convertFirebaseComplaint(complaint: any) {
  return {
    ...complaint,
    dateSubmitted: formatTimestamp(complaint.dateSubmitted),
    hasUpvoted: false // This would be determined by user context
  };
}

function convertFirebaseNotification(notification: any) {
  return {
    ...notification,
    timestamp: formatTimestamp(notification.timestamp)
  };
}

export const firebaseApi = {
  // Services
  async getServices() {
    if (!shouldUseFirebase()) {
      return { services: mockServices };
    }

    return executeWithFallback(
      async () => {
        const services = await firestoreHelpers.getServices();
        return { 
          services: services.map(convertFirebaseService)
        };
      },
      { services: mockServices },
      'getServices'
    );
  },

  async updateServiceStatus(serviceId: string, status: string, description: string, reportedBy: string = 'Anonymous') {
    if (!shouldUseFirebase()) {
      // Mock the update locally
      const service = mockServices.find(s => s.id === serviceId);
      if (service) {
        service.status = status;
        service.description = description;
        service.lastUpdate = 'Just now';
        service.reportsCount += 1;
      }
      return { success: true, service };
    }

    return executeWithFallback(
      async () => {
        // Update service status
        await FirestoreService.updateDocument(COLLECTIONS.SERVICES, serviceId, {
          status,
          description,
          lastUpdate: Timestamp.now(),
          reportsCount: await firebaseApi.incrementReportCount(serviceId)
        });

        // Add a service report for tracking
        await FirestoreService.addDocument(COLLECTIONS.SERVICE_REPORTS, {
          serviceId,
          status,
          description,
          reportedBy,
          timestamp: Timestamp.now()
        });

        // Create notification for major status changes
        if (status === 'outage') {
          await FirestoreService.addDocument(COLLECTIONS.NOTIFICATIONS, {
            title: `Service Outage Reported`,
            message: `${serviceId} has been reported as experiencing an outage: ${description}`,
            type: 'outage',
            read: false,
            timestamp: Timestamp.now(),
            serviceId,
            priority: 'high'
          });
        }

        const updatedService = await FirestoreService.getDocument(COLLECTIONS.SERVICES, serviceId);
        return { 
          success: true, 
          service: updatedService ? convertFirebaseService(updatedService) : null 
        };
      },
      (() => {
        const service = mockServices.find(s => s.id === serviceId);
        if (service) {
          service.status = status;
          service.description = description;
          service.lastUpdate = 'Just now';
          service.reportsCount += 1;
        }
        return { success: true, service };
      })(),
      'updateServiceStatus'
    );
  },

  async incrementReportCount(serviceId: string): Promise<number> {
    try {
      const service = await FirestoreService.getDocument(COLLECTIONS.SERVICES, serviceId);
      const currentCount = service?.reportsCount || 0;
      const newCount = currentCount + 1;
      return newCount;
    } catch (error) {
      return 1; // Default to 1 if error
    }
  },

  // Complaints
  async getComplaints() {
    if (!shouldUseFirebase()) {
      return { complaints: mockComplaints };
    }

    return executeWithFallback(
      async () => {
        const complaints = await firestoreHelpers.getRecentComplaints();
        return { 
          complaints: complaints.map(convertFirebaseComplaint)
        };
      },
      { complaints: mockComplaints },
      'getComplaints'
    );
  },

  async submitComplaint(complaint: any) {
    if (!shouldUseFirebase()) {
      const newComplaint = {
        ...complaint,
        id: Date.now().toString(),
        status: 'open',
        upvotes: 0,
        dateSubmitted: 'Just now',
        hasUpvoted: false,
        upvotedBy: []
      };
      mockComplaints.unshift(newComplaint);
      return { success: true, complaint: newComplaint };
    }

    return executeWithFallback(
      async () => {
        const complaintData = {
          ...complaint,
          status: 'open',
          upvotes: 0,
          upvotedBy: [],
          dateSubmitted: Timestamp.now(),
          submittedBy: complaint.submittedBy || 'Anonymous'
        };

        const docId = await FirestoreService.addDocument(COLLECTIONS.COMPLAINTS, complaintData);
        
        // Create notification for high priority complaints
        if (complaint.priority === 'high') {
          await FirestoreService.addDocument(COLLECTIONS.NOTIFICATIONS, {
            title: 'High Priority Complaint Submitted',
            message: `New complaint: ${complaint.title}`,
            type: 'complaint',
            read: false,
            timestamp: Timestamp.now(),
            priority: 'high'
          });
        }

        const newComplaint = {
          ...complaintData,
          id: docId,
          dateSubmitted: 'Just now',
          hasUpvoted: false
        };

        return { success: true, complaint: newComplaint };
      },
      (() => {
        const newComplaint = {
          ...complaint,
          id: Date.now().toString(),
          status: 'open',
          upvotes: 0,
          dateSubmitted: 'Just now',
          hasUpvoted: false,
          upvotedBy: []
        };
        mockComplaints.unshift(newComplaint);
        return { success: true, complaint: newComplaint };
      })(),
      'submitComplaint'
    );
  },

  async upvoteComplaint(complaintId: string, userId: string = 'anonymous') {
    if (!shouldUseFirebase()) {
      const complaint = mockComplaints.find(c => c.id === complaintId);
      if (complaint && !complaint.hasUpvoted) {
        complaint.upvotes += 1;
        complaint.hasUpvoted = true;
      }
      return { success: true, upvotes: complaint?.upvotes || 0 };
    }

    return executeWithFallback(
      async () => {
        const complaint = await FirestoreService.getDocument(COLLECTIONS.COMPLAINTS, complaintId);
        
        if (!complaint) {
          throw new Error('Complaint not found');
        }

        const upvotedBy = complaint.upvotedBy || [];
        
        if (upvotedBy.includes(userId)) {
          return { success: false, message: 'Already upvoted', upvotes: complaint.upvotes };
        }

        const newUpvotedBy = [...upvotedBy, userId];
        const newUpvotes = newUpvotedBy.length;

        await FirestoreService.updateDocument(COLLECTIONS.COMPLAINTS, complaintId, {
          upvotes: newUpvotes,
          upvotedBy: newUpvotedBy
        });

        return { success: true, upvotes: newUpvotes };
      },
      (() => {
        const complaint = mockComplaints.find(c => c.id === complaintId);
        if (complaint && !complaint.hasUpvoted) {
          complaint.upvotes += 1;
          complaint.hasUpvoted = true;
        }
        return { success: true, upvotes: complaint?.upvotes || 0 };
      })(),
      'upvoteComplaint'
    );
  },

  // Notifications
  async getNotifications() {
    if (!shouldUseFirebase()) {
      return { notifications: mockNotifications };
    }

    return executeWithFallback(
      async () => {
        const notifications = await FirestoreService.getDocuments(
          COLLECTIONS.NOTIFICATIONS,
          [orderBy('timestamp', 'desc')]
        );
        return { 
          notifications: notifications.map(convertFirebaseNotification)
        };
      },
      { notifications: mockNotifications },
      'getNotifications'
    );
  },

  async markNotificationAsRead(notificationId: string) {
    if (!shouldUseFirebase()) {
      const notification = mockNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      return { success: true };
    }

    return executeWithFallback(
      async () => {
        await FirestoreService.updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, {
          read: true
        });
        return { success: true };
      },
      (() => {
        const notification = mockNotifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
        return { success: true };
      })(),
      'markNotificationAsRead'
    );
  },

  // Insights
  async getInsights() {
    if (!shouldUseFirebase()) {
      return mockInsights;
    }

    return executeWithFallback(
      async () => {
        // This would be computed from actual data in a real implementation
        // For now, we'll return mock insights but this could be enhanced
        // to calculate real insights from Firestore data
        const services = await firestoreHelpers.getServices();
        const complaints = await firestoreHelpers.getRecentComplaints(100);
        
        // Calculate real insights from Firebase data
        const uptimeData = services.map(service => ({
          service: service.name,
          uptime: service.status === 'operational' ? 98 : service.status === 'warning' ? 85 : 45
        }));

        const issueFrequency = complaints.reduce((acc, complaint) => {
          acc[complaint.category] = (acc[complaint.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...mockInsights,
          uptimeData,
          issueFrequency: Object.entries(issueFrequency).map(([category, count]) => ({
            category,
            count
          }))
        };
      },
      mockInsights,
      'getInsights'
    );
  },

  // Initialize app with Firebase
  async initializeApp() {
    if (!shouldUseFirebase()) {
      return { success: true, message: 'Using mock data - Firebase not available' };
    }

    return executeWithFallback(
      async () => {
        // Initialize default services if they don't exist
        const existingServices = await firestoreHelpers.getServices();
        
        if (existingServices.length === 0) {
          // Create default services
          const defaultServices = [
            {
              name: 'Electricity',
              status: 'operational',
              description: 'Power supply is stable across all sectors',
              priority: 'high',
              reportsCount: 0,
              icon: 'zap'
            },
            {
              name: 'Water Supply',
              status: 'operational',
              description: 'Water pressure and quality within normal parameters',
              priority: 'high',
              reportsCount: 0,
              icon: 'droplets'
            },
            {
              name: 'Internet',
              status: 'warning',
              description: 'Some areas experiencing slower speeds',
              priority: 'medium',
              reportsCount: 3,
              icon: 'wifi'
            },
            {
              name: 'Garbage Collection',
              status: 'operational',
              description: 'Regular pickup schedule maintained',
              priority: 'medium',
              reportsCount: 0,
              icon: 'trash-2'
            },
            {
              name: 'Security',
              status: 'operational',
              description: 'All security systems functioning normally',
              priority: 'high',
              reportsCount: 0,
              icon: 'shield'
            },
            {
              name: 'Maintenance',
              status: 'operational',
              description: 'Scheduled maintenance on track',
              priority: 'low',
              reportsCount: 1,
              icon: 'wrench'
            }
          ];

          for (const service of defaultServices) {
            await FirestoreService.addDocument(COLLECTIONS.SERVICES, {
              ...service,
              lastUpdate: Timestamp.now()
            });
          }
        }

        return { success: true, message: 'Firebase initialized successfully' };
      },
      { success: true, message: 'Using mock data - Firebase not available' },
      'initializeApp'
    );
  },

  // Check Firebase status
  isFirebaseAvailable() {
    return firebaseAvailable && isFirebaseInitialized;
  },

  // Real-time subscriptions
  subscribeToServices(callback: (services: any[]) => void) {
    if (!shouldUseFirebase()) {
      callback(mockServices);
      return () => {}; // Return empty unsubscribe function
    }

    try {
      return FirestoreService.subscribeToCollection(
        COLLECTIONS.SERVICES,
        (services) => {
          callback(services.map(convertFirebaseService));
        },
        [orderBy('priority', 'desc'), orderBy('name', 'asc')]
      );
    } catch (error) {
      console.warn('Failed to subscribe to services, using mock data:', error);
      callback(mockServices);
      return () => {};
    }
  },

  subscribeToNotifications(callback: (notifications: any[]) => void) {
    if (!shouldUseFirebase()) {
      callback(mockNotifications);
      return () => {};
    }

    try {
      return FirestoreService.subscribeToCollection(
        COLLECTIONS.NOTIFICATIONS,
        (notifications) => {
          callback(notifications.map(convertFirebaseNotification));
        },
        [orderBy('timestamp', 'desc')]
      );
    } catch (error) {
      console.warn('Failed to subscribe to notifications, using mock data:', error);
      callback(mockNotifications);
      return () => {};
    }
  }
};