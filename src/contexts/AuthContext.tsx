import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabaseService, Profile, AuthState } from '../services/supabaseService'

interface AuthContextType extends AuthState {
  profile: Profile | null
  signUp: (email: string, password: string, options?: { username?: string; fullName?: string }) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>
  refreshProfile: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const currentSession = await supabaseService.getCurrentSession()
        const currentUser = currentSession?.user || null

        if (mounted) {
          setSession(currentSession)
          setUser(currentUser)

          // Get profile if user exists
          if (currentUser) {
            const userProfile = await supabaseService.getProfile(currentUser.id)
            if (mounted) {
              setProfile(userProfile)
            }
          }

          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        if (mounted) {
          setError(err as Error)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth changes
    const unsubscribe = supabaseService.onAuthStateChange(async (authState) => {
      if (!mounted) return

      setUser(authState.user)
      setSession(authState.session)
      setError(authState.error)
      setIsLoading(authState.isLoading)

      // Update profile when user changes
      if (authState.user) {
        try {
          const userProfile = await supabaseService.getProfile(authState.user.id)
          if (mounted) {
            setProfile(userProfile)
          }
        } catch (err) {
          console.error('Error fetching profile:', err)
          if (mounted) {
            setProfile(null)
          }
        }
      } else {
        if (mounted) {
          setProfile(null)
        }
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, options?: { username?: string; fullName?: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await supabaseService.signUp(email, password, {
        data: {
          username: options?.username,
          full_name: options?.fullName
        }
      })
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await supabaseService.signIn(email, password)
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await supabaseService.signOut()
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    setError(null)

    try {
      const updatedProfile = await supabaseService.updateProfile(updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      const userProfile = await supabaseService.getProfile(user.id)
      setProfile(userProfile)
    } catch (err) {
      console.error('Error refreshing profile:', err)
      setError(err as Error)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!user && !!session
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider