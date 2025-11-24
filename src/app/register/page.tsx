'use client'

import { Suspense, useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

function RegisterInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const callbackUrl = mounted ? (searchParams.get('callbackUrl') || '/dash') : '/dash'

  const onLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await signIn('credentials', { redirect: false, email, password })
      if (response?.error) {
        setError('Invalid email or password')
      } else {
        router.push(callbackUrl)
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onSignup = async (data: {
    email: string
    username: string
    displayName: string
    password: string
  }) => {
    setIsLoading(true)
    setError('')
    setMessage('')

    if (data.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Registration failed')
      } else {
        setMessage('Account created successfully! Signing you in...')
        setTimeout(() => {
          onLogin(data.email, data.password)
        }, 1500)
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthForm
      onLogin={onLogin}
      onSignup={onSignup}
      isLoading={isLoading}
      error={error || undefined}
      message={message}
    />
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <RegisterInner />
    </Suspense>
  )
}