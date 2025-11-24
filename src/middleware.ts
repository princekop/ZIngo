import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value

  // Create response
  let response: NextResponse

  // Allow all API routes to pass through; route handlers must enforce their own auth
  if (pathname.startsWith('/api')) {
    response = NextResponse.next()
  } else {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/api/auth']
    
    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    
    // If user is not authenticated and trying to access protected route
    if (!token && !isPublicRoute) {
      response = NextResponse.redirect(new URL('/login', request.url))
    } 
    // If user is authenticated and trying to access login/register or root path
    else if (token && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
      response = NextResponse.redirect(new URL('/dash', request.url))
    } else {
      response = NextResponse.next()
    }
  }

  // Add comprehensive security headers
  const headers = response.headers

  // Prevent clickjacking attacks
  headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy for privacy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy - restrict dangerous features
  headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), interest-cohort=()')
  
  // Content Security Policy - prevent XSS and injection attacks
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-inline/eval
      "style-src 'self' 'unsafe-inline'", // Required for styled components
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:", // Allow WebSocket and HTTPS
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  )
  
  // Strict Transport Security - force HTTPS
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 