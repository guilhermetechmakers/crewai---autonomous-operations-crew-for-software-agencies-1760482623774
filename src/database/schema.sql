-- Agent Orchestration Database Schema
-- This file contains the database schema for the Agent Orchestration Engine

-- Agent Tasks Table
CREATE TABLE IF NOT EXISTS agent_tasks (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    agent_type ENUM('intake', 'spin_up', 'pm', 'launch', 'handover', 'support') NOT NULL,
    scheduled_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_agent_type (agent_type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_scheduled_at (scheduled_at)
);

-- Agent Task Logs Table
CREATE TABLE IF NOT EXISTS agent_task_logs (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    level ENUM('info', 'warning', 'error', 'success') NOT NULL,
    message TEXT NOT NULL,
    details JSON NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES agent_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_level (level),
    INDEX idx_timestamp (timestamp)
);

-- Agent Schedules Table
CREATE TABLE IF NOT EXISTS agent_schedules (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    cron_expression VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_run TIMESTAMP NULL,
    next_run TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES agent_tasks(id) ON DELETE CASCADE,
    INDEX idx_is_active (is_active),
    INDEX idx_next_run (next_run),
    INDEX idx_cron_expression (cron_expression)
);

-- Agent Health Status Table
CREATE TABLE IF NOT EXISTS agent_health (
    id VARCHAR(36) PRIMARY KEY,
    agent_type ENUM('intake', 'spin_up', 'pm', 'launch', 'handover', 'support') NOT NULL UNIQUE,
    status ENUM('active', 'inactive', 'error') NOT NULL DEFAULT 'active',
    last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_last_activity (last_activity)
);

-- Agent Configuration Table
CREATE TABLE IF NOT EXISTS agent_configurations (
    id VARCHAR(36) PRIMARY KEY,
    agent_type ENUM('intake', 'spin_up', 'pm', 'launch', 'handover', 'support') NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL DEFAULT 'gpt-4',
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER NOT NULL DEFAULT 4000 CHECK (max_tokens > 0),
    system_prompt TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_agent_type (agent_type),
    INDEX idx_is_enabled (is_enabled)
);

-- Insert default agent configurations
INSERT INTO agent_configurations (id, agent_type, model, temperature, max_tokens, system_prompt) VALUES
('config-intake-001', 'intake', 'gpt-4', 0.7, 4000, 'You are an intake agent responsible for qualifying leads and gathering project requirements. Be professional, thorough, and ask clarifying questions.'),
('config-spin-up-001', 'spin_up', 'gpt-4', 0.5, 6000, 'You are a project spin-up agent responsible for automatically setting up new projects. Follow best practices and create comprehensive project structures.'),
('config-pm-001', 'pm', 'gpt-4', 0.6, 5000, 'You are a project management agent responsible for creating tasks, managing sprints, and coordinating team activities. Be organized and detail-oriented.'),
('config-launch-001', 'launch', 'gpt-4', 0.4, 4000, 'You are a launch agent responsible for deploying and launching projects. Ensure all systems are properly configured and tested.'),
('config-handover-001', 'handover', 'gpt-4', 0.7, 5000, 'You are a handover agent responsible for client handover and documentation. Create comprehensive documentation and ensure smooth transitions.'),
('config-support-001', 'support', 'gpt-4', 0.8, 3000, 'You are a support agent responsible for handling support tickets and issues. Be helpful, empathetic, and solution-oriented.')
ON DUPLICATE KEY UPDATE
    model = VALUES(model),
    temperature = VALUES(temperature),
    max_tokens = VALUES(max_tokens),
    system_prompt = VALUES(system_prompt);

-- Insert default agent health status
INSERT INTO agent_health (id, agent_type, status) VALUES
('health-intake-001', 'intake', 'active'),
('health-spin-up-001', 'spin_up', 'active'),
('health-pm-001', 'pm', 'active'),
('health-launch-001', 'launch', 'active'),
('health-handover-001', 'handover', 'active'),
('health-support-001', 'support', 'active')
ON DUPLICATE KEY UPDATE
    status = VALUES(status),
    last_activity = CURRENT_TIMESTAMP;