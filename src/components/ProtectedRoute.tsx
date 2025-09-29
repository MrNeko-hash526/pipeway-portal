import React from "react"
import { useAuth } from "@/contexts/AuthContext"

type UserRole = "admin" | "manager" | "user" | "auditor" | "viewer"

interface ProtectedRouteProps {
  children: React.ReactElement
  requireRoles?: UserRole[]
  requirePermissions?: string[]
  fallback?: React.ReactElement
}

export function ProtectedRoute({ 
  children, 
  requireRoles = [], 
  requirePermissions = [],
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Access Denied</h2>
          <p className="text-gray-600 mb-4 text-center">You need to log in to access this page.</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Check role requirements
  if (requireRoles.length > 0 && !requireRoles.some(role => user?.roles.includes(role))) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Access Denied</h2>
          <p className="text-gray-600 mb-4 text-center">
            You don't have the required role to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Required roles: {requireRoles.join(", ")}
          </p>
          <button
            onClick={() => history.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Check permission requirements
  if (requirePermissions.length > 0 && !requirePermissions.some(perm => user?.permissions.includes(perm))) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Access Denied</h2>
          <p className="text-gray-600 mb-4 text-center">
            You don't have the required permissions to access this page.
          </p>
          <button
            onClick={() => history.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return children
}