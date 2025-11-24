/**
 * Security utilities for input validation and sanitization
 */

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiter - prevents spam and abuse
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and sanitize username
 */
export function sanitizeUsername(username: string): string {
  // Remove special characters, only allow alphanumeric, underscore, hyphen
  return username
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .substring(0, 32)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check for SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*\/|\/\*)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(;|\||\|\||&&)/g
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Check for XSS patterns
 */
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (content.length > 2000) {
    return { valid: false, error: 'Message too long (max 2000 characters)' }
  }

  if (containsXSS(content)) {
    return { valid: false, error: 'Message contains invalid content' }
  }

  if (containsSQLInjection(content)) {
    return { valid: false, error: 'Message contains invalid content' }
  }

  return { valid: true }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ]

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (max 10MB)' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf']
  }

  const expectedExtensions = mimeToExt[file.type]
  if (!expectedExtensions || !extension || !expectedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' }
  }

  return { valid: true }
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length]
  }
  
  return token
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Hash sensitive data (for logging/debugging)
 */
export function hashSensitiveData(data: string): string {
  // Simple hash for masking - use crypto.subtle in production
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i)
    hash = hash & hash
  }
  return `***${Math.abs(hash).toString(16).substring(0, 6)}***`
}

/**
 * IP address utilities
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * CSRF token validation
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false
  }
  
  return secureCompare(token, storedToken)
}
