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
