import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white text-2xl font-light"
          aria-label="Close"
        >
          ×
        </button>

        {mode === 'login' ? (
          <LoginForm 
            onSwitchToSignUp={() => setMode('signup')}
            onSuccess={onClose}
          />
        ) : (
          <SignUpForm 
            onSwitchToLogin={() => setMode('login')}
            onSuccess={onClose}
          />
        )}
      </div>
    </div>
  )
}

export default AuthModal