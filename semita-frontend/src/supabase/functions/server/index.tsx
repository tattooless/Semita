import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: ['*'],
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Get all services status
app.get('/make-server-bb8f3b55/services', async (c) => {
  try {
    const services = await kv.getByPrefix('service:');
    const formattedServices = services.map(service => ({
      id: service.key.replace('service:', ''),
      ...service.value
    }));
    
    return c.json({ services: formattedServices });
  } catch (error) {
    console.log('Error fetching services:', error);
    return c.json({ error: 'Failed to fetch services' }, 500);
  }
});

// Update service status
app.post('/make-server-bb8f3b55/services/:serviceId/status', async (c) => {
  try {
    const serviceId = c.req.param('serviceId');
    const { status, description, reportedBy } = await c.req.json();
    const timestamp = new Date().toISOString();
    
    // Get current service data
    const currentService = await kv.get(`service:${serviceId}`);
    const serviceData = currentService || {};
    
    // Update service status
    const updatedService = {
      ...serviceData,
      name: serviceData.name || serviceId,
      status,
      description,
      lastUpdate: new Date().toLocaleString(),
      lastUpdateTimestamp: timestamp,
      reportsCount: (serviceData.reportsCount || 0) + 1,
      reportedBy,
      icon: serviceData.icon || 'default'
    };
    
    await kv.set(`service:${serviceId}`, updatedService);
    
    // Create notification for status change
    const notificationId = `notif:${Date.now()}`;
    const notification = {
      type: status === 'outage' ? 'alert' : status === 'issue' ? 'warning' : 'info',
      title: `${serviceData.name || serviceId} Status Update`,
      message: description,
      timestamp: new Date().toLocaleString(),
      read: false,
      serviceId
    };
    
    await kv.set(notificationId, notification);
    
    return c.json({ success: true, service: updatedService });
  } catch (error) {
    console.log('Error updating service status:', error);
    return c.json({ error: 'Failed to update service status' }, 500);
  }
});

// Get all complaints
app.get('/make-server-bb8f3b55/complaints', async (c) => {
  try {
    const complaints = await kv.getByPrefix('complaint:');
    const formattedComplaints = complaints.map(complaint => ({
      id: complaint.key.replace('complaint:', ''),
      ...complaint.value
    }));
    
    // Sort by date (newest first)
    formattedComplaints.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
    
    return c.json({ complaints: formattedComplaints });
  } catch (error) {
    console.log('Error fetching complaints:', error);
    return c.json({ error: 'Failed to fetch complaints' }, 500);
  }
});

