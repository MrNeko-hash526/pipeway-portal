"use client"

import React from "react"
import Link from "@/components/link"
import { vendors as initialVendors } from "@/lib/setup-data"
import * as yup from "yup"

export default function AddUserPage() {
  const [userType, setUserType] = React.useState("Organization")
  const [organization, setOrganization] = React.useState<string>("")
  const [companyName, setCompanyName] = React.useState<string>("")
  const [userRole, setUserRole] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [confirmEmail, setConfirmEmail] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [editId, setEditId] = React.useState<string | null>(null)

  // two-step flow: step 1 = pick Organization or Company (+ org/company name),
  // step 2 = full form for the chosen type
  const [step, setStep] = React.useState<number>(1)

  React.useEffect(() => {
    if (!organization && Array.isArray(initialVendors) && initialVendors.length > 0) {
      setOrganization(String(initialVendors[0].id))
    }

    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const idParam = params.get("id")
    if (!idParam) {
      setLoading(false)
      return
    }

    try {
      const editsRaw = localStorage.getItem("userEdits")
      const edits = editsRaw ? JSON.parse(editsRaw) : {}
      if (edits[idParam]) {
        const e = edits[idParam]
        setUserType(e.userType ?? "Organization")
        setOrganization(String(e.organization ?? ""))
        setCompanyName(String(e.companyName ?? ""))
        setUserRole(e.userRole ?? "")
        setFirstName(e.firstName ?? "")
        setLastName(e.lastName ?? "")
        setEmail(e.email ?? "")
        setConfirmEmail(e.email ?? "")
        setEditId(idParam)
        setStep(2) // show full form when editing
        setLoading(false)
        return
      }
    } catch (err) {
      console.error("Failed to parse userEdits", err)
    }

    try {
      const usersRaw = localStorage.getItem("users")
      const users = usersRaw ? JSON.parse(usersRaw) : []
      const foundInStorage = users.find((u: any) => String(u.id) === String(idParam))
      if (foundInStorage) {
        setUserType(foundInStorage.userType ?? "Organization")
        setOrganization(String(foundInStorage.organization ?? ""))
        setCompanyName(String(foundInStorage.companyName ?? ""))
        setUserRole(foundInStorage.userRole ?? "")
        setFirstName(foundInStorage.firstName ?? "")
        setLastName(foundInStorage.lastName ?? "")
        setEmail(foundInStorage.email ?? "")
        setConfirmEmail(foundInStorage.email ?? "")
        setEditId(String(foundInStorage.id))
        setStep(2)
        setLoading(false)
        return
      }
    } catch (err) {
      // ignore
    }
    setLoading(false)
  }, [])

  const schema = yup.object({
    userType: yup.string().oneOf(["Organization", "Company"], "Invalid user type").required("User type is required"),
    organization: yup.string().when("userType", (ut: any, s: any) =>
      ut === "Organization"
        ? yup.string().required("Organization is required").oneOf(initialVendors.map((v: any) => String(v.id)), "Invalid organization")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      id: editId ?? Date.now(),
      userType,
      organization: userType === "Organization" ? organization : "",
      companyName: userType === "Company" ? companyName.trim() : "",
      userRole,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      confirmEmail: confirmEmail.trim(),
      createdAt: new Date().toISOString(),
    }

    try {
      await schema.validate(payload, { abortEarly: false })
      setErrors({})

      // save to localStorage (same pattern used elsewhere)
      try {
        const raw = localStorage.getItem("userCreates")
        const arr = raw ? JSON.parse(raw) : []
        arr.unshift({
          id: payload.id,
          userType: payload.userType,
          organization: payload.organization,
          companyName: payload.companyName,
          userRole: payload.userRole,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          createdAt: payload.createdAt,
        })
        localStorage.setItem("userCreates", JSON.stringify(arr))
      } catch (err) {
        console.error("Failed to save user to localStorage", err)
      }

      window.location.href = "/setup/user-setup"
    } catch (err: any) {
      if (err && err.inner && Array.isArray(err.inner)) {
        const errMap: Record<string, string> = {}
        err.inner.forEach((violation: any) => {
          if (violation.path && !errMap[violation.path]) {
            errMap[violation.path] = violation.message
          }
        })
        setErrors(errMap)
      } else {
        console.error(err)
      }
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-6 text-slate-600 dark:text-slate-300">Loading…</div>

  // STEP 1: choose type
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{editId ? "Edit User" : "Add User"}</h1>
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
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{editId ? "Edit User" : "Add User"}</h1>
        <div className="flex gap-2">
          <button onClick={() => setStep(1)} className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Back</button>
          <Link href="/setup/user-setup" className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md">Back to list</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4 shadow-sm" noValidate>
        {/* STEP 2: allow changing type + org/company inline */}
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

        {userType === "Organization" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization Name:</label>
            <select
              value={organization}
              onChange={e => { setOrganization(e.target.value); setErrors(prev => ({ ...prev, organization: "" })); validateField("organization") }}
              onBlur={() => validateField("organization")}
              className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.organization ? "border-red-400 dark:border-red-500" : ""}`}
            >
              <option value="">Select an Organization...</option>
              {initialVendors?.map((v: any) => (
                <option key={v.id} value={String(v.id)}>{v.name}</option>
              ))}
            </select>
            {errors.organization && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.organization}</div>}
          </div>
        )}

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
            <input value={firstName} onChange={e => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: "" })) }} onBlur={() => validateField("firstName")} className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.firstName ? "border-red-400 dark:border-red-500" : ""}`} placeholder="First Name" />
            {errors.firstName && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.firstName}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name:</label>
            <input value={lastName} onChange={e => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: "" })) }} onBlur={() => validateField("lastName")} className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.lastName ? "border-red-400 dark:border-red-500" : ""}`} placeholder="Last Name" />
            {errors.lastName && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.lastName}</div>}
          </div>
        </div>

        {/* Emails side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email:</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })) }} onBlur={() => validateField("email")} className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.email ? "border-red-400 dark:border-red-500" : ""}`} placeholder="Email" />
            {errors.email && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Email:</label>
            <input type="email" value={confirmEmail} onChange={e => { setConfirmEmail(e.target.value); setErrors(prev => ({ ...prev, confirmEmail: "" })) }} onBlur={() => validateField("confirmEmail")} className={`w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.confirmEmail ? "border-red-400 dark:border-red-500" : ""}`} placeholder="Confirm Email" />
            {errors.confirmEmail && <div className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.confirmEmail}</div>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Back</button>
          <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"> {editId ? "Save Changes" : "Add User"} </button>
        </div>
      </form>
    </div>
  )
}