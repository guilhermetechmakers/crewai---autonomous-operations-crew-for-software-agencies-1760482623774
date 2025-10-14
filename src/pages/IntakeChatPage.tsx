import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, ArrowLeft, FileText, CheckCircle, Clock } from 'lucide-react';

export default function IntakeChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      content: "Hi! I'm your Intake Agent. I'm here to help qualify your project requirements and generate a proposal. Let's start with some basic information about your project.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        id: messages.length + 2,
        type: 'agent',
        content: "Thank you for that information. I'm analyzing your requirements and will generate a comprehensive proposal. Let me ask a few more questions to ensure I capture everything correctly.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="mr-4 p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold gradient-text">CrewAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Intake Agent Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Intake Agent</h3>
                    <p className="text-sm text-muted-foreground">Qualifying your project requirements</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Lead Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Lead Summary */}
              <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up">
                <h3 className="text-lg font-semibold text-foreground mb-4">Lead Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="text-foreground">TechCorp Solutions</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Project Type</label>
                    <p className="text-foreground">E-commerce Platform</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                    <p className="text-foreground">$50,000 - $100,000</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timeline</label>
                    <p className="text-foreground">3-6 months</p>
                  </div>
                </div>
              </div>

              {/* Generated Proposal */}
              <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Proposal</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded-full">
                    Ready
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-generated proposal based on your requirements
                </p>
                <button className="w-full btn-secondary flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" />
                  View Proposal
                </button>
              </div>

              {/* Next Steps */}
              <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up">
                <h3 className="text-lg font-semibold text-foreground mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">Requirements gathered</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">Proposal generated</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Awaiting client review</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">E-signature pending</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  Send Proposal to Client
                </button>
                <button className="w-full btn-secondary">
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