// Submit new complaint
app.post('/make-server-bb8f3b55/complaints', async (c) => {
  try {
    const complaintData = await c.req.json();
    const complaintId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    const complaint = {
      ...complaintData,
      id: complaintId,
      status: 'open',
      upvotes: 0,
      dateSubmitted: new Date().toLocaleString(),
      timestamp,
      hasUpvoted: false
    };
    
    await kv.set(`complaint:${complaintId}`, complaint);
    
    // Create notification for new complaint
    const notificationId = `notif:${Date.now()}`;
    const notification = {
      type: 'info',
      title: 'New Complaint Submitted',
      message: `${complaint.title} - ${complaint.category}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      complaintId
    };
    
    await kv.set(notificationId, notification);
    
    return c.json({ success: true, complaint });
  } catch (error) {
    console.log('Error submitting complaint:', error);
    return c.json({ error: 'Failed to submit complaint' }, 500);
  }
});

// Upvote complaint
app.post('/make-server-bb8f3b55/complaints/:complaintId/upvote', async (c) => {
  try {
    const complaintId = c.req.param('complaintId');
    const { userId } = await c.req.json();
    
    const complaint = await kv.get(`complaint:${complaintId}`);
    if (!complaint) {
      return c.json({ error: 'Complaint not found' }, 404);
    }
    
    // Check if user already upvoted
    const upvoteKey = `upvote:${complaintId}:${userId}`;
    const existingUpvote = await kv.get(upvoteKey);
    
    if (existingUpvote) {
      return c.json({ error: 'Already upvoted' }, 400);
    }
    
    // Add upvote
    await kv.set(upvoteKey, { userId, timestamp: new Date().toISOString() });
    
    // Update complaint upvote count
    complaint.upvotes = (complaint.upvotes || 0) + 1;
    await kv.set(`complaint:${complaintId}`, complaint);
    
    return c.json({ success: true, upvotes: complaint.upvotes });
  } catch (error) {
    console.log('Error upvoting complaint:', error);
    return c.json({ error: 'Failed to upvote complaint' }, 500);
  }
});

// Get notifications
app.get('/make-server-bb8f3b55/notifications', async (c) => {
  try {
    const notifications = await kv.getByPrefix('notif:');
    const formattedNotifications = notifications.map(notif => ({
      id: notif.key.replace('notif:', ''),
      ...notif.value
    }));
    
    // Sort by timestamp (newest first)
    formattedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json({ notifications: formattedNotifications });
  } catch (error) {
    console.log('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notification as read
app.post('/make-server-bb8f3b55/notifications/:notificationId/read', async (c) => {
  try {
    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(`notif:${notificationId}`);
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }
    
    notification.read = true;
    await kv.set(`notif:${notificationId}`, notification);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// Get community insights/analytics
app.get('/make-server-bb8f3b55/insights', async (c) => {
  try {
    // Get all services and complaints for analytics
    const services = await kv.getByPrefix('service:');
    const complaints = await kv.getByPrefix('complaint:');
    
    // Calculate metrics
    const totalIssues = services.filter(s => s.value.status === 'issue' || s.value.status === 'outage').length;
    const totalComplaints = complaints.length;
    const openComplaints = complaints.filter(c => c.value.status === 'open').length;
    const resolvedComplaints = complaints.filter(c => c.value.status === 'resolved').length;
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
    
    // Complaint categories
    const categories = {};
    complaints.forEach(c => {
      const category = c.value.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    // Service outages (mock data for now)
    const serviceOutages = services.map(s => ({
      service: s.value.name || s.key.replace('service:', ''),
      outages: Math.floor(Math.random() * 10) + 1,
      avgDuration: `${Math.floor(Math.random() * 3) + 1} hrs`
    }));
    
    const insights = {
      metrics: {
        activeIssues: totalIssues,
        totalComplaints,
        openComplaints,
        resolutionRate,
        avgResponseTime: '2.3 hrs' // Mock data
      },
      categoryBreakdown: categories,
      serviceOutages,
      weeklyTrends: [
        { day: 'Mon', issues: 4, resolved: 6 },
        { day: 'Tue', issues: 3, resolved: 4 },
        { day: 'Wed', issues: 6, resolved: 3 },
        { day: 'Thu', issues: 2, resolved: 5 },
        { day: 'Fri', issues: 5, resolved: 4 },
        { day: 'Sat', issues: 1, resolved: 2 },
        { day: 'Sun', issues: 2, resolved: 3 }
      ]
    };
    
    return c.json(insights);
  } catch (error) {
    console.log('Error fetching insights:', error);
    return c.json({ error: 'Failed to fetch insights' }, 500);
  }
});

// Initialize default services
app.post('/make-server-bb8f3b55/init', async (c) => {
  try {
    const defaultServices = [
      {
        id: 'electricity',
        name: 'Electricity',
        status: 'active',
        description: 'Power supply is stable across all blocks',
        lastUpdate: new Date().toLocaleString(),
        reportsCount: 0,
        icon: 'Zap'
      },
      {
        id: 'water',
        name: 'Water Supply',
        status: 'active',
        description: 'Water supply is normal',
        lastUpdate: new Date().toLocaleString(),
        reportsCount: 0,
        icon: 'Droplets'
      },
      {
        id: 'garbage',
        name: 'Garbage Collection',
        status: 'active',
        description: 'Collection schedule is on track',
        lastUpdate: new Date().toLocaleString(),
        reportsCount: 0,
        icon: 'Trash2'
      },
      {
        id: 'security',
        name: 'Security',
        status: 'active',
        description: 'All security measures are operational',
        lastUpdate: new Date().toLocaleString(),
        reportsCount: 0,
        icon: 'Shield'
      },
      {
        id: 'maintenance',
        name: 'Maintenance',
        status: 'active',
        description: 'No ongoing maintenance issues',
        lastUpdate: new Date().toLocaleString(),
        reportsCount: 0,
        icon: 'Wrench'
      }
    ];
    
    for (const service of defaultServices) {
      const existing = await kv.get(`service:${service.id}`);
      if (!existing) {
        await kv.set(`service:${service.id}`, service);
      }
    }
    
    return c.json({ success: true, message: 'Default services initialized' });
  } catch (error) {
    console.log('Error initializing services:', error);
    return c.json({ error: 'Failed to initialize services' }, 500);
  }
});

Deno.serve(app.fetch);