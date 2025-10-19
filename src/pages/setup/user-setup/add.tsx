"use client"

import React from "react"
import Link from "@/components/link"
import * as yup from "yup"

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

type Toast = {
  id: string
  type: "success" | "error" | "info"
  title: string
  message: string
}

export default function AddUserPage() {
  const [userType, setUserType] = React.useState("Organization")
  const [organization, setOrganization] = React.useState<string>("")
  const [companyName, setCompanyName] = React.useState<string>("")
  const [userRole, setUserRole] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [confirmEmail, setConfirmEmail] = React.useState("")
  const [status, setStatus] = React.useState("Active")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [editId, setEditId] = React.useState<string | null>(null)
  const [isEdit, setIsEdit] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  // Available organizations from backend
  const [organizations, setOrganizations] = React.useState<any[]>([])

  // two-step flow: step 1 = pick Organization or Company (+ org/company name),
  // step 2 = full form for the chosen type
  const [step, setStep] = React.useState<number>(1)

  // Load organizations from backend - DISABLED FOR NOW
  React.useEffect(() => {
    let isMounted = true
    
    const loadOrganizations = async () => {
      try {
        if (typeof window === 'undefined') return
        
        // TEMPORARILY DISABLED - will implement organization API later
        // const url = `${API_BASE.replace(/\/$/, '')}/api/setup/vendor?limit=100&status=Active`
        // const res = await fetch(url)
        
        if (!isMounted) return
        
        // MOCK DATA for now
        const mockOrganizations = [
          { id: 1, organization_name: 'Acme Corporation' },
          { id: 2, organization_name: 'Tech Solutions Inc' },
          { id: 3, organization_name: 'Global Systems Ltd' }
        ]
        
        console.log('📊 Using mock organizations:', mockOrganizations) // Debug log
        setOrganizations(mockOrganizations)
        
        // Set default organization if we don't have one and we're not editing
        if (mockOrganizations.length > 0 && !organization && !isEdit) {
          console.log('📊 Setting default organization:', mockOrganizations[0].id) // Debug log
          setOrganization(String(mockOrganizations[0].id))
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load organizations:', err)
        }
      }
    }
    
    loadOrganizations()
    
    return () => {
      isMounted = false
    }
  }, [isEdit]) // Add isEdit dependency

  // Check for edit mode - simplified
  React.useEffect(() => {
    let isMounted = true
    
    const checkEditMode = () => {
      if (typeof window === 'undefined') return
      
      const params = new URLSearchParams(window.location.search)
      const idParam = params.get("id")
      
      if (idParam && isMounted) {
        setEditId(idParam)
        setIsEdit(true)
        loadUserData(idParam)
      } else if (isMounted) {
        setLoading(false)
      }
    }
    
    checkEditMode()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Load user data for editing
  const loadUserData = async (id: string) => {
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/setup/user/${id}`
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const response = await res.json()
      const userData = response.data
      
      // Map backend fields to form state
      setUserType(userData.user_type || 'Organization')
      setOrganization(userData.organization_id ? String(userData.organization_id) : '')
      setCompanyName(userData.company_name || '')
      setUserRole(userData.user_role || '')
      setFirstName(userData.first_name || '')
      setLastName(userData.last_name || '')
      setEmail(userData.email || '')
      setConfirmEmail(userData.email || '') // Set same as email for edit
      setStatus(userData.status || 'Active')
      setStep(2) // Show full form when editing
      
      addToast({
        type: "success",
        title: "Loaded",
        message: "User data loaded for editing."
      })
    } catch (err: any) {
      console.error('Failed to load user:', err)
      addToast({
        type: "error",
        title: "Load failed",
        message: err.message || "Failed to load user data"
      })
    } finally {
      setLoading(false)
    }
  }

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const schema = yup.object({
    userType: yup.string().oneOf(["Organization", "Company"], "Invalid user type").required("User type is required"),
    organization: yup.string().when("userType", (ut: any, s: any) =>
      ut === "Organization"
        ? yup.string().required("Organization is required")
        : yup.string().nullable()
    ),
    companyName: yup.string().when("userType", (ut: any, s: any) =>
      ut === "Company"
        ? yup.string().trim().min(2, "Company name required").required("Company name is required")
        : yup.string().nullable()
    ),
    userRole: yup.string().oneOf(["Admin", "Auditor", "Manager", "Viewer"], "Invalid user role").required("User role is required"),
    firstName: yup.string().trim().min(2, "First name must be at least 2 characters").max(50, "First name too long").matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces").required("First name is required"),
    lastName: yup.string().trim().min(2, "Last name must be at least 2 characters").max(50, "Last name too long").matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces").required("Last name is required"),
    email: yup.string().trim().email("Invalid email format").required("Email is required"),
    confirmEmail: yup.string().trim().oneOf([yup.ref("email")], "Emails must match").required("Confirm email is required"),
  })

  const validateField = async (field: string) => {
    try {
      const form = { userType, organization, companyName, userRole, firstName, lastName, email, confirmEmail }
      await schema.validateAt(field, form)
      setErrors(prev => ({ ...prev, [field]: "" }))
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [field]: err?.message || "Invalid" }))
    }
  }

  const validate = async (): Promise<boolean> => {
    try {
      const form = { userType, organization, companyName, userRole, firstName, lastName, email, confirmEmail }
      await schema.validate(form, { abortEarly: false, strict: true })
      setErrors({})
      return true
    } catch (err: any) {
      if (err && err.inner && Array.isArray(err.inner)) {
        const mapped: Record<string, string> = {}
        err.inner.forEach((ve: any) => {
          if (ve.path && !mapped[ve.path]) mapped[ve.path] = ve.message
        })
        setErrors(mapped)
      } else if (err.path) {
        setErrors({ [err.path]: err.message })
      } else {
        setErrors({ _form: "Validation failed" })
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const ok = await validate()
    if (!ok) {
      window.scrollTo({ top: 140, behavior: "smooth" })
      return
    }
    
    setSubmitting(true)
    
    try {
      // Prepare payload for backend
      const payload: any = {
        userType,
        userRole,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        status
      }

      // Add organization or company based on type
      if (userType === "Organization") {
        if (!organization || organization === "") {
          throw new Error("Please select an organization")
        }
        payload.organizationId = parseInt(organization, 10)
        console.log('📊 Organization ID being sent:', payload.organizationId) // Debug log
      } else if (userType === "Company") {
        if (!companyName || companyName.trim() === "") {
          throw new Error("Please enter a company name")
        }
        payload.companyName = companyName.trim()
      }

      console.log('📤 Submitting payload:', payload)

      const url = isEdit 
        ? `${API_BASE.replace(/\/$/, '')}/api/setup/user/${editId}`
        : `${API_BASE.replace(/\/$/, '')}/api/setup/user`
      
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()

      if (!res.ok) {
        console.error('❌ API Error:', responseData)
        const errorMessage = responseData.errors 
          ? responseData.errors.map((e: any) => e.msg).join(', ')
          : responseData.error || responseData.message || `HTTP ${res.status}`
        throw new Error(errorMessage)
      }

      console.log('✅ API Success:', responseData)

      addToast({
        type: "success",
        title: "Success!",
        message: isEdit ? "User updated successfully." : "User created successfully."
      })
      
      setTimeout(() => {
        window.location.href = "/setup/user-setup"
      }, 1500)
    } catch (err: any) {
      console.error("❌ Submit error:", err)
      addToast({
        type: "error",
        title: "Failed to save",
        message: err?.message || "An unknown error occurred"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Add error state
  const [error, setError] = React.useState<string | null>(null)

  // Wrap the main logic in try-catch
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400">
            Error: {error}
          </div>
          <button 
            onClick={() => setError(null)} 
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-300">Loading user data...</div>
        </div>
      </div>
    )
  }

  // STEP 1: choose type
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{isEdit ? "Edit User" : "Add User"}</h1>
          <Link href="/setup/user-setup" className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md">Back</Link>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Type</label>
            <select
              value={userType}
              onChange={e => { setUserType(e.target.value); setErrors(prev => ({ ...prev, userType: "" })) }}
              onBlur={() => validateField("userType")}
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.userType ? "border-red-400 dark:border-red-500" : ""}`}
            >
              <option value="">Select User Type...</option>
              <option value="Organization">Organization</option>
              <option value="Company">Company</option>
            </select>
            {errors.userType && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.userType}</div>}
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/setup/user-setup" className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</Link>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!userType}
              className={`px-4 py-2 rounded-md text-white ${!userType ? "bg-slate-300 dark:bg-slate-600 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"}`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 2: full form
  return (
    <div className="max-w-3xl mx-auto px-6 py-6 bg-white dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{isEdit ? "Edit User" : "Add User"}</h1>
        <div className="flex gap-2">
          <button onClick={() => setStep(1)} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Back</button>
          <Link href="/setup/user-setup" className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md">Back to list</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-sm" noValidate>
        {/* User Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Type:</label>
          <select
            value={userType}
            onChange={e => {
              const val = e.target.value
              setUserType(val)
              // clear dependent fields when switching
              setOrganization("")
              setCompanyName("")
              setErrors(prev => ({ ...prev, userType: "", organization: "", companyName: "" }))
            }}
            onBlur={() => validateField("userType")}
            className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.userType ? "border-red-400 dark:border-red-500" : ""}`}
          >
            <option value="">Select User Type...</option>
            <option value="Organization">Organization</option>
            <option value="Company">Company</option>
          </select>
          {errors.userType && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.userType}</div>}
        </div>

        {/* Organization Selection */}
        {userType === "Organization" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization Name:</label>
            <select
              value={organization}
              onChange={e => { 
                console.log('📊 Organization selected:', e.target.value) // Debug log
                setOrganization(e.target.value); 
                setErrors(prev => ({ ...prev, organization: "" })); 
              }}
              onBlur={() => validateField("organization")}
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.organization ? "border-red-400 dark:border-red-500" : ""}`}
            >
              <option value="">Select an Organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={String(org.id)}>
                  {org.organization_name || org.name || `Organization ${org.id}`}
                </option>
              ))}
            </select>
            {errors.organization && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.organization}</div>}
            
            {/* Debug info - remove this after testing */}
            <div className="text-xs text-slate-500 mt-1">
              Selected: {organization || 'None'} | Available: {organizations.length} organizations
            </div>
          </div>
        )}

        {/* Company Name */}
        {userType === "Company" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name:</label>
            <input
              value={companyName}
              onChange={e => { setCompanyName(e.target.value); setErrors(prev => ({ ...prev, companyName: "" })); }}
              onBlur={() => validateField("companyName")}
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.companyName ? "border-red-400 dark:border-red-500" : ""}`}
              placeholder="Company Name"
            />
            {errors.companyName && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.companyName}</div>}
          </div>
        )}

        {/* User Role */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Role:</label>
          <select
            value={userRole}
            onChange={e => { setUserRole(e.target.value); setErrors(prev => ({ ...prev, userRole: "" })) }}
            onBlur={() => validateField("userRole")}
            className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.userRole ? "border-red-400 dark:border-red-500" : ""}`}
          >
            <option value="">Select a User Role...</option>
            <option value="Admin">Admin</option>
            <option value="Auditor">Auditor</option>
            <option value="Manager">Manager</option>
            <option value="Viewer">Viewer</option>
          </select>
          {errors.userRole && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.userRole}</div>}
        </div>

        {/* Names side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name:</label>
            <input 
              value={firstName} 
              onChange={e => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: "" })) }} 
              onBlur={() => validateField("firstName")} 
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.firstName ? "border-red-400 dark:border-red-500" : ""}`} 
              placeholder="First Name" 
            />
            {errors.firstName && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.firstName}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name:</label>
            <input 
              value={lastName} 
              onChange={e => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: "" })) }} 
              onBlur={() => validateField("lastName")} 
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.lastName ? "border-red-400 dark:border-red-500" : ""}`} 
              placeholder="Last Name" 
            />
            {errors.lastName && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.lastName}</div>}
          </div>
        </div>

        {/* Emails side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })) }} 
              onBlur={() => validateField("email")} 
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.email ? "border-red-400 dark:border-red-500" : ""}`} 
              placeholder="Email" />
            {errors.email && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Email:</label>
            <input 
              type="email" 
              value={confirmEmail} 
              onChange={e => { setConfirmEmail(e.target.value); setErrors(prev => ({ ...prev, confirmEmail: "" })) }} 
              onBlur={() => validateField("confirmEmail")} 
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.confirmEmail ? "border-red-400 dark:border-red-500" : ""}`} 
              placeholder="Confirm Email" />
            {errors.confirmEmail && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.confirmEmail}</div>}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status:</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          > 
            {submitting ? "Saving..." : (isEdit ? "Update User" : "Create User")}
          </button>
        </div>
      </form>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg border ${
                toast.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : toast.type === "error"
                  ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${
                      toast.type === "success"
                        ? "text-emerald-900 dark:text-emerald-100"
                        : toast.type === "error"
                        ? "text-rose-900 dark:text-rose-100"
                        : "text-blue-900 dark:text-blue-100"
                    }`}
                  >
                    {toast.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      toast.type === "success"
                        ? "text-emerald-700 dark:text-emerald-200"
                        : toast.type === "error"
                        ? "text-rose-700 dark:text-rose-200"
                        : "text-blue-700 dark:text-blue-200"
                    }`}
                  >
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}