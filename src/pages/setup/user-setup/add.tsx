"use client"

import React from "react"
import Link from "@/components/link"
import * as yup from "yup"
import { Users, Building2, Mail, User, AlertCircle, CheckCircle, XCircle } from "lucide-react"

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

type Toast = {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timeout?: number
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
        title: "User Data Loaded",
        message: "User data loaded successfully for editing.",
        timeout: 3000
      })
    } catch (err: any) {
      console.error('Failed to load user:', err)
      addToast({
        type: "error",
        title: "Load Failed",
        message: err.message || "Failed to load user data",
        timeout: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    
    // Auto-remove after timeout
    if (toast.timeout) {
      setTimeout(() => removeToast(id), toast.timeout)
    } else {
      // Default timeout for non-specified toasts
      setTimeout(() => removeToast(id), 5000)
    }
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
      addToast({
        type: "error",
        title: "Validation Failed",
        message: "Please check the form for errors and try again.",
        timeout: 4000
      })
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
        email: email.trim().toLowerCase(),
        status
      }

      // Add organization or company based on type
      if (userType === "Organization") {
        if (!organization || organization === "") {
          throw new Error("Please select an organization")
        }
        payload.organizationId = parseInt(organization, 10)
        console.log('📊 Organization ID being sent:', payload.organizationId)
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
        
        // Handle various types of email errors
        if (responseData.message && (
          responseData.message.includes('already registered') || 
          responseData.message.includes('already exists') ||
          responseData.message.includes('must be unique')
        )) {
          setErrors(prev => ({ 
            ...prev, 
            email: responseData.message
          }))
          addToast({
            type: "warning",
            title: "Email Already Exists",
            message: responseData.message,
            timeout: 6000
          })
          
          // Scroll to and focus email field
          setTimeout(() => {
            const emailField = document.querySelector('input[type="email"]') as HTMLInputElement
            if (emailField) {
              emailField.scrollIntoView({ behavior: 'smooth', block: 'center' })
              emailField.focus()
              emailField.select() // Select all text to make it easy to replace
            }
          }, 100)
          return
        }
        
        // Handle validation errors from backend
        if (responseData.errors && Array.isArray(responseData.errors)) {
          const newErrors: Record<string, string> = {}
          responseData.errors.forEach((error: any) => {
            if (error.path) {
              newErrors[error.path] = error.msg
            }
          })
          setErrors(newErrors)
          addToast({
            type: "error",
            title: "Validation Errors",
            message: "Please correct the highlighted fields.",
            timeout: 5000
          })
          return
        }
        
        // Generic error
        const errorMessage = responseData.error || responseData.message || `HTTP ${res.status}`
        addToast({
          type: "error",
          title: isEdit ? "Update Failed" : "Creation Failed",
          message: errorMessage,
          timeout: 5000
        })
        throw new Error(errorMessage)
      }

      console.log('✅ API Success:', responseData)

      addToast({
        type: "success",
        title: "Success!",
        message: isEdit ? "User updated successfully." : "User created successfully.",
        timeout: 3000
      })
      
      // Redirect after success
      setTimeout(() => {
        window.location.href = "/setup/user-setup"
      }, 2000)
    } catch (err: any) {
      console.error("❌ Submit error:", err)
      if (!err.message.includes('already registered') && 
          !err.message.includes('already exists') && 
          !err.message.includes('must be unique')) {
        addToast({
          type: "error",
          title: "Operation Failed",
          message: err?.message || "An unexpected error occurred. Please try again.",
          timeout: 5000
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Clear email error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }))
    }
  }

  // Also clear confirm email error when either email field changes
  const handleConfirmEmailChange = (value: string) => {
    setConfirmEmail(value)
    if (errors.confirmEmail) {
      setErrors(prev => ({ ...prev, confirmEmail: "" }))
    }
    // Also clear email error if it was a uniqueness error
    if (errors.email && errors.email.includes('already registered')) {
      setErrors(prev => ({ ...prev, email: "" }))
    }
  }

  // Add error state
  const [error, setError] = React.useState<string | null>(null)

  // Wrap the main logic in try-catch
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="text-center py-12 bg-white rounded-lg border border-red-200">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-4">
            Error: {error}
          </div>
          <button 
            onClick={() => setError(null)} 
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
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
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600">Loading user data...</div>
        </div>
      </div>
    )
  }

  // STEP 1: choose type
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-sky-600" />
            <h1 className="text-2xl font-semibold text-slate-900">
              {isEdit ? "Edit User" : "Add New User"}
            </h1>
          </div>
          <Link href="/setup/user-setup" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
            Back to List
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select User Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization Option */}
              <div 
                onClick={() => setUserType("Organization")}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  userType === "Organization" 
                    ? "border-sky-500 bg-sky-50" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`w-6 h-6 ${userType === "Organization" ? "text-sky-600" : "text-slate-400"}`} />
                  <div>
                    <h3 className="font-medium text-slate-900">Organization</h3>
                    <p className="text-sm text-slate-600">User belongs to an organization</p>
                  </div>
                </div>
              </div>
              
              {/* Company Option */}
              <div 
                onClick={() => setUserType("Company")}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  userType === "Company" 
                    ? "border-sky-500 bg-sky-50" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`w-6 h-6 ${userType === "Company" ? "text-sky-600" : "text-slate-400"}`} />
                  <div>
                    <h3 className="font-medium text-slate-900">Company</h3>
                    <p className="text-sm text-slate-600">Independent company user</p>
                  </div>
                </div>
              </div>
            </div>
            {errors.userType && <div className="text-sm text-red-600 mt-2">{errors.userType}</div>}
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/setup/user-setup" className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!userType}
              className={`px-6 py-2 rounded-md text-white transition-colors ${
                !userType 
                  ? "bg-slate-300 cursor-not-allowed" 
                  : "bg-sky-600 hover:bg-sky-700"
              }`}
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
    <div className="max-w-4xl mx-auto px-6 py-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-sky-600" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {isEdit ? "Edit User" : "Add New User"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {userType} User Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setStep(1)} 
            className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
          <Link href="/setup/user-setup" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
            Back to List
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg shadow-sm" noValidate>
        <div className="p-6 space-y-6">
          {/* User Type Display */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4" />
              <span>User Type: <span className="font-medium text-slate-900">{userType}</span></span>
            </div>
          </div>

          {/* Organization Selection */}
          {userType === "Organization" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Organization <span className="text-red-500">*</span>
              </label>
              <select
                value={organization}
                onChange={e => { 
                  console.log('📊 Organization selected:', e.target.value)
                  setOrganization(e.target.value); 
                  setErrors(prev => ({ ...prev, organization: "" })); 
                }}
                onBlur={() => validateField("organization")}
                className={`w-full border rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.organization ? "border-red-500 bg-red-50" : "border-slate-300"
                }`}
              >
                <option value="">Select an Organization...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={String(org.id)}>
                    {org.organization_name || org.name || `Organization ${org.id}`}
                  </option>
                ))}
              </select>
              {errors.organization && (
                <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.organization}
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1">
                Selected: {organization || 'None'} | Available: {organizations.length} organizations
              </div>
            </div>
          )}

          {/* Company Name */}
          {userType === "Company" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                value={companyName}
                onChange={e => { 
                  setCompanyName(e.target.value); 
                  setErrors(prev => ({ ...prev, companyName: "" })); 
                }}
                onBlur={() => validateField("companyName")}
                className={`w-full border rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.companyName ? "border-red-500 bg-red-50" : "border-slate-300"
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.companyName}
                </div>
              )}
            </div>
          )}

          {/* User Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <select
              value={userRole}
              onChange={e => { 
                setUserRole(e.target.value); 
                setErrors(prev => ({ ...prev, userRole: "" })) 
              }}
              onBlur={() => validateField("userRole")}
              className={`w-full border rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                errors.userRole ? "border-red-500 bg-red-50" : "border-slate-300"
              }`}
            >
              <option value="">Select a User Role...</option>
              <option value="Admin">Admin</option>
              <option value="Auditor">Auditor</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
            {errors.userRole && (
              <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.userRole}
              </div>
            )}
          </div>

          {/* Names side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  value={firstName} 
                  onChange={e => { 
                    setFirstName(e.target.value); 
                    setErrors(prev => ({ ...prev, firstName: "" })) 
                  }} 
                  onBlur={() => validateField("firstName")} 
                  className={`w-full pl-10 pr-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    errors.firstName ? "border-red-500 bg-red-50" : "border-slate-300"
                  }`} 
                  placeholder="Enter first name" 
                />
              </div>
              {errors.firstName && (
                <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.firstName}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  value={lastName} 
                  onChange={e => { 
                    setLastName(e.target.value); 
                    setErrors(prev => ({ ...prev, lastName: "" })) 
                  }} 
                  onBlur={() => validateField("lastName")} 
                  className={`w-full pl-10 pr-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    errors.lastName ? "border-red-500 bg-red-50" : "border-slate-300"
                  }`} 
                  placeholder="Enter last name" 
                />
              </div>
              {errors.lastName && (
                <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

          {/* Emails side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={() => validateField("email")} 
                  className={`w-full pl-10 pr-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    errors.email ? "border-red-500 bg-red-50" : "border-slate-300"
                  }`} 
                  placeholder="Enter email address" 
                />
              </div>
              {errors.email && (
                <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={confirmEmail} 
                  onChange={e => handleConfirmEmailChange(e.target.value)}
                  onBlur={() => validateField("confirmEmail")} 
                  className={`w-full pl-10 pr-3 py-2 border rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    errors.confirmEmail ? "border-red-500 bg-red-50" : "border-slate-300"
                  }`} 
                  placeholder="Confirm email address" 
                />
              </div>
              {errors.confirmEmail && (
                <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmEmail}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ← Back to Type Selection
            </button>
            
            <div className="flex gap-3">
              <Link
                href="/setup/user-setup"
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center gap-2"
              > 
                {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {submitting ? "Saving..." : (isEdit ? "Update User" : "Create User")}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 bg-white ${
                toast.type === "success"
                  ? "border-l-green-500"
                  : toast.type === "error"
                  ? "border-l-red-500"
                  : toast.type === "warning"
                  ? "border-l-yellow-500"
                  : "border-l-blue-500"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {toast.type === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {toast.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                    {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                    {toast.type === "info" && <AlertCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      toast.type === "success" ? "text-green-900" :
                      toast.type === "error" ? "text-red-900" :
                      toast.type === "warning" ? "text-yellow-900" :
                      "text-blue-900"
                    }`}>
                      {toast.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {toast.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}