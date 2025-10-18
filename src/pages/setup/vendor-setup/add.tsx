"use client"

import React from "react"
import Link from "@/components/link"
import * as yup from "yup"

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

type FormState = {
  organizationName: string
  organizationCode: string
  type: string
  description: string
  riskLevel: string
  address1: string
  address2: string
  address3: string
  country: string
  countryOther: string
  state: string
  stateOther: string
  city: string
  zip: string
  website: string
  supportNumber: string
  contactFirst: string
  contactLast: string
  phoneCountryCode: string
  workPhone: string
  email: string
  confirmEmail: string
  category: string
  status: "Active" | "Pending" | "Inactive"
  attachments: File[]
}

type Toast = {
  id: string
  type: "success" | "error"
  title: string
  message: string
}

const FILE_MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

// strict yup schema (unchanged)
const schema = yup.object({
  organizationName: yup.string().trim().required("Organization name is required").min(2, "Organization name too short"),
  organizationCode: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^[A-Za-z0-9-_]*$/, "Code can only contain letters, numbers, - and _")
    .max(20, "Code too long"),
  type: yup.string().oneOf(["Vendor", "Partner", "Customer"], "Select a valid type").required("Type is required"),
  description: yup.string().trim().max(500, "Description max 500 characters").notRequired(),
  riskLevel: yup.string().oneOf(["", "Low", "Medium", "High"]).notRequired(),
  address1: yup.string().trim().required("Address 1 is required").min(5, "Enter a valid address"),
  address2: yup.string().trim().notRequired(),
  address3: yup.string().trim().notRequired(),
  country: yup.string().required("Country is required"),
  countryOther: yup.string().when("country", (countryValue: any, schema: yup.StringSchema) => {
    return countryValue === "Other"
      ? yup.string().trim().required("Enter other country").min(2)
      : yup.string().notRequired().nullable()
  }),
  state: yup.string().required("State/Province is required"),
  stateOther: yup.string().when("state", (stateValue: any, schema: yup.StringSchema) => {
    return stateValue === "Other"
      ? yup.string().trim().required("Enter state/province").min(2)
      : yup.string().notRequired().nullable()
  }),
  city: yup.string().trim().notRequired(),
  zip: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^[A-Za-z0-9\- ]{2,10}$/, "Enter a valid zip/postal code"),
  website: yup.string().trim().notRequired().url("Enter a valid URL"),
  supportNumber: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^[0-9\-\s()+]{5,20}$/, "Enter a valid support number"),
  contactFirst: yup.string().trim().required("Contact first name is required").matches(/^[A-Za-z' -]{2,}$/, "Invalid first name"),
  contactLast: yup.string().trim().required("Contact last name is required").matches(/^[A-Za-z' -]{2,}$/, "Invalid last name"),
  phoneCountryCode: yup.string().trim().required("Country code required").matches(/^\+\d{1,3}$/, "Invalid country code"),
  workPhone: yup
    .string()
    .trim()
    .required("Work phone is required")
    .matches(/^[0-9\-\s()]{7,15}$/, "Enter a valid phone number (7-15 digits)"),
  email: yup.string().trim().required("Email is required").email("Enter a valid email"),
  confirmEmail: yup
    .string()
    .trim()
    .required("Confirm email is required")
    .oneOf([yup.ref("email")], "Emails do not match"),
  category: yup.string().trim().required("Category is required"),
  status: yup.string().oneOf(["Active", "Pending", "Inactive"]).required(),
  attachments: yup
    .array()
    .of(yup.mixed<File>())
    .test("file-count", "Max 5 attachments", (arr) => !arr || arr.length <= 5)
    .test("file-size", "Each file must be <= 5MB", (arr) => {
      if (!arr) return true
      return arr.every((f) => (f instanceof File ? f.size <= FILE_MAX_BYTES : true))
    })
    .test("file-type", "Unsupported file type", (arr) => {
      if (!arr) return true
      return arr.every((f) => (f instanceof File ? ALLOWED_TYPES.includes(f.type) : true))
    }),
})

export default function AddOrganizationPage() {
  const [form, setForm] = React.useState<FormState>({
    organizationName: "",
    organizationCode: "",
    type: "",
    description: "",
    riskLevel: "",
    address1: "",
    address2: "",
    address3: "",
    country: "",
    countryOther: "",
    state: "",
    stateOther: "",
    city: "",
    zip: "",
    website: "",
    supportNumber: "",
    contactFirst: "",
    contactLast: "",
    phoneCountryCode: "+1",
    workPhone: "",
    email: "",
    confirmEmail: "",
    category: "",
    status: "Active",
    attachments: [],
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const renderWarning = (key: keyof FormState) =>
    errors[key] ? <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{errors[key]}</p> : null

  const update = (k: keyof FormState, v: any) => {
    setForm((s) => ({ ...s, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const validate = async (): Promise<boolean> => {
    try {
      await schema.validate(form, { abortEarly: false, strict: true })
      setErrors({})
      return true
    } catch (err: any) {
      if (err && err.inner && Array.isArray(err.inner)) {
        const mapped: Record<string, string> = {}
        err.inner.forEach((ve: yup.ValidationError) => {
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

  const resetForm = () =>
    setForm({
      organizationName: "",
      organizationCode: "",
      type: "",
      description: "",
      riskLevel: "",
      address1: "",
      address2: "",
      address3: "",
      country: "",
      countryOther: "",
      state: "",
      stateOther: "",
      city: "",
      zip: "",
      website: "",
      supportNumber: "",
      contactFirst: "",
      contactLast: "",
      phoneCountryCode: "+1",
      workPhone: "",
      email: "",
      confirmEmail: "",
      category: "",
      status: "Active",
      attachments: [],
    })

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    update("attachments", [...form.attachments, ...Array.from(files)])
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
      const fd = new FormData()

      const sendKeys: Array<keyof FormState> = [
        "organizationName","organizationCode","type","description","riskLevel",
        "address1","address2","address3","country","countryOther","state","stateOther",
        "city","zip","website","supportNumber","contactFirst","contactLast",
        "phoneCountryCode","workPhone","email","category","status"
      ]

      for (const k of sendKeys) {
        const v = form[k] as string | undefined
        if (v === undefined || v === null || v === '') continue
        fd.append(k, v)
      }

      for (const f of form.attachments || []) {
        fd.append("attachments", f, f.name)
      }

      const url = API_BASE.replace(/\/$/, '') + "/api/setup/vendor"
      const res = await fetch(url, {
        method: "POST",
        body: fd,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = body.error || (body.errors ? JSON.stringify(body.errors) : `HTTP ${res.status}`)
        throw new Error(msg)
      }

      await res.json()
      addToast({
        type: "success",
        title: "Success!",
        message: "Organization added successfully."
      })
      
      setTimeout(() => {
        window.location.href = "/setup/vendor-setup"
      }, 1500)
    } catch (err: any) {
      console.error("save error", err)
      addToast({
        type: "error",
        title: "Failed to save",
        message: err?.message || "An unknown error occurred"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase =
    "w-full rounded px-2 py-1.5 text-sm border focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
  const inputTheme =
    "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300"
  const sectionTitle = "text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Add Organization</h1>
        <Link
          href="/setup/vendor-setup"
          className="text-sm text-slate-700 dark:text-slate-200 border rounded px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        >
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
        <div className="p-6 space-y-6">
          {/* Organization Info */}
          <div>
            <h2 className={sectionTitle}>Organization Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Organization Name */}
              <div>
                <label className={labelClass}>
                  Organization Name <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  value={form.organizationName}
                  onChange={(e) => update("organizationName", e.target.value)}
                  className={`${inputBase} ${inputTheme} ${errors.organizationName ? "border-rose-500" : ""}`}
                  placeholder="Organization Name"
                />
                {renderWarning("organizationName")}
              </div>
              <div>
                <label className={labelClass}>Organization Code</label>
                <input
                  value={form.organizationCode}
                  onChange={(e) => update("organizationCode", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="Code"
                />
                {renderWarning("organizationCode")}
              </div>
              <div>
                <label className={labelClass}>
                  Type <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                >
                  <option value="">Type...</option>
                  <option>Vendor</option>
                  <option>Partner</option>
                  <option>Customer</option>
                </select>
                {renderWarning("type")}
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value as any)}
                  className={`${inputBase} ${inputTheme} max-w-xs`}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {renderWarning("status")}
              </div>
            </div>
          </div>

          {/* Risk & Category */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Risk & Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Risk</label>
                <select
                  value={form.riskLevel}
                  onChange={(e) => update("riskLevel", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                >
                  <option value="">Risk...</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                {renderWarning("riskLevel")}
              </div>
              <div>
                <label className={labelClass}>
                  Category <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                >
                  <option value="">Category...</option>
                  <option>Category A</option>
                  <option>Category B</option>
                </select>
                {renderWarning("category")}
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="https://..."
                />
                {renderWarning("website")}
              </div>
              <div>
                <label className={labelClass}>Support #</label>
                <input
                  value={form.supportNumber}
                  onChange={(e) => update("supportNumber", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="Support number"
                />
                {renderWarning("supportNumber")}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Description</h2>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={`${inputBase} ${inputTheme} w-full`}
              placeholder="Short description"
              rows={2}
            />
            {renderWarning("description")}
          </div>

          {/* Address */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>
                  Addr 1 <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  value={form.address1}
                  onChange={(e) => update("address1", e.target.value)}
                  className={`${inputBase} ${inputTheme} ${errors.address1 ? "border-rose-500" : ""}`}
                  placeholder="Address 1"
                />
                {renderWarning("address1")}
              </div>
              <div>
                <label className={labelClass}>Addr 2</label>
                <input
                  value={form.address2}
                  onChange={(e) => update("address2", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="Address 2"
                />
                {renderWarning("address2")}
              </div>
              <div>
                <label className={labelClass}>Addr 3</label>
                <input
                  value={form.address3}
                  onChange={(e) => update("address3", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="Address 3"
                />
                {renderWarning("address3")}
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="City"
                />
                {renderWarning("city")}
              </div>
              <div>
                <label className={labelClass}>
                  Country <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <select
                  value={form.country}
                  onChange={(e) => {
                    update("country", e.target.value)
                    if (e.target.value !== "Other") update("countryOther", "")
                  }}
                  className={`${inputBase} ${inputTheme}`}
                >
                  <option value="">Country...</option>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Other</option>
                </select>
                {renderWarning("country")}
              </div>
              {form.country === "Other" && (
                <div>
                  <label className={labelClass}>Other Country</label>
                  <input
                    value={form.countryOther}
                    onChange={(e) => update("countryOther", e.target.value)}
                    className={`${inputBase} ${inputTheme}`}
                    placeholder="Enter country"
                  />
                  {renderWarning("countryOther")}
                </div>
              )}
              <div>
                <label className={labelClass}>
                  State <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <select
                  value={form.state}
                  onChange={(e) => {
                    update("state", e.target.value)
                    if (e.target.value !== "Other") update("stateOther", "")
                  }}
                  className={`${inputBase} ${inputTheme}`}
                >
                  <option value="">State...</option>
                  <option>State 1</option>
                  <option>State 2</option>
                  <option>Other</option>
                </select>
                {renderWarning("state")}
              </div>
              {form.state === "Other" && (
                <div>
                  <label className={labelClass}>Other State</label>
                  <input
                    value={form.stateOther}
                    onChange={(e) => update("stateOther", e.target.value)}
                    className={`${inputBase} ${inputTheme}`}
                    placeholder="Enter state"
                  />
                  {renderWarning("stateOther")}
                </div>
              )}
              <div>
                <label className={labelClass}>Zip</label>
                <input
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="Zip"
                />
                {renderWarning("zip")}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Contact</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px]">
                <label className={labelClass}>First</label>
                <input
                  value={form.contactFirst}
                  onChange={(e) => update("contactFirst", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="First name"
                />
                {renderWarning("contactFirst")}
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className={labelClass}>Last</label>
                <input
                  value={form.contactLast}
                  onChange={(e) => update("contactLast", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="Last name"
                />
                {renderWarning("contactLast")}
              </div>

              <div className="w-20">
                <label className={labelClass}>Code</label>
                <select
                  value={form.phoneCountryCode}
                  onChange={(e) => update("phoneCountryCode", e.target.value)}
                  className={`${inputBase} ${inputTheme} text-sm max-w-[64px]`}
                >
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                  <option value="+91">+91</option>
                  <option value="Other">Other</option>
                </select>
                {renderWarning("phoneCountryCode")}
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className={labelClass}>
                  Work Phone <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  value={form.workPhone}
                  onChange={(e) => update("workPhone", e.target.value)}
                  className={`${inputBase} ${inputTheme} max-w-xs`}
                  placeholder="Work phone"
                  maxLength={10}
                />
                {renderWarning("workPhone")}
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className={labelClass}>
                  Email <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="abc@example.com"
                />
                {renderWarning("email")}
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className={labelClass}>
                  Confirm Email <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.confirmEmail}
                  onChange={(e) => update("confirmEmail", e.target.value)}
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="abc@example.com"
                />
                {renderWarning("confirmEmail")}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Attachments</h2>
            <div className="border rounded p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <input
                type="file"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="mt-1 text-sm w-full text-slate-900 dark:text-slate-200"
              />
              {renderWarning("attachments")}
              {form.attachments.length > 0 && (
                <ul className="mt-2 text-xs space-y-1 text-slate-700 dark:text-slate-200">
                  {form.attachments.map((f, i) => (
                    <li key={i} className="truncate">
                      {f.name} ({Math.round(f.size / 1024)} KB)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded bg-rose-600 hover:bg-rose-700 text-white text-sm"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border rounded bg-sky-600 hover:bg-sky-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Add Organization"}
            </button>
          </div>
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
                  : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${
                      toast.type === "success"
                        ? "text-emerald-900 dark:text-emerald-100"
                        : "text-rose-900 dark:text-rose-100"
                    }`}
                  >
                    {toast.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      toast.type === "success"
                        ? "text-emerald-700 dark:text-emerald-200"
                        : "text-rose-700 dark:text-rose-200"
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