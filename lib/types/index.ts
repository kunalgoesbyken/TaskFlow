/**
 * Shared Type Definitions for TaskFlow
 *
 * This file contains all shared types used across the application.
 * These types align with the Prisma schema for consistency.
 */

import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { TaskStatus, TaskPriority, EventType } from "@prisma/client";

// Re-export Prisma enums for convenience
export { TaskStatus, TaskPriority, EventType };

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdById: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  // GitHub integration fields
  githubIssueUrl?: string | null;
  githubIssueNumber?: number | null;
  githubPrUrl?: string | null;
  githubRepo?: string | null;
  // Handoff Template fields
  templateId?: string | null;
  customFields?: Record<string, string | number | boolean | null> | null;
  // Relations
  createdBy: UserPreview;
  assignedToUser: UserPreview | null;
  events?: TaskEvent[];
  template?: any; // Consider adding a HandoffTemplate type later
}

export interface UserPreview {
  id: string;
  email: string;
}

// ============================================================================
// Task Event Types
// ============================================================================

export interface TaskEvent {
  id: string;
  taskId: string;
  eventType: EventType;
  oldStatus: string | null;
  newStatus: string | null;
  changedById: string;
  createdAt: string;
  // Relations
  changedBy: UserPreview;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  taskId: string;
  message: string;
  read: boolean;
  createdAt: string;
  // Relations
  task?: {
    id: string;
    title: string;
    status: TaskStatus;
  };
}

// ============================================================================
// Presence Types
// ============================================================================

export interface PresenceState {
  userId: string;
  email: string;
  taskId: string;
  lastSeen: number;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser extends SupabaseUser {
  id: string;
  email: string;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateTaskStatusInput {
  taskId: string;
  status: string;
}

export interface AssignTaskInput {
  taskId: string;
  assignedTo: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export type DateRangePreset = 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all_time';

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string;
  dateRange?: DateRangePreset;
  search?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

// ============================================================================
// Command Palette Types
// ============================================================================

export interface CommandAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  onSelect: () => void;
  context?: 'global' | 'task' | 'dashboard';
}

export interface CommandContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  actions: CommandAction[];
  registerAction: (action: CommandAction) => void;
  unregisterAction: (id: string) => void;
}

// ============================================================================
// GitHub Types
// ============================================================================

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  private: boolean;
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: {
    name: string;
    color: string;
  }[];
  created_at: string;
  updated_at: string;
  pull_request?: {
    html_url: string;
  };
}

export interface GitHubToken {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubSyncConfig {
  repoFullName: string | null;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
}
