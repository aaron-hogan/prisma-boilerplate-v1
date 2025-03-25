'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { notify } from '@/lib/notifications'
import { ActionStatus } from '@/types/action-responses'

/**
 * URL Message Handler
 * 
 * This component detects URL parameters (error, success, warning, info)
 * and converts them to toast notifications.
 * 
 * Usage:
 * Add this component to your page to convert legacy URL-based messages
 * to toast notifications without changing the server action structure.
 */
export function UrlMessageHandler() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Check for message parameters in the URL
    const error = searchParams.get('error')
    const success = searchParams.get('success')
    const warning = searchParams.get('warning')
    const info = searchParams.get('info')
    
    // Map to our notification system
    if (error) {
      notify.error(error)
    }
    
    if (success) {
      notify.success(success)
    }
    
    if (warning) {
      notify.warning(warning)
    }
    
    if (info) {
      notify.info(info)
    }
  }, [searchParams])
  
  // This component doesn't render anything
  return null
}

/**
 * Message Handler
 * 
 * This component takes a message object and converts it to a toast notification.
 * 
 * Usage:
 * <MessageHandler message={{ type: 'error', content: 'Something went wrong' }} />
 */
export function MessageHandler({ 
  message 
}: { 
  message: { type?: ActionStatus, content?: string } | null
}) {
  useEffect(() => {
    if (message?.type && message?.content) {
      notify[message.type](message.content)
    }
  }, [message])
  
  // This component doesn't render anything
  return null
}