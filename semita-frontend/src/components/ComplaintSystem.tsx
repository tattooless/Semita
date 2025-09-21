import { useState, useEffect } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { ChevronUp, ChevronDown, MessageCircle, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";

import { Separator } from "./ui/separator";
import { api } from "../utils/api";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  dateSubmitted: string;
  location: string;
  comments: Comment[];
}

interface ComplaintSystemProps {
  onSubmitComplaint: (complaint: Omit<Complaint, 'id' | 'upvotes' | 'downvotes' | 'userVote' | 'dateSubmitted' | 'comments'>) => void;
}

export function ComplaintSystem({ onSubmitComplaint }: ComplaintSystemProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    status: 'open' as const
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchComplaints = async () => {
      if (!isMounted) return;
      
      try {
        const response = await api.getComplaints();
        if (isMounted) {
          setComplaints(response.complaints);
        }
      } catch (err) {
        console.error('Error fetching complaints:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComplaints();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Separate function for refreshing complaints
  const refreshComplaints = async () => {
    try {
      const response = await api.getComplaints();
      setComplaints(response.complaints);
    } catch (err) {
      console.error('Error refreshing complaints:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.category && formData.description) {
      setSubmitting(true);
      try {
        await api.submitComplaint(formData);
        await refreshComplaints(); // Refresh complaints
        onSubmitComplaint(formData);
        setFormData({ title: '', category: '', description: '', location: '', status: 'open' });
        setShowForm(false);
      } catch (err) {
        console.error('Error submitting complaint:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleVote = async (complaintId: string, voteType: 'up' | 'down') => {
    // Optimistic update for immediate feedback
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === complaintId) {
        const updatedComplaint = { ...complaint };
        
        // Remove previous vote if exists
        if (updatedComplaint.userVote === 'up') {
          updatedComplaint.upvotes -= 1;
        } else if (updatedComplaint.userVote === 'down') {
          updatedComplaint.downvotes -= 1;
        }
        
        // Apply new vote if different from current
        if (updatedComplaint.userVote !== voteType) {
          if (voteType === 'up') {
            updatedComplaint.upvotes += 1;
          } else {
            updatedComplaint.downvotes += 1;
          }
          updatedComplaint.userVote = voteType;
        } else {
          // Remove vote if clicking same button
          updatedComplaint.userVote = null;
        }
        
        // Ensure votes never go below 0
        updatedComplaint.upvotes = Math.max(0, updatedComplaint.upvotes);
        updatedComplaint.downvotes = Math.max(0, updatedComplaint.downvotes);
        
        return updatedComplaint;
      }
      return complaint;
    });
    
    // Update UI immediately
    setComplaints(updatedComplaints);
    
    try {
      // Sync with backend silently (no UI refresh to avoid conflicts)
      await api.voteComplaint(complaintId, voteType);
    } catch (err) {
      console.error('Error voting on complaint:', err);
      // Only revert on error by refreshing from server
      await refreshComplaints();
    }
  };

  const handleAddComment = async (complaintId: string) => {
    const content = commentTexts[complaintId]?.trim();
    if (!content) return;

    setSubmittingComment(complaintId);
    try {
      await api.addComment(complaintId, content);
      setCommentTexts({ ...commentTexts, [complaintId]: '' });
      await refreshComplaints(); // Refresh to get updated comments
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(null);
    }
  };

  const toggleComments = (complaintId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(complaintId)) {
      newExpanded.delete(complaintId);
    } else {
      newExpanded.add(complaintId);
    }
    setExpandedComments(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/20 text-red-300 border-red-400/50 backdrop-blur-sm';
      case 'in-progress':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/50 backdrop-blur-sm';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-400/50 backdrop-blur-sm';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/50 backdrop-blur-sm';
    }
  };

  const getNetScore = (complaint: Complaint) => {
    return complaint.upvotes - complaint.downvotes;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl text-dark-title">Community Complaints</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Report issues and track their resolution</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto gradient-primary">
          {showForm ? 'Cancel' : 'Submit Complaint'}
        </Button>
      </div>

      {showForm && (
        <div className="gradient-card p-3 sm:p-4 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg text-foreground">Submit New Complaint</h3>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-foreground">Complaint Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="glass-effect border-card-border"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="glass-effect border-card-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Water Supply">Water Supply</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Garbage Collection">Garbage Collection</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-2 text-foreground">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Specific location (e.g., Block A - Floor 2)"
                  className="glass-effect border-card-border"
                />
              </div>

              <div>
                <label className="block mb-2 text-foreground">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  className="glass-effect border-card-border"
                  required
                />
              </div>

              <Button type="submit" className="w-full gradient-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="gradient-card p-3 sm:p-4 rounded-lg border-blue-300/30 text-foreground flex items-start space-x-3">
        <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm">
          Complaints are visible to all residents and management. Please provide accurate information.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No complaints submitted yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Be the first to submit a complaint to help improve your community.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
          <div key={complaint.id} className="gradient-card p-3 sm:p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h3 className="mb-1 text-sm sm:text-base text-foreground">{complaint.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <Badge variant="outline" className="text-xs gradient-card-solid border-card-border">{complaint.category}</Badge>
                    <span>{complaint.location}</span>
                    <span>{complaint.dateSubmitted}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-start">
                  <div className={`px-2 py-1 rounded text-xs border flex items-center space-x-1 ${getStatusColor(complaint.status)}`}>
                    {getStatusIcon(complaint.status)}
                    <span className="capitalize">{complaint.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-4 text-foreground">{complaint.description}</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  {/* Voting Section */}
                  <div className="flex items-center gradient-card-solid rounded-lg p-1 border border-card-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(complaint.id, 'up')}
                      className={`h-8 px-2 transition-all ${complaint.userVote === 'up' ? 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30' : 'text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10'}`}
                    >
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    
                    <span className={`px-2 sm:px-3 text-xs sm:text-sm font-semibold min-w-[1.5rem] sm:min-w-[2rem] text-center ${getNetScore(complaint) > 0 ? 'text-orange-400' : getNetScore(complaint) < 0 ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {getNetScore(complaint)}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(complaint.id, 'down')}
                      className={`h-8 px-2 transition-all ${complaint.userVote === 'down' ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30' : 'text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10'}`}
                    >
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  {/* Comments Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(complaint.id)}
                    className="flex items-center space-x-1 text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{complaint.comments.length}</span>
                  </Button>
                </div>
                
                {complaint.status === 'resolved' && (
                  <Badge variant="default" className="bg-green-500/20 text-green-400 border border-green-400/50 text-xs">
                    Resolved
                  </Badge>
                )}
              </div>

              {/* Comments Section */}
              {expandedComments.has(complaint.id) && (
                <div className="space-y-3">
                  <Separator className="bg-card-border" />
                  
                  {/* Add Comment */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentTexts[complaint.id] || ''}
                      onChange={(e) => setCommentTexts({ ...commentTexts, [complaint.id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(complaint.id);
                        }
                      }}
                      className="glass-effect border-card-border"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(complaint.id)}
                      disabled={submittingComment === complaint.id || !commentTexts[complaint.id]?.trim()}
                      className="gradient-primary"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {complaint.comments.map((comment) => (
                      <div key={comment.id} className="gradient-card-solid rounded-lg p-3 border border-card-border hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-primary">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    ))}
                    
                    {complaint.comments.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
            ))
          )}
        </div>
      )}

      <div className="gradient-card p-3 sm:p-4 rounded-lg">
        <h3 className="mb-2 text-sm sm:text-base text-foreground">Complaint Guidelines</h3>
        <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
          <li>• Provide specific details and location for faster resolution</li>
          <li>• Use upvotes to prioritize community concerns</li>
          <li>• Add comments to share additional information or updates</li>
        </ul>
      </div>
    </div>
  );
}