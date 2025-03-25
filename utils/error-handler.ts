/**
 * Standardized error handling utilities
 * 
 * This module provides a consistent approach to error handling across the application.
 * It includes:
 * - Standard error types with appropriate HTTP status codes
 * - Unified error logging approach
 * - Helper functions for API responses
 */

/**
 * Application error types with associated status codes
 */
export enum ErrorType {
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  
  // Input validation errors  
  VALIDATION = 'validation_error',
  
  // Data errors
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  
  // Server errors
  INTERNAL = 'internal_error',
  EXTERNAL_SERVICE = 'external_service_error',
}

/**
 * Maps error types to appropriate HTTP status codes
 */
export const ERROR_STATUS_CODES: Record<ErrorType, number> = {
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.VALIDATION]: 400,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.INTERNAL]: 500,
  [ErrorType.EXTERNAL_SERVICE]: 503,
};

/**
 * Application error class with standardized structure
 */
export class AppError extends Error {
  type: ErrorType;
  status: number;
  details?: any;

  constructor(type: ErrorType, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = ERROR_STATUS_CODES[type];
    this.details = details;
  }
}

/**
 * Standardized error logging function
 * 
 * @param error - The error to log
 * @param context - Optional additional context for the error
 */
export function logError(error: unknown, context?: string) {
  if (error instanceof AppError) {
    console.error(`[${error.type.toUpperCase()}] ${context ? `(${context}) ` : ''}${error.message}`, 
      error.details ? { details: error.details } : '');
  } else if (error instanceof Error) {
    console.error(`[ERROR] ${context ? `(${context}) ` : ''}${error.message}`, error.stack);
  } else {
    console.error(`[UNKNOWN_ERROR] ${context ? `(${context}) ` : ''}`, error);
  }
}

/**
 * Creates a standardized error response for API routes
 * 
 * @param error - The error object
 * @returns A standardized error response object
 */
export function createErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.type,
      message: error.message,
      details: error.details,
      status: error.status
    };
  } else if (error instanceof Error) {
    return {
      error: 'internal_error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      status: 500
    };
  } else {
    return {
      error: 'unknown_error',
      message: 'An unexpected error occurred',
      status: 500
    };
  }
}