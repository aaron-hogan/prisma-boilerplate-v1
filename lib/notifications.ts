import { toast, ToastOptions } from 'sonner'

export const notify = {
  success: (message: string, options?: ToastOptions) => toast.success(message, options),
  error: (message: string, options?: ToastOptions) => toast.error(message, options),
  warning: (message: string, options?: ToastOptions) => toast.warning(message, options),
  info: (message: string, options?: ToastOptions) => toast.info(message, options)
}