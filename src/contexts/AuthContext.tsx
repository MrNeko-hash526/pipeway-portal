import React, { createContext, useContext, useEffect, useState } from "react"

type UserRole = "admin" | "manager" | "user" | "auditor" | "viewer"

type User = {
  id: string
  name: string
  email: string
  roles: UserRole[]
  permissions: string[]
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on app load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (token) {
          // Validate token with your backend
          const response = await fetch("/api/auth/validate", {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            localStorage.removeItem("authToken")
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("authToken")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const { user: userData, token } = await response.json()
        localStorage.setItem("authToken", token)
        setUser(userData)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setUser(null)
    window.location.href = "/login"
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) ?? false
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
      hasPermission,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}