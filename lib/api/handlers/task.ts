/**
 * Shared Task Handler Utilities
 *
 * Common functions and constants for task API routes to eliminate duplication.
 */

import prisma from '@/lib/prisma';
import type { TaskStatus, EventType, TaskPriority } from '@prisma/client';
import type { HandoffTemplate } from '@prisma/client';
import type { User } from '@prisma/client';
import { customFieldsSchema } from '@/lib/validation/template';
import { notFound, badRequest, apiError } from '@/lib/api/errors';

// ============================================================================
// Constants
// ============================================================================

/**
 * Standard Prisma includes for task queries with user data
 */
export const TASK_INCLUDES = {
  createdBy: { select: { id: true, email: true } },
  assignedToUser: { select: { id: true, email: true } },
} as const;

/**
 * Full task includes with events
 */
export const TASK_WITH_EVENTS_INCLUDES = {
  ...TASK_INCLUDES,
  events: {
    include: {
      changedBy: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: 'desc' as const },
    take: 50,
  },
  template: true,
} as const;

// ============================================================================
// Types
// ============================================================================

export interface TemplateStep {
  status: TaskStatus;
  requiredFields: Array<{ name: string }>;
  allowedTransitions: TaskStatus[];
}

// ============================================================================
// Template Validation
// ============================================================================

/**
 * Validates required custom fields for a template step
 *
 * @param template - The handoff template with steps
 * @param targetStatus - The status being transitioned to
 * @param customFields - The provided custom fields
 * @returns Object with isValid flag and optional error response
 */
export async function validateTemplateFields(
  template: HandoffTemplate | null,
  targetStatus: TaskStatus,
  customFields: Record<string, string | number | boolean | null> | undefined
): Promise<{ isValid: boolean; errorResponse?: Response }> {
  if (!template) {
    return { isValid: true };
  }

  const templateSteps = template.steps as unknown as TemplateStep[];
  const targetStep = templateSteps.find((s) => s.status === targetStatus);

  if (!targetStep || targetStep.requiredFields.length === 0) {
    return { isValid: true };
  }

  // Validate that all required fields are present
  const requiredFieldNames = targetStep.requiredFields.map((f) => f.name);
  const providedFields = customFields || {};

  const missingFields = requiredFieldNames.filter(
    (name) => !(name in providedFields) || providedFields[name] === '' || providedFields[name] === null
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      errorResponse: apiError('Missing required fields', 400, undefined, {
        missingFields,
        requiredFields: targetStep.requiredFields,
      }),
    };
  }

  // Validate custom fields against schema
  try {
    customFieldsSchema.parse(customFields);
  } catch {
    return {
      isValid: false,
      errorResponse: badRequest('Invalid custom fields'),
    };
  }

  return { isValid: true };
}

/**
 * Validates that a status transition is allowed by the template
 *
 * @param template - The handoff template with steps
 * @param currentStatus - The current task status (nullable)
 * @param newStatus - The status being transitioned to
 * @returns Object with isValid flag and optional error response
 */
export function validateTemplateTransition(
  template: HandoffTemplate | null,
  currentStatus: TaskStatus | null,
  newStatus: TaskStatus
): { isValid: boolean; errorResponse?: Response } {
  if (!template) {
    return { isValid: true };
  }

  // If current status is null (e.g., new task), skip transition validation
  if (!currentStatus) {
    return { isValid: true };
  }

  const templateSteps = template.steps as unknown as TemplateStep[];
  const currentStep = templateSteps.find((s) => s.status === currentStatus);

  if (!currentStep) {
    return { isValid: true };
  }

  if (!currentStep.allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      errorResponse: apiError('Status transition not allowed', 400, undefined, {
        currentStatus,
        requestedStatus: newStatus,
        allowedTransitions: currentStep.allowedTransitions,
      }),
    };
  }

  return { isValid: true };
}

// ============================================================================
// Task Query Helpers
// ============================================================================

/**
 * Fetches a task by ID with standard includes
 *
 * @param taskId - The task ID to fetch
 * @param withEvents - Whether to include events (default: false)
 * @returns The task with relations or null
 */
export async function fetchTask(taskId: string, withEvents: boolean = false) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: withEvents ? TASK_WITH_EVENTS_INCLUDES : { ...TASK_INCLUDES, template: true },
  });
}

/**
 * Fetches a task with template for validation purposes
 *
 * @param taskId - The task ID to fetch
 * @returns The task with template relation or null
 */
export async function fetchTaskWithTemplate(taskId: string) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: { template: true },
  });
}

// ============================================================================
// User Validation
// ============================================================================

/**
 * Verifies that a user exists in the database
 *
 * @param userId - The user ID to verify
 * @returns true if user exists, false otherwise
 */
export async function verifyUserExists(userId: string | null | undefined): Promise<boolean> {
  if (!userId) {
    return true; // null/undefined is valid (unassigned)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return user !== null;
}


