// Mock data for when server is not available
export const mockServices = [
  {
    id: 'electricity',
    name: 'Electricity',
    status: 'active',
    lastUpdate: '2 minutes ago',
    description: 'Power supply is stable across all blocks',
    reportsCount: 3,
    icon: 'Zap'
  },
  {
    id: 'water',
    name: 'Water Supply',
    status: 'issue',
    lastUpdate: '15 minutes ago',
    description: 'Low pressure reported in Block B',
    reportsCount: 8,
    icon: 'Droplets'
  },
  {
    id: 'garbage',
    name: 'Garbage Collection',
    status: 'active',
    lastUpdate: '1 hour ago',
    description: 'Morning collection completed successfully',
    reportsCount: 1,
    icon: 'Trash2'
  },
  {
    id: 'security',
    name: 'Security',
    status: 'active',
    lastUpdate: '5 minutes ago',
    description: 'All guards on duty, gates functioning',
    reportsCount: 0,
    icon: 'Shield'
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    status: 'maintenance',
    lastUpdate: '30 minutes ago',
    description: 'Elevator servicing in Block A - ongoing',
    reportsCount: 5,
    icon: 'Wrench'
  }
];

export const mockComplaints = [
  {
    id: '1',
    title: 'Streetlight not working on Main Road',
    category: 'Infrastructure',
    description: 'The streetlight near the main gate has been flickering and went out completely yesterday night.',
    status: 'open',
    upvotes: 127,
    downvotes: 23,
    userVote: null,
    dateSubmitted: '2 days ago',
    location: 'Block A - Main Gate',
    comments: [
      {
        id: '1-1',
        author: 'Resident A',
        content: 'I noticed this too. It makes the area unsafe at night.',
        timestamp: '1 day ago'
      },
      {
        id: '1-2',
        author: 'Resident B',
        content: 'Management should prioritize this - it\'s a security concern.',
        timestamp: '18 hours ago'
      }
    ]
  },
  {
    id: '2',
    title: 'Water pressure very low in morning hours',
    category: 'Water Supply',
    description: 'Between 6-8 AM, water pressure is extremely low on the 3rd floor. Difficult to fill buckets.',
    status: 'in-progress',
    upvotes: 89,
    downvotes: 7,
    userVote: 'up',
    dateSubmitted: '1 day ago',
    location: 'Block B - Floor 3',
    comments: [
      {
        id: '2-1',
        author: 'Resident C',
        content: 'Same issue on 4th floor. Plumber is coming tomorrow.',
        timestamp: '12 hours ago'
      }
    ]
  },
  {
    id: '3',
    title: 'Elevator making unusual noise',
    category: 'Maintenance',
    description: 'The elevator in Block C makes a grinding noise when going up. Might need immediate attention.',
    status: 'resolved',
    upvotes: 156,
    downvotes: 18,
    userVote: null,
    dateSubmitted: '3 days ago',
    location: 'Block C - Elevator',
    comments: [
      {
        id: '3-1',
        author: 'Maintenance Team',
        content: 'Issue has been resolved. Replaced worn-out cables. Please report if you notice any further problems.',
        timestamp: '6 hours ago'
      }
    ]
  },
  {
    id: '4',
    title: 'Parking space allocation unfair',
    category: 'Infrastructure',
    description: 'Some residents are taking up multiple parking spots while others have none. Need better enforcement.',
    status: 'open',
    upvotes: 234,
    downvotes: 45,
    userVote: null,
    dateSubmitted: '5 days ago',
    location: 'Parking Area - All Blocks',
    comments: [
      {
        id: '4-1',
        author: 'Resident D',
        content: 'Completely agree. I\'ve been driving around for 30 minutes yesterday looking for a spot.',
        timestamp: '2 days ago'
      }
    ]
  },
  {
    id: '5',
    title: 'Gym equipment needs maintenance',
    category: 'Maintenance',
    description: 'The treadmill in the community gym has been making strange noises and the elliptical is completely broken.',
    status: 'in-progress',
    upvotes: 67,
    downvotes: 12,
    userVote: null,
    dateSubmitted: '1 week ago',
    location: 'Community Gym',
    comments: []
  }
];

export const mockNotifications = [
  {
    id: '1',
    type: 'warning',
    title: 'Water Pressure Issue',
    message: 'Low water pressure reported in Block B. Maintenance team has been notified.',
    timestamp: '15 minutes ago',
    read: false,
    actionRequired: false
  },
  {
    id: '2',
    type: 'info',
    title: 'Scheduled Maintenance',
    message: 'Elevator maintenance in Block A will begin at 2 PM today. Please use stairs.',
    timestamp: '1 hour ago',
    read: false,
    actionRequired: false
  },
  {
    id: '3',
    type: 'success',
    title: 'Issue Resolved',
    message: 'Streetlight near main gate has been fixed. Thank you for reporting!',
    timestamp: '2 hours ago',
    read: true,
    actionRequired: false
  }
];

export const mockInsights = {
  metrics: {
    activeIssues: 3,
    totalComplaints: 5,
    openComplaints: 2,
    resolutionRate: 60,
    avgResponseTime: '2.3 hrs'
  },
  categoryBreakdown: {
    'Infrastructure': 35,
    'Water Supply': 25,
    'Maintenance': 20,
    'Security': 12,
    'Other': 8
  },
  serviceOutages: [
    { service: 'Electricity', outages: 3, avgDuration: '45 min' },
    { service: 'Water', outages: 8, avgDuration: '2.5 hrs' },
    { service: 'Internet', outages: 2, avgDuration: '15 min' },
    { service: 'Maintenance', outages: 5, avgDuration: '3 hrs' }
  ],
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