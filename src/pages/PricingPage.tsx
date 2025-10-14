import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Bot, Zap, BarChart3 } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 projects',
      'Basic AI agents (Intake, PM)',
      'Email support',
      'Standard integrations',
      'Basic analytics',
      '1 workspace',
      'Up to 5 team members'
    ],
    limitations: [
      'No custom branding',
      'Limited agent customization',
      'Basic reporting only'
    ],
    popular: false,
    cta: 'Start Free Trial',
    href: '/signup?plan=starter'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Best for growing agencies and teams',
    features: [
      'Unlimited projects',
      'All AI agents (6 specialized agents)',
      'Priority support',
      'All integrations',
      'Advanced analytics & reporting',
      'Custom branding',
      'Unlimited workspaces',
      'Up to 25 team members',
      'Advanced agent customization',
      'API access',
      'Webhook support'
    ],
    limitations: [],
    popular: true,
    cta: 'Start Free Trial',
    href: '/signup?plan=professional'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with advanced needs',
    features: [
      'Everything in Professional',
      'Dedicated support manager',
      'Custom integrations',
      'SSO & SAML',
      'Advanced security controls',
      'Custom agent training',
      'On-premise deployment option',
      'Unlimited team members',
      'Custom SLA',
      'White-label options',
      'Dedicated infrastructure'
    ],
    limitations: [],
    popular: false,
    cta: 'Contact Sales',
    href: '/contact'
  }
];

const features = [
  {
    category: 'AI Agents',
    items: [
      { name: 'Intake Agent', description: 'Automated lead qualification and proposal generation' },
      { name: 'Spin-Up Agent', description: 'Automated repo provisioning and environment setup' },
      { name: 'PM Agent', description: 'Intelligent sprint planning and task management' },
      { name: 'Launch Agent', description: 'Automated QA, deployment, and release management' },
      { name: 'Handover Agent', description: 'Professional project handover and documentation' },
      { name: 'Support Agent', description: 'AI-powered customer support and ticket management' }
    ]
  },
  {
    category: 'Integrations',
    items: [
      { name: 'Git Providers', description: 'GitHub, GitLab, Bitbucket' },
      { name: 'Deployment', description: 'Vercel, Cloudflare, AWS, Azure' },
      { name: 'Communication', description: 'Slack, Microsoft Teams, Discord' },
      { name: 'Project Management', description: 'Jira, Asana, Linear, Notion' },
      { name: 'Billing', description: 'Stripe, PayPal, QuickBooks' },
      { name: 'Documentation', description: 'Confluence, Notion, GitBook' }
    ]
  },
  {
    category: 'Analytics & Reporting',
    items: [
      { name: 'Project Metrics', description: 'Cycle time, velocity, and delivery tracking' },
      { name: 'Agent Performance', description: 'AI agent effectiveness and optimization' },
      { name: 'Team Productivity', description: 'Individual and team performance insights' },
      { name: 'Client Satisfaction', description: 'NPS scores and feedback analysis' },
      { name: 'Custom Dashboards', description: 'Build custom analytics dashboards' },
      { name: 'Export & API', description: 'Export data and access via API' }
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold gradient-text">CrewAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Simple, Transparent Pricing</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Choose the plan that fits your agency. All plans include our core AI agents and can be upgraded anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "gradient" : "outline"}
                    asChild
                  >
                    <Link to={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform includes all the tools and integrations you need to run a successful software agency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {categoryIndex === 0 && <Bot className="h-5 w-5 text-primary" />}
                    {categoryIndex === 1 && <Zap className="h-5 w-5 text-primary" />}
                    {categoryIndex === 2 && <BarChart3 className="h-5 w-5 text-primary" />}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about CrewAI pricing
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! All plans come with a 14-day free trial. No credit card required to get started."
              },
              {
                question: "What happens if I exceed my plan limits?",
                answer: "We'll notify you when you're approaching your limits. You can upgrade your plan or purchase additional capacity as needed."
              },
              {
                question: "Do you offer custom enterprise plans?",
                answer: "Yes, we offer custom enterprise plans with dedicated support, custom integrations, and on-premise deployment options."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and can arrange invoicing for enterprise customers."
              }
            ].map((faq, index) => (
              <Card key={index} className="animate-fade-in-up">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Agency?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of agencies already using CrewAI to automate their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="btn-primary text-lg px-8 py-4 inline-flex items-center"
            >
              Start Free Trial
            </Link>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">CrewAI</span>
              </div>
              <p className="text-muted-foreground">
                AI-powered operations platform for software agencies
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 CrewAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}