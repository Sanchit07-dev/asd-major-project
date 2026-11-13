
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let authEventReceived = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true

      if (!isMounted) return

      setUser(session?.user ?? null)
      setLoading(false)
    })

    async function initializeSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (isMounted && !authEventReceived) {
          setUser(data.session?.user ?? null)
        }
      } catch (err) {
        console.error('Session initialization failed:', err)

        if (isMounted && !authEventReceived) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeSession()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
