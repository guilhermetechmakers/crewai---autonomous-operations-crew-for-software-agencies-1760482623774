import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Download, 
  CheckCircle,
  User,
  Building,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  FileText,
  ArrowRight
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  score: number;
  source: string;
  status: 'new' | 'qualified' | 'proposal_sent' | 'signed' | 'lost';
  budget?: number;
  timeline?: string;
  requirements: string[];
  createdAt: Date;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'agent',
    content: "Hello! I'm the CrewAI Intake Agent. I'm here to help qualify your project requirements and generate a tailored proposal. Let's start with some basic information about your company and project.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: '2',
    type: 'user',
    content: "Hi! We're TechFlow, a growing startup. We need help building a customer portal for our SaaS product.",
    timestamp: new Date(Date.now() - 1000 * 60 * 4)
  },
  {
    id: '3',
    type: 'agent',
    content: "Great! A customer portal is a perfect project for our team. To create the best proposal for you, I need to understand more about your requirements. What key features do you envision for this portal?",
    timestamp: new Date(Date.now() - 1000 * 60 * 3)
  },
  {
    id: '4',
    type: 'user',
    content: "We need user authentication, dashboard with analytics, billing management, and support ticket system. We're using React and Node.js for our current stack.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: '5',
    type: 'agent',
    content: "Excellent! I can see you have a clear vision and are already using modern technologies. What's your target timeline for this project, and do you have a budget range in mind?",
    timestamp: new Date(Date.now() - 1000 * 60 * 1)
  }
];

const mockLead: Lead = {
  id: '1',
  company: 'TechFlow',
  contact: 'Sarah Chen',
  email: 'sarah@techflow.com',
  phone: '+1 (555) 123-4567',
  score: 85,
  source: 'Website',
  status: 'qualified',
  budget: 50000,
  timeline: '3-4 months',
  requirements: [
    'User authentication system',
    'Analytics dashboard',
    'Billing management',
    'Support ticket system',
    'React/Node.js stack'
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 10)
};

export default function IntakeChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lead] = useState<Lead>(mockLead);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "Thank you for that information! I'm processing your requirements and will generate a comprehensive proposal shortly. Based on what you've shared, this looks like a great fit for our team.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-500';
      case 'qualified': return 'bg-green-500/20 text-green-500';
      case 'proposal_sent': return 'bg-yellow-500/20 text-yellow-500';
      case 'signed': return 'bg-purple-500/20 text-purple-500';
      case 'lost': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Intake Chat</h1>
            <p className="text-muted-foreground">AI-powered lead qualification and proposal generation</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </Button>
            <Button variant="gradient">
              <FileText className="h-4 w-4 mr-2" />
              Generate Proposal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Intake Agent</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Online • Specialized in lead qualification
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Lead Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead Summary</CardTitle>
                <CardDescription>Qualification progress and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Qualification Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${lead.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>
                      {lead.score}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{lead.company}</p>
                      <p className="text-xs text-muted-foreground">Company</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{lead.contact}</p>
                      <p className="text-xs text-muted-foreground">Contact Person</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{lead.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>

                  {lead.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{lead.phone}</p>
                        <p className="text-xs text-muted-foreground">Phone</p>
                      </div>
                    </div>
                  )}

                  {lead.budget && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">${lead.budget.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Budget</p>
                      </div>
                    </div>
                  )}

                  {lead.timeline && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{lead.timeline}</p>
                        <p className="text-xs text-muted-foreground">Timeline</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requirements</CardTitle>
                <CardDescription>Key features identified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lead.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="gradient">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Proposal
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Lead Data
                </Button>
                <Button className="w-full" variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Schedule Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}