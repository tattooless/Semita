
import { Badge } from "./ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../utils/api";

export function CommunityInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await api.getInsights();
      setInsights(response.insights);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load insights. Please try again later.</p>
      </div>
    );
  }
  const outageData = insights.serviceOutages || [];

  const complaintCategories = Object.entries(insights.categoryBreakdown || {}).map(([name, value], index) => ({
    name,
    value: value as number,
    color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'][index % 5]
  }));

  const weeklyTrends = insights.weeklyTrends || [];

  const keyMetrics = [
    { 
      title: 'Active Issues', 
      value: insights.metrics?.activeIssues?.toString() || '0', 
      change: 'Real-time data', 
      trend: 'neutral', 
      icon: AlertTriangle 
    },
    { 
      title: 'Total Complaints', 
      value: insights.metrics?.totalComplaints?.toString() || '0', 
      change: `${insights.metrics?.openComplaints || 0} open`, 
      trend: 'neutral', 
      icon: Clock 
    },
    { 
      title: 'Resolution Rate', 
      value: `${insights.metrics?.resolutionRate || 0}%`, 
      change: 'Calculated from data', 
      trend: insights.metrics?.resolutionRate > 80 ? 'up' : 'down', 
      icon: CheckCircle 
    },
    { 
      title: 'Avg Response Time', 
      value: insights.metrics?.avgResponseTime || 'N/A', 
      change: 'Estimated', 
      trend: 'neutral', 
      icon: TrendingUp 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-dark-title">Community Insights</h2>
        <p className="text-muted-foreground">Analytics and trends for your neighborhood</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="gradient-card p-3 sm:p-4 rounded-lg">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                  </div>
                  <IconComponent className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  <Badge 
                    variant={metric.trend === 'up' ? 'default' : 'secondary'}
                    className={metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                  >
                    {metric.change}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Outages */}
      
        
      </div>

      {/* Weekly Trends */}
      

      {/* Service Performance Table */}
      <div className="gradient-card p-3 sm:p-4 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg text-foreground">Service Performance Summary</h3>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Service</th>
                  <th className="text-left py-3">Outages (30d)</th>
                  <th className="text-left py-3">Avg Duration</th>
                  <th className="text-left py-3">Reliability</th>
                </tr>
              </thead>
              <tbody>
                {outageData.map((service, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">{service.service}</td>
                    <td className="py-3">{service.outages}</td>
                    <td className="py-3">{service.avgDuration}</td>
                    <td className="py-3">
                      <Badge 
                        variant={service.outages <= 3 ? 'default' : 'destructive'}
                        className={service.outages <= 3 ? 'bg-green-100 text-green-800' : ''}
                      >
                        {service.outages <= 3 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="gradient-card p-3 sm:p-4 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg text-foreground">Recommendations</h3>
        </div>
        <div>
          <div className="space-y-3">
            <div className="gradient-card-solid p-3 border border-card-border rounded-md">
              <p className="text-sm text-foreground">
                <strong className="text-blue-400">Water Supply:</strong> Consider installing backup water storage. Peak issues occur between 6-8 AM.
              </p>
            </div>
            <div className="gradient-card-solid p-3 border border-card-border rounded-md">
              <p className="text-sm text-foreground">
                <strong className="text-yellow-400">Maintenance:</strong> Schedule preventive elevator maintenance to reduce emergency repairs.
              </p>
            </div>
            <div className="gradient-card-solid p-3 border border-card-border rounded-md">
              <p className="text-sm text-foreground">
                <strong className="text-green-400">Security:</strong> Current performance is excellent. Consider sharing best practices with neighboring communities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}