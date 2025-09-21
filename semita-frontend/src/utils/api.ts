import { mockServices, mockComplaints, mockNotifications, mockInsights } from './mockData';

// In-memory storage for mock data (simulates database)
let servicesData = [...mockServices];
let complaintsData = [...mockComplaints];
let notificationsData = [...mockNotifications];

// Simulate API delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Services
  getServices: async () => {
    await delay();
    return { services: servicesData };
  },

  reportServiceIssue: async (serviceId: string, type: 'confirm' | 'issue') => {
    await delay();
    const service = servicesData.find(s => s.id === serviceId);
    if (service) {
      if (type === 'issue') {
        service.reportsCount += 1;
        service.status = 'issue';
        service.lastUpdate = 'Just now';
      } else {
        service.status = 'active';
        service.lastUpdate = 'Just now';
      }
    }
    return { success: true };
  },

  // Complaints
  getComplaints: async () => {
    await delay();
    return { complaints: complaintsData };
  },

  submitComplaint: async (complaint: {
    title: string;
    category: string;
    description: string;
    location: string;
  }) => {
    await delay();
    const newComplaint = {
      id: String(complaintsData.length + 1),
      ...complaint,
      status: 'open' as const,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      dateSubmitted: 'Just now',
      comments: []
    };
    complaintsData.unshift(newComplaint);
    return { success: true, complaint: newComplaint };
  },

  voteComplaint: async (complaintId: string, voteType: 'up' | 'down') => {
    await delay(100); // Reduced delay for faster response
    const complaint = complaintsData.find(c => c.id === complaintId);
    if (complaint) {
      // Remove previous vote if exists
      if (complaint.userVote === 'up') {
        complaint.upvotes -= 1;
      } else if (complaint.userVote === 'down') {
        complaint.downvotes -= 1;
      }
      
      // Apply new vote if different from current
      if (complaint.userVote !== voteType) {
        if (voteType === 'up') {
          complaint.upvotes += 1;
        } else {
          complaint.downvotes += 1;
        }
        complaint.userVote = voteType;
      } else {
        // Remove vote if clicking same button
        complaint.userVote = null;
      }
      
      // Ensure votes never go below 0
      complaint.upvotes = Math.max(0, complaint.upvotes);
      complaint.downvotes = Math.max(0, complaint.downvotes);
    }
    return { success: true };
  },

  addComment: async (complaintId: string, content: string) => {
    await delay();
    const complaint = complaintsData.find(c => c.id === complaintId);
    if (complaint) {
      const newComment = {
        id: `${complaintId}-${complaint.comments.length + 1}`,
        author: 'You', // In a real app, this would be the current user
        content,
        timestamp: 'Just now'
      };
      complaint.comments.push(newComment);
    }
    return { success: true };
  },

  // Notifications
  getNotifications: async () => {
    await delay();
    return { notifications: notificationsData };
  },

  markNotificationRead: async (notificationId: string) => {
    await delay();
    const notification = notificationsData.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return { success: true };
  },

  markAllNotificationsRead: async () => {
    await delay();
    notificationsData.forEach(n => n.read = true);
    return { success: true };
  },

  // Insights
  getInsights: async () => {
    await delay();
    return { insights: mockInsights };
  }
};