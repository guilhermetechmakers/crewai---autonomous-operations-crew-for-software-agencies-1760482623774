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

export interface SimpleApiResponse<T> {
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
  provider?: 'google' | 'github' | 'microsoft';
  expires_in?: number;
  refresh_token?: string;
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

// Enhanced OAuth types
export interface OAuthInitiateRequest {
  provider: 'google' | 'github' | 'microsoft';
  redirect_uri: string;
  state: string;
}

export interface OAuthInitiateResponse {
  auth_url: string;
  state: string;
  provider: 'google' | 'github' | 'microsoft';
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  avatar_url?: string;
  verified_email?: boolean;
  provider: 'google' | 'github' | 'microsoft';
  provider_id: string;
}

export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
  state?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Auth API specific types
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
  refresh_token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  terms_accepted: boolean;
}

export interface RegisterResponse {
  user: User;
  token: string;
  expires_in: number;
  verification_required: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  reset_token?: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
  success: boolean;
}

// OAuth Provider Configuration
export interface OAuthProviderConfig {
  client_id: string;
  client_secret?: string;
  enabled: boolean;
  scopes: string[];
  redirect_uri: string;
  auth_url: string;
  token_url: string;
  user_info_url: string;
}

export interface GoogleOAuthConfig extends OAuthProviderConfig {
  tenant_id?: never;
}

export interface GitHubOAuthConfig extends OAuthProviderConfig {
  tenant_id?: never;
}

export interface MicrosoftOAuthConfig extends OAuthProviderConfig {
  tenant_id: string;
}

export type OAuthConfigMap = {
  google: GoogleOAuthConfig;
  github: GitHubOAuthConfig;
  microsoft: MicrosoftOAuthConfig;
};

// Session Management
export interface SessionInfo {
  user: User;
  token: string;
  expires_at: string;
  created_at: string;
  last_activity: string;
  device_info?: {
    user_agent: string;
    ip_address: string;
    location?: string;
  };
}

export interface SessionRefreshRequest {
  refresh_token: string;
}

export interface SessionRefreshResponse {
  token: string;
  expires_in: number;
  refresh_token?: string;
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

// Onboarding Types
export interface OnboardingData {
  id: string;
  user_id: string;
  workspace_id: string;
  company_info: CompanyInfo;
  tech_stack: TechStackSelection[];
  integrations: IntegrationSelection[];
  billing_plan: BillingPlanSelection;
  team_members: TeamMemberInvite[];
  preferences: UserPreferences;
  status: 'in_progress' | 'completed' | 'skipped';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CompanyInfo {
  name: string;
  size: '1-10' | '11-50' | '51-200' | '200+';
  industry?: string;
  website?: string;
  description?: string;
}

export interface TechStackSelection {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'deployment' | 'tools';
  description: string;
  icon?: string;
  selected: boolean;
}

export interface IntegrationSelection {
  provider: 'github' | 'gitlab' | 'bitbucket' | 'vercel' | 'cloudflare' | 'custom';
  type: 'git' | 'deployment' | 'monitoring' | 'communication';
  connected: boolean;
  config?: Record<string, any>;
}

export interface BillingPlanSelection {
  plan_id: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: string;
  period: string;
  features: string[];
  selected: boolean;
}

export interface TeamMemberInvite {
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  invited_at?: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  language: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  required: boolean;
  order: number;
}

export interface OnboardingProgress {
  current_step: number;
  total_steps: number;
  completed_steps: number;
  progress_percentage: number;
  estimated_time_remaining: number; // in minutes
}

// API Request/Response Types for Onboarding
export interface OnboardingUpdateRequest {
  step: string;
  data: Partial<OnboardingData>;
}

export interface OnboardingUpdateResponse {
  success: boolean;
  data?: OnboardingData;
  error?: string;
  next_step?: string;
}

export interface OnboardingCompleteRequest {
  onboarding_data: OnboardingData;
  skip_remaining?: boolean;
}

export interface OnboardingCompleteResponse {
  success: boolean;
  workspace_id?: string;
  redirect_url?: string;
  error?: string;
}

// Client Portal Types
export interface ClientPortalInvitation {
  id: string;
  client_email: string;
  project_id: string;
  token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  project?: Project;
}

export interface ClientPortalAccess {
  id: string;
  client_email: string;
  project_id: string;
  access_token: string;
  permissions: ClientPortalPermission[];
  last_accessed: string;
  expires_at: string;
  created_at: string;
  project?: Project;
}

export interface ClientPortalPermission {
  id: string;
  name: string;
  description: string;
  resource: 'project' | 'milestones' | 'deliverables' | 'communication';
  actions: ('view' | 'comment' | 'approve' | 'download')[];
}

export interface ClientPortalProject {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  client_id: string;
  milestones: ClientPortalMilestone[];
  deliverables: ClientPortalDeliverable[];
  created_at: string;
  updated_at: string;
}

export interface ClientPortalMilestone {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  due_date: string;
  completed_at?: string;
  deliverables: string[];
  progress_percentage: number;
}

export interface ClientPortalDeliverable {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'design' | 'code' | 'presentation' | 'other';
  status: 'draft' | 'ready_for_review' | 'approved' | 'rejected' | 'revision_requested';
  file_url?: string;
  file_size?: number;
  uploaded_at?: string;
  approved_at?: string;
  feedback?: string;
  milestone_id?: string;
}

// API Request/Response Types for Client Portal
export interface SendInvitationRequest {
  client_email: string;
  project_id: string;
  permissions: string[];
  expires_in_days?: number;
  message?: string;
}

export interface SendInvitationResponse {
  success: boolean;
  invitation?: ClientPortalInvitation;
  error?: string;
}

export interface ValidateInvitationRequest {
  token: string;
}

export interface ValidateInvitationResponse {
  success: boolean;
  invitation?: ClientPortalInvitation;
  access_token?: string;
  error?: string;
}

export interface ClientPortalLoginRequest {
  token: string;
}

export interface ClientPortalLoginResponse {
  success: boolean;
  access_token?: string;
  project?: ClientPortalProject;
  permissions?: ClientPortalPermission[];
  error?: string;
}

export interface RevokeInvitationRequest {
  invitation_id: string;
}

export interface RevokeInvitationResponse {
  success: boolean;
  error?: string;
}
