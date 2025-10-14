// Core types for CrewAI platform

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'client';
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  domain?: string;
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceSettings {
  theme: 'dark' | 'light';
  timezone: string;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  slack: boolean;
  teams: boolean;
}

export interface IntegrationSettings {
  github?: IntegrationConfig;
  vercel?: IntegrationConfig;
  slack?: IntegrationConfig;
  teams?: IntegrationConfig;
}

export interface IntegrationConfig {
  connected: boolean;
  config: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  client_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'ready' | 'in_progress' | 'qa' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  story_points?: number;
  assignee_id?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  type: 'intake' | 'spin_up' | 'pm' | 'launch' | 'handover' | 'support';
  status: 'active' | 'inactive' | 'error';
  last_activity: string;
  config: AgentConfig;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  user_id: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}

// OAuth and SSO Types
export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'microsoft';
  provider_id: string;
}

export interface OAuthCallbackResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  requires_signup?: boolean;
}

export interface SSOConfig {
  google: {
    client_id: string;
    enabled: boolean;
  };
  github: {
    client_id: string;
    enabled: boolean;
  };
  microsoft: {
    client_id: string;
    tenant_id: string;
    enabled: boolean;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Project Spin-Up Types
export interface ProjectSpinUp {
  id: string;
  name: string;
  description: string;
  client_id: string;
  workspace_id: string;
  status: 'draft' | 'configuring' | 'provisioning' | 'completed' | 'failed';
  configuration: SpinUpConfiguration;
  created_at: string;
  updated_at: string;
}

export interface SpinUpConfiguration {
  repository: RepositoryConfig;
  environment: EnvironmentConfig;
  infrastructure: InfrastructureConfig;
  integrations: IntegrationConfig[];
  deployment: DeploymentConfig;
}

export interface RepositoryConfig {
  name: string;
  description: string;
  visibility: 'public' | 'private';
  template?: string;
  framework: 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
  package_manager: 'npm' | 'yarn' | 'pnpm';
  features: string[];
}

export interface EnvironmentConfig {
  name: string;
  type: 'development' | 'staging' | 'production';
  domain?: string;
  ssl_enabled: boolean;
  auto_deploy: boolean;
  environment_variables: Record<string, string>;
}

export interface InfrastructureConfig {
  provider: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure';
  region: string;
  tier: 'free' | 'pro' | 'enterprise';
  database: DatabaseConfig;
  storage: StorageConfig;
  monitoring: MonitoringConfig;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
  provider: 'supabase' | 'planetscale' | 'mongodb_atlas' | 'local';
  backup_enabled: boolean;
  scaling: 'auto' | 'manual';
}

export interface StorageConfig {
  type: 'local' | 's3' | 'cloudinary' | 'supabase_storage';
  provider?: string;
  cdn_enabled: boolean;
  optimization: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  provider: 'vercel_analytics' | 'google_analytics' | 'mixpanel' | 'custom';
  error_tracking: boolean;
  performance_monitoring: boolean;
}

export interface DeploymentConfig {
  strategy: 'manual' | 'auto' | 'scheduled';
  branch: string;
  preview_environments: boolean;
  rollback_enabled: boolean;
  health_checks: boolean;
}

export interface SpinUpStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  order: number;
  estimated_duration: number; // in minutes
  dependencies?: string[];
}

export interface SpinUpProgress {
  spinup_id: string;
  current_step: string;
  completed_steps: string[];
  total_steps: number;
  progress_percentage: number;
  estimated_completion: string;
  logs: SpinUpLog[];
}

export interface SpinUpLog {
  id: string;
  step_id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SpinUpTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web_app' | 'api' | 'mobile' | 'desktop' | 'fullstack';
  framework: string;
  features: string[];
  estimated_setup_time: number; // in minutes
  complexity: 'beginner' | 'intermediate' | 'advanced';
  preview_url?: string;
  repository_url?: string;
}

// Agent Orchestration Types
export interface AgentTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  agent_type: 'intake' | 'spin_up' | 'pm' | 'launch' | 'handover' | 'support';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  progress: number; // 0-100
  logs: AgentTaskLog[];
  created_at: string;
  updated_at: string;
}

export interface AgentTaskLog {
  id: string;
  task_id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface AgentSchedule {
  id: string;
  task_id: string;
  cron_expression: string;
  timezone: string;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentOrchestrationStatus {
  is_running: boolean;
  active_tasks: number;
  completed_tasks_today: number;
  failed_tasks_today: number;
  agents_status: Record<string, 'active' | 'inactive' | 'error'>;
  last_activity: string;
}

export interface CreateTaskRequest {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  agent_type: 'intake' | 'spin_up' | 'pm' | 'launch' | 'handover' | 'support';
  scheduled_at?: string;
  cron_expression?: string;
  timezone?: string;
}

export interface TaskExecutionResult {
  task_id: string;
  status: 'completed' | 'failed';
  result?: any;
  error?: string;
  execution_time: number; // in milliseconds
}
