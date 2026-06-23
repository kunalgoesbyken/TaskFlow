/**
 * Standardized API Response Helpers
 *
 * Provides consistent response formats across all API routes.
 *
 * Error Response Format:
 * { success: false, error: string, fieldErrors?: Record<string, string[]> }
 *
 * Success Response Format:
 * { success: true, data?: T }
 */

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { HTTP_STATUS } from '@/lib/constants/http';

// ============================================================================
// Types
// ============================================================================

export interface ApiError {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ============================================================================
// Error Response Helpers
// ============================================================================

/**
 * Creates a standardized error response
 * @param error - Error message
 * @param status - HTTP status code (default: 500)
 * @param fieldErrors - Optional field-level errors from validation
 * @param details - Optional additional error details
 */
export function apiError(
  error: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  fieldErrors?: Record<string, string[]>,
  details?: unknown
): NextResponse<ApiError> {
  const body: ApiError = {
    success: false,
    error,
  };

  if (fieldErrors) {
    body.fieldErrors = fieldErrors;
  }

  if (details && process.env.NODE_ENV === 'development') {
    body.details = details;
  }

  return NextResponse.json(body, { status });
}

/**
 * Creates a 400 Bad Request error response
 */
export function badRequest(
  error: string = 'Bad request',
  fieldErrors?: Record<string, string[]>
): NextResponse<ApiError> {
  return apiError(error, HTTP_STATUS.BAD_REQUEST, fieldErrors);
}

/**
 * Creates a 401 Unauthorized error response
 */
export function unauthorized(error: string = 'Unauthorized'): NextResponse<ApiError> {
  return apiError(error, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Creates a 403 Forbidden error response
 */
export function forbidden(error: string = 'Forbidden'): NextResponse<ApiError> {
  return apiError(error, HTTP_STATUS.FORBIDDEN);
}

/**
 * Creates a 404 Not Found error response
 */
export function notFound(error: string = 'Resource not found'): NextResponse<ApiError> {
  return apiError(error, HTTP_STATUS.NOT_FOUND);
}

/**
 * Creates a 500 Internal Server Error response
 */
export function serverError(error: string = 'An error occurred'): NextResponse<ApiError> {
  return apiError(error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

/**
 * Creates a validation error response from Zod error
 */
export function validationError(zodError: ZodError, message: string = 'Invalid input'): NextResponse<ApiError> {
  // Filter out undefined values from fieldErrors
  const fieldErrors: Record<string, string[]> = {};
  const flattened = zodError.flatten().fieldErrors;
  for (const [key, value] of Object.entries(flattened)) {
    if (value) {
      fieldErrors[key] = value;
    }
  }
  return badRequest(message, fieldErrors);
}

// ============================================================================
// Success Response Helpers
// ============================================================================

/**
 * Creates a standardized success response
 * @param data - Optional data to include in response
 * @param status - HTTP status code (default: 200)
 */
export function apiSuccess<T = unknown>(
  data?: T,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiSuccess<T>> {
  const body: ApiSuccess<T> = {
    success: true,
  };

  if (data !== undefined) {
    body.data = data;
  }

  return NextResponse.json(body, { status });
}

/**
 * Creates a 201 Created response
 */
export function created<T = unknown>(data: T): NextResponse<ApiSuccess<T>> {
  return apiSuccess(data, HTTP_STATUS.CREATED);
}

// ============================================================================
// Error Handler Helpers
// ============================================================================

/**
 * Handles common error types and returns appropriate error responses
 * Catches: Unauthorized errors, Zod validation errors, SyntaxError (invalid JSON)
 *
 * @param error - The caught error
 * @param context - Optional context for logging (e.g., 'POST /api/tasks')
 * @returns NextResponse if error is handled, null if not
 */
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<ApiError> | null {
  // Handle authentication errors
  if (error instanceof Error && error.message.includes('Unauthorized')) {
    return unauthorized();
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    return validationError(error as ZodError);
  }

  // Handle JSON syntax errors
  if (error instanceof SyntaxError) {
    return badRequest('Invalid JSON in request body');
  }

  // Log unhandled errors
  if (context) {
    console.error(`${context} error:`, error);
  }

  return null;
}


