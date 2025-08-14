import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface SignUpFormProps {
  onSwitchToLogin: () => void
  onSuccess?: () => void
}

export function SignUpForm({ onSwitchToLogin, onSuccess }: SignUpFormProps) {
  const { signUp, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email || !password || !confirmPassword) {
      setFormError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long')
      return
    }

    try {
      await signUp(email, password, { username, fullName })
      onSuccess?.()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create account')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-1">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-1">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
              Password *
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
              placeholder="Create a password (min. 6 characters)"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-1">
              Confirm Password *
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
              placeholder="Confirm your password"
              disabled={isLoading}
              required
            />
          </div>

          {(formError || error) && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">
              {formError || error?.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  )
}