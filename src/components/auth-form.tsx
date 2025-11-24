'use client'

import { useState } from 'react'
import { Mail, Lock, User, UserCheck, Eye, EyeOff, ArrowRight, Chrome, Github, MessageCircle, Zap, Shield, Users, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AuthFormProps {
  onLogin?: (email: string, password: string) => void
  onSignup?: (data: {
    email: string
    username: string
    displayName: string
    password: string
  }) => void
  isLoading?: boolean
  error?: string
  message?: string
}

export function AuthForm({
  onLogin,
  onSignup,
  isLoading = false,
  error,
  message,
}: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [signupData, setSignupData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  })

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin?.(loginData.email, loginData.password)
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (signupData.password !== signupData.confirmPassword) return
    onSignup?.({
      email: signupData.email,
      username: signupData.username,
      displayName: signupData.displayName,
      password: signupData.password,
    })
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                Welcome to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">DarkByte</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-400 leading-relaxed max-w-md">
                Connect, communicate, and collaborate with your community in real-time.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Lightning-fast messaging' },
                { icon: Shield, text: 'End-to-end encrypted' },
                { icon: Users, text: 'Build your community' },
                { icon: Palette, text: 'Fully customizable' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 text-gray-300 group">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-base lg:text-lg">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <div className="bg-gradient-to-br from-gray-950/90 via-black/90 to-gray-950/90 backdrop-blur-2xl rounded-3xl border border-gray-800/40 p-6 sm:p-8 shadow-2xl">
              <div className="flex gap-3 mb-8 bg-gray-900/60 p-1.5 rounded-2xl border border-gray-800/30">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/40 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              {message && (
                <div className="mb-6 bg-green-500/10 border border-green-500/40 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-green-400 text-sm font-medium">{message}</p>
                </div>
              )}

              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="you@example.com"
                        className="pl-12 pr-4 h-12 sm:h-13 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label htmlFor="login-password" className="block text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        Password
                      </label>
                      <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="••••••••"
                        className="pl-12 pr-12 h-12 sm:h-13 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 sm:h-13 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6 text-sm sm:text-base"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                    {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800/30" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-gradient-to-br from-gray-950/90 via-black/90 to-gray-950/90 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-700/30 transition-all duration-300 flex items-center justify-center hover:scale-105">
                      <Chrome className="w-5 h-5 text-blue-400" />
                    </button>
                    <button type="button" className="h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-700/30 transition-all duration-300 flex items-center justify-center hover:scale-105">
                      <Github className="w-5 h-5 text-gray-300" />
                    </button>
                    <button type="button" className="h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-700/30 transition-all duration-300 flex items-center justify-center hover:scale-105">
                      <MessageCircle className="w-5 h-5 text-purple-400" />
                    </button>
                  </div>
                </form>
              )}

              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="signup-email" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2.5 uppercase tracking-wide">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        placeholder="you@example.com"
                        className="pl-12 pr-4 h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-username" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2.5 uppercase tracking-wide">
                      Username
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="signup-username"
                        name="username"
                        type="text"
                        value={signupData.username}
                        onChange={handleSignupChange}
                        placeholder="darkbyte_user"
                        className="pl-12 pr-4 h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-displayname" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2.5 uppercase tracking-wide">
                      Display Name
                    </label>
                    <div className="relative group">
                      <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="signup-displayname"
                        name="displayName"
                        type="text"
                        value={signupData.displayName}
                        onChange={handleSignupChange}
                        placeholder="Your Name"
                        className="pl-12 pr-4 h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2.5 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.password}
                        onChange={handleSignupChange}
                        placeholder="••••••••"
                        className="pl-12 pr-12 h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-confirm" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2.5 uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        placeholder="••••••••"
                        className="pl-12 pr-12 h-11 sm:h-12 bg-gray-900/50 border border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {signupData.password && signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                    <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-red-400 text-xs sm:text-sm font-medium">Passwords do not match</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || (signupData.password !== signupData.confirmPassword && signupData.password !== '')}
                    className="w-full h-12 sm:h-13 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6 text-sm sm:text-base"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                    {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By signing up, you agree to our <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">Terms</a> and <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">Privacy</a>
                  </p>
                </form>
              )}
            </div>

            <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
