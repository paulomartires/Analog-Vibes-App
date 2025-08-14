import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface LoginFormProps {
  onSwitchToSignUp: () => void
  onSuccess?: () => void
}

export function LoginForm({ onSwitchToSignUp, onSuccess }: LoginFormProps) {
  const { signIn, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email || !password) {
      setFormError('Please fill in all fields')
      return
    }

    try {
      await signIn(email, password)
      onSuccess?.()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to sign in')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {(formError || error) && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">
              {formError || error?.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  )
}