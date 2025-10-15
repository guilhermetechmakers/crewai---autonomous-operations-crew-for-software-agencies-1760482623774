import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
// import { clientPortalApi } from '@/api/auth';
import { 
  Calendar, 
  Download, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Image,
  Code,
  Presentation,
  ExternalLink,
  LogOut
} from 'lucide-react';
import type { ClientPortalProject } from '@/types';

export default function ClientPortalDashboardPage() {
  const navigate = useNavigate();
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  // Check if user has access token
  useEffect(() => {
    const token = localStorage.getItem('client_portal_token');
    if (!token) {
      navigate('/client-portal/invitation');
    }
  }, [navigate]);

  // Mock project data - in real app, this would come from API
  const { data: project, isLoading } = useQuery({
    queryKey: ['client-portal-project'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: '1',
        name: 'E-commerce Platform',
        description: 'Modern e-commerce solution with React and Node.js',
        status: 'active' as const,
        client_id: 'client-1',
        milestones: [
          {
            id: '1',
            title: 'Project Setup & Planning',
            description: 'Initial project setup and planning phase',
            status: 'completed' as const,
            due_date: '2024-01-15',
            completed_at: '2024-01-14',
            deliverables: ['1', '2'],
            progress_percentage: 100,
          },
          {
            id: '2',
            title: 'UI/UX Design',
            description: 'Create wireframes and design mockups',
            status: 'in_progress' as const,
            due_date: '2024-02-15',
            deliverables: ['3', '4'],
            progress_percentage: 75,
          },
          {
            id: '3',
            title: 'Frontend Development',
            description: 'Build React frontend components',
            status: 'upcoming' as const,
            due_date: '2024-03-15',
            deliverables: ['5'],
            progress_percentage: 0,
          },
          {
            id: '4',
            title: 'Backend Development',
            description: 'Develop Node.js API and database',
            status: 'upcoming' as const,
            due_date: '2024-04-15',
            deliverables: ['6', '7'],
            progress_percentage: 0,
          },
        ],
        deliverables: [
          {
            id: '1',
            title: 'Project Requirements Document',
            description: 'Detailed project requirements and specifications',
            type: 'document' as const,
            status: 'approved' as const,
            file_url: '/files/requirements.pdf',
            file_size: 1024000,
            uploaded_at: '2024-01-10',
            approved_at: '2024-01-12',
            milestone_id: '1',
          },
          {
            id: '2',
            title: 'Technical Architecture',
            description: 'System architecture and technology stack',
            type: 'document' as const,
            status: 'approved' as const,
            file_url: '/files/architecture.pdf',
            file_size: 2048000,
            uploaded_at: '2024-01-12',
            approved_at: '2024-01-14',
            milestone_id: '1',
          },
          {
            id: '3',
            title: 'Wireframes',
            description: 'Low-fidelity wireframes for all pages',
            type: 'design' as const,
            status: 'ready_for_review' as const,
            file_url: '/files/wireframes.pdf',
            file_size: 5120000,
            uploaded_at: '2024-01-20',
            milestone_id: '2',
          },
          {
            id: '4',
            title: 'Design Mockups',
            description: 'High-fidelity design mockups',
            type: 'design' as const,
            status: 'draft' as const,
            milestone_id: '2',
          },
        ],
        created_at: '2024-01-01',
        updated_at: '2024-01-20',
      } as ClientPortalProject;
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('client_portal_token');
    navigate('/client-portal/invitation');
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'upcoming':
        return 'bg-gray-500';
      case 'overdue':
        return 'bg-red-500';
      case 'approved':
        return 'bg-green-500';
      case 'ready_for_review':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      case 'rejected':
        return 'bg-red-500';
      case 'revision_requested':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'design':
        return <Image className="h-4 w-4" />;
      case 'code':
        return <Code className="h-4 w-4" />;
      case 'presentation':
        return <Presentation className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
            <p className="text-slate-300 mb-4">Unable to load project data.</p>
            <Button onClick={() => navigate('/client-portal/invitation')} variant="outline">
              Return to Invitation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredDeliverables = selectedMilestone 
    ? project.deliverables.filter(d => d.milestone_id === selectedMilestone)
    : project.deliverables;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <p className="text-slate-300 mt-1">{project.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant={project.status === 'active' ? 'success' : 'secondary'}
                className="text-sm"
              >
                {getStatusText(project.status)}
              </Badge>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Project Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Total Milestones</p>
                  <p className="text-2xl font-bold text-white">{project.milestones.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {project.milestones.filter(m => m.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Deliverables</p>
                  <p className="text-2xl font-bold text-white">{project.deliverables.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Milestones */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Project Milestones</CardTitle>
              <CardDescription className="text-slate-300">
                Track project progress and upcoming deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedMilestone === milestone.id
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedMilestone(
                    selectedMilestone === milestone.id ? null : milestone.id
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{milestone.title}</h4>
                      <p className="text-slate-300 text-sm mt-1">{milestone.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(milestone.status)}`} />
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(milestone.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Progress</span>
                      <span className="text-white">{milestone.progress_percentage}%</span>
                    </div>
                    <Progress 
                      value={milestone.progress_percentage} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center text-slate-300">
                      <Clock className="h-4 w-4 mr-1" />
                      Due: {new Date(milestone.due_date).toLocaleDateString()}
                    </div>
                    {milestone.completed_at && (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed: {new Date(milestone.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Deliverables</CardTitle>
              <CardDescription className="text-slate-300">
                {selectedMilestone 
                  ? `Deliverables for selected milestone`
                  : 'All project deliverables'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredDeliverables.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300">No deliverables found</p>
                </div>
              ) : (
                filteredDeliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="p-4 rounded-lg border bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-slate-400 mt-1">
                          {getDeliverableIcon(deliverable.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{deliverable.title}</h4>
                          <p className="text-slate-300 text-sm mt-1">{deliverable.description}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={deliverable.status === 'approved' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {getStatusText(deliverable.status)}
                      </Badge>
                    </div>

                    {deliverable.file_url && (
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <div className="flex items-center text-slate-300">
                          <span>Size: {formatFileSize(deliverable.file_size || 0)}</span>
                          {deliverable.uploaded_at && (
                            <span className="ml-4">
                              Uploaded: {new Date(deliverable.uploaded_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}

                    {deliverable.feedback && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-300 text-sm">
                          <strong>Feedback:</strong> {deliverable.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Communication Section */}
        <Card className="mt-8 backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription className="text-slate-300">
              Stay connected with your development team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-white font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Request Update
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-medium">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                    <div>
                      <p className="text-white text-sm">Project Requirements Document approved</p>
                      <p className="text-slate-400 text-xs">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
                    <div>
                      <p className="text-white text-sm">Wireframes uploaded for review</p>
                      <p className="text-slate-400 text-xs">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
                    <div>
                      <p className="text-white text-sm">Project kickoff meeting completed</p>
                      <p className="text-slate-400 text-xs">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}