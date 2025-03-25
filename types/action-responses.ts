/**
 * Standardized action response types for server actions
 * These types provide a consistent interface for server actions
 * to return status information to client components
 */

export type ActionStatus = 'success' | 'error' | 'warning' | 'info'

export interface ActionResponse {
  status: ActionStatus
  message: string
  data?: any
}

export interface FormActionState extends ActionResponse {
  // Additional form-specific state can be added here
  fieldErrors?: Record<string, string>
  validationErrors?: string[]
}