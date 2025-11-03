"use client"

import React from "react"
import Link from "@/components/link"
import * as yup from "yup"
import PolicyEditor from "@/components/toolbar"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

// API base (same pattern used elsewhere in the app)
const API_BASE = typeof window !== "undefined"
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
  : "http://localhost:3000"

// Seed data for demo (since API might not work)
const seedPolicies: any[] = [
  {
    id: 1,
    name: "IPs Removal Policy",
    title: "Data Security Policy",
    category: "Data Security and Privacy",
    citation_name: "GDPR Article 17",
    reviewer: "John Doe",
    approver: "Tonia",
    reviewer_is_owner: false,
    description: "This policy outlines the procedures for removing personally identifiable information from our systems.",
    content: "1. Scope\nThis policy applies to all data subjects and covers all personal data processing activities.\n\n2. Rights\nData subjects have the right to request deletion of their personal data under certain circumstances.\n\n3. Procedures\nAll deletion requests must be processed within 30 days of receipt.",
    exp_date: "2026-03-31",
    status: "Published",
    attachments: [
      { filename: "gdpr-guidelines.pdf", file_size: 1024000 }
    ]
  },
  {
    id: 2,
    name: "Acceptable Use",
    title: "Acceptable Use Policy",
    category: "IT Policy",
    citation_name: "ISO 27001",
    reviewer: "Jane Smith",
    approver: "Cole",
    reviewer_is_owner: true,
    description: "Guidelines for acceptable use of company IT resources and systems.",
    content: "1. Purpose\nTo establish guidelines for the appropriate use of company technology resources.\n\n2. Scope\nThis policy applies to all employees, contractors, and third parties.\n\n3. Acceptable Use\n- Use systems for business purposes only\n- Maintain confidentiality of access credentials\n- Report security incidents immediately",
    exp_date: "2025-12-31",
    status: "Draft",
    attachments: []
  },
]

export default function ManagePoliciesAdd() {
  const [policyId, setPolicyId] = React.useState<string | null>(null)
  const [isEdit, setIsEdit] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [existingAttachments, setExistingAttachments] = React.useState<any[]>([])

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  // For edit mode, start directly in create step; for add mode, start at chooser
  const [step, setStep] = React.useState<"choose" | "upload" | "create">("choose")
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null)
  const [policy, setPolicy] = React.useState({
    name: "",
    title: "",
    category: "",
    citation: "",
    reviewer: "",
    approver: "",
    description: "",
    content: "",
    reviewerIsOwner: false,
    expDate: null as Date | null,
    status: "Draft",
  })
  const [toast, setToast] = React.useState<{ text: string; type?: "success" | "error" } | null>(null)
  const toastTimer = React.useRef<number | null>(null)

  // Check URL for edit mode
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    if (id) {
      setPolicyId(id)
      setIsEdit(true)
      setStep("create") // Skip chooser for edit mode
    }
  }, [])

  // Load policy data when editing
  React.useEffect(() => {
    if (!policyId || !isEdit) return

    let mounted = true
    setLoading(true)

    const loadPolicy = async () => {
      try {
        // Try API first, fall back to seed data
        let data = null
        
        try {
          const url = `${API_BASE.replace(/\/$/, '')}/api/manage-policies/${policyId}`
          const res = await fetch(url)
          if (res.ok) {
            const body = await res.json()
            data = body.data ?? body
          }
        } catch (apiErr) {
          console.log('API not available, using seed data')
        }

        // Fallback to seed data
        if (!data) {
          data = seedPolicies.find(p => p.id === parseInt(policyId))
          if (!data) throw new Error('Policy not found')
        }

        if (!mounted) return

        setPolicy({
          name: data.name || '',
          title: data.title || '',
          category: data.category || '',
          citation: data.citation_name || '',
          reviewer: data.reviewer || '',
          approver: data.approver || '',
          reviewerIsOwner: !!data.reviewer_is_owner,
          description: data.description || '',
          content: data.content || '',
          expDate: data.exp_date ? new Date(data.exp_date) : null,
          status: data.status || 'Draft',
        })

        setExistingAttachments(data.attachments || [])
        
        showToast("Policy data loaded for editing.", "success")

      } catch (err: any) {
        console.error('Failed to load policy:', err)
        showToast(err.message || "Failed to load policy data", "error")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadPolicy()
    return () => { mounted = false }
  }, [policyId, isEdit])

  React.useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setFile(f)
  }

  // Yup schemas (strict)
  const createSchema = yup
    .object()
    .strict(true)
    .shape({
      name: yup.string().strict(true).required("Policy Name is required").trim().min(2, "Policy Name is too short"),
      title: yup.string().strict(true).required("Title is required").trim(),
      category: yup.string().strict(true).required("Category is required"),
      citation: yup.string().strict(true).nullable().notRequired(),
      reviewerIsOwner: yup.boolean().strict(true).required(),
      reviewer: yup.string().strict(true).nullable().notRequired(),
      approver: yup.string().strict(true).nullable().notRequired(),
      description: yup.string().strict(true).max(250, "Description must be 250 characters or less").nullable().notRequired(),
      content: yup.string().strict(true).nullable().notRequired(),
      expDate: yup.date().nullable().notRequired(),
      status: yup.mixed().strict(true).oneOf(["Draft", "Published", "Archived"], "Invalid status").required(),
    })

  const fileSchema = yup
    .mixed()
    .strict(true)
    .required("Please choose a PDF file")
    .test("fileType", "Only PDF files are allowed", (f: any) => !!f && f.type === "application/pdf")
    .test("fileSize", "File size must be <= 10MB", (f: any) => !!f && f.size <= 10 * 1024 * 1024)

  const handleUpload = async (e?: React.FormEvent) => {
    e?.preventDefault()
    try {
      await fileSchema.validate(file, { abortEarly: false, strict: true })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        showToast(err.errors.join("; "), "error")
        return
      }
      showToast("Invalid file", "error")
      return
    }

    setIsUploading(true)
    try {
      const fd = new FormData()
      // send field name "attachments" so multer/upload.array('attachments') accepts it on server
      fd.append("attachments", file as File)

      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/manage-policies/upload`, {
        method: "POST",
        body: fd,
      })

      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = body?.message || body?.error || `Upload failed (${res.status})`
        throw new Error(msg)
      }

      // Normalize response: backend may return { success:true, data: { ... } } or { success:true, files: [...] }
      const uploaded = body?.data ?? body?.files ?? body
      const fileList = Array.isArray(uploaded) ? uploaded : [uploaded]

      // If controller returns file metadata, add to existingAttachments and move to create step
      if (fileList && fileList.length) {
        // try to map common fields to what the UI expects
        const mapped = fileList.map((f: any) => ({
          filename: f.filename || f.original_name || f.file_name || f.name,
          original_name: f.original_name || f.name || f.originalname,
          file_path: f.file_path || f.path || f.location || (f.url ? f.url.replace(/^\//, '') : null),
          file_size: f.file_size || f.size || 0,
          mime_type: f.mime_type || f.mimetype || f.type
        }))
        setExistingAttachments(prev => [...prev, ...mapped])
      }

      showToast("PDF uploaded", "success")
      // go to create form so user can continue and attach the uploaded PDF to the policy
      setStep("create")
    } catch (err: any) {
      console.error("upload error", err)
      showToast(err?.message || "Upload failed", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (k: string, v: any) => setPolicy((p) => ({ ...p, [k]: v }))

  const resetForm = () => {
    setPolicy({
      name: "",
      title: "",
      category: "",
      citation: "",
      reviewer: "",
      approver: "",
      description: "",
      content: "",
      reviewerIsOwner: false,
      expDate: null,
      status: "Draft",
    })
  }

  const handleCreateSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    // Convert date to American format for submission
    const submission = {
      name: policy.name,
      title: policy.title,
      category: policy.category,
      citation_name: policy.citation || null,
      reviewer: policy.reviewer || null,
      approver: policy.approver || null,
      reviewerIsOwner: Boolean(policy.reviewerIsOwner),
      description: policy.description || null,
      content: policy.content || null,
      // send ISO date (YYYY-MM-DD) or null
      expDate: policy.expDate ? policy.expDate.toISOString().split("T")[0] : null,
      status: policy.status || "Draft",
    }

    try {
      await createSchema.validate(policy, { abortEarly: false, strict: true })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        showToast(err.errors.join(". "), "error")
        return
      }
      showToast("Validation failed", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const url = isEdit 
        ? `${API_BASE.replace(/\/$/, '')}/api/manage-policies/${policyId}`
        : `${API_BASE.replace(/\/$/, '')}/api/manage-policies`
      
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = body?.message || (Array.isArray(body?.errors) ? body.errors.join(", ") : `HTTP ${res.status}`)
        throw new Error(message)
      }
      showToast(isEdit ? "Policy updated" : "Policy created", "success")
      setTimeout(() => (window.location.href = "/manage-policies"), 700)
    } catch (err: any) {
      console.error("create/update policy error", err)
      showToast(err?.message || `Failed to ${isEdit ? 'update' : 'create'} policy`, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save as draft (skip frontend strict validation so partial drafts allowed)
  const handleSaveDraft = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setIsSubmitting(true)
    try {
      const submission = {
        name: policy.name || null,
        title: policy.title || null,
        category: policy.category || null,
        citation_name: policy.citation || null,
        reviewer: policy.reviewer || null,
        approver: policy.approver || null,
        reviewerIsOwner: Boolean(policy.reviewerIsOwner),
        description: policy.description || null,
        content: policy.content || null,
        expDate: policy.expDate ? policy.expDate.toISOString().split("T")[0] : null,
        status: "Draft",
      }

      const url = isEdit 
        ? `${API_BASE.replace(/\/$/, '')}/api/manage-policies/${policyId}`
        : `${API_BASE.replace(/\/$/, '')}/api/manage-policies`
      
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = body?.message || (Array.isArray(body?.errors) ? body.errors.join(", ") : `HTTP ${res.status}`)
        throw new Error(message)
      }
      showToast("Draft saved", "success")
      setTimeout(() => (window.location.href = "/manage-policies"), 700)
    } catch (err: any) {
      console.error("save draft error", err)
      showToast(err?.message || "Failed to save draft", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-slate-600">Loading policy data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {isEdit ? 'Edit Policy' : 'Manage Policy'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEdit ? 'Update the policy details below.' : "Choose how you'd like to add a policy."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/manage-policies" className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-100 hover:shadow">
              Back
            </Link>
            <button
              type="button"
              onClick={() => (window.location.href = "/manage-policies")}
              className="px-3 py-2 text-sm rounded bg-rose-600 text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* STEP 1: chooser (only show in add mode) */}
          {step === "choose" && !isEdit && (
            <div className="flex items-center justify-center py-8">
              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setStep("upload")}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg border hover:shadow transition bg-white dark:bg-slate-800"
                >
                  <div className="text-sky-600 bg-sky-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Upload PDF</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Upload an existing policy PDF</div>
                </button>

                <button
                  onClick={() => setStep("create")}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg border hover:shadow transition bg-white dark:bg-slate-800"
                >
                  <div className="text-emerald-600 bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Create New Policy</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Compose a new policy using the editor</div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2a: Upload form (only in add mode) */}
          {step === "upload" && !isEdit && (
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm text-slate-700 dark:text-slate-300">Select Policy (optional)</label>
                <div className="md:col-span-2">
                  <select className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    <option value="">-- choose policy --</option>
                    <option>IPs Removal Policy</option>
                    <option>Acceptable Use</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <div className="border-2 border-dashed rounded-lg p-6 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">Drag & drop PDF here or choose file</div>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border rounded cursor-pointer">
                          Choose file
                          <input type="file" accept="application/pdf" onChange={handleFileChange} className="sr-only" />
                        </label>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{file ? file.name : "No file chosen"}</div>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">Allowed: PDF. Max 10MB (demo)</div>
                    </div>

                    <div className="w-40 text-right">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full px-4 py-2 bg-sky-600 text-white rounded-md disabled:opacity-60"
                      >
                        {isUploading ? "Uploading…" : "Upload"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep("choose")}
                        className="mt-3 w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-md hover:shadow"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2b: Create form (both add and edit modes) */}
          {step === "create" && (
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Policy Name *</label>
                      <input
                        value={policy.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Policy Name"
                        className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category *</label>
                      <select
                        value={policy.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">Select a category...</option>
                        <option>Data Security and Privacy</option>
                        <option>IT Policy</option>
                        <option>HR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
                      <input
                        value={policy.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Select a title..."
                        className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Citation</label>
                      <input
                        value={policy.citation}
                        onChange={(e) => handleChange("citation", e.target.value)}
                        placeholder="Select a citation..."
                        className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3">
                      <input
                        id="reviewer-is-owner"
                        type="checkbox"
                        checked={policy.reviewerIsOwner}
                        onChange={(e) => handleChange("reviewerIsOwner", e.target.checked)}
                        className="h-4 w-4 rounded border"
                      />
                      <label htmlFor="reviewer-is-owner" className="text-sm text-slate-700 dark:text-slate-300">
                        Check if the reviewer is the Policy Owner?
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reviewer</label>
                      <input
                        value={policy.reviewer}
                        onChange={(e) => handleChange("reviewer", e.target.value)}
                        placeholder="Select Policy Reviewer..."
                        className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Approver</label>
                      <input
                        value={policy.approver}
                        onChange={(e) => handleChange("approver", e.target.value)}
                        placeholder="Select Policy Approver..."
                        className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* full-width description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea
                      value={policy.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Only 250 Characters"
                      maxLength={250}
                      className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      rows={3}
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{policy.description.length}/250</div>
                  </div>
                </div>

                {/* RIGHT SIDEBAR with small inputs */}
                <aside className="lg:col-span-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Exp Date</label>
                    <DatePicker
                      selected={policy.expDate}
                      onChange={(date) => handleChange("expDate", date)}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="MM/DD/YYYY"
                      className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      calendarClassName="bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg"
                      dayClassName={(date) => 
                        "text-gray-900 dark:text-gray-100 hover:bg-blue-500 hover:text-white cursor-pointer"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Citation (select)</label>
                    <select
                      className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      value={policy.citation}
                      onChange={(e) => handleChange("citation", e.target.value)}
                    >
                      <option value="">Select a citation...</option>
                      <option>ISO 27001</option>
                      <option>NIST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={policy.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option>Draft</option>
                      <option>Published</option>
                      <option>Archived</option>
                    </select>
                  </div>

                  {/* Existing attachments (edit mode) */}
                  {isEdit && existingAttachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Existing Attachments</label>
                      <div className="space-y-1">
                        {existingAttachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            <span className="text-slate-600 dark:text-slate-400">📎</span>
                            <span className="text-slate-700 dark:text-slate-300 flex-1">
                              {att.filename || att.original_name || 'Unknown file'}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({att.file_size ? `${Math.round(att.file_size / 1024)} KB` : 'unknown size'})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-sky-100 text-sky-700 rounded-md border hover:shadow disabled:opacity-60"
                      >
                        Save Draft
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-60"
                      >
                        {isSubmitting ? "Saving…" : isEdit ? "Update" : "Submit"}
                      </button>
                    </div>
                    <div className="mt-3 flex gap-3">
                      {!isEdit && (
                        <button type="button" onClick={() => setStep("choose")} className="text-sm text-slate-500 hover:underline">
                          Back to choice
                        </button>
                      )}
                      {!isEdit && (
                        <button 
                          type="button" 
                          onClick={resetForm} 
                          className="text-sm text-rose-600 hover:underline ml-auto"
                        >
                          Reset Form
                        </button>
                      )}
                    </div>
                  </div>
                </aside>
              </div>

              {/* RICH EDITOR TOOLBAR + EDITOR */}
              <div>
                <PolicyEditor
                  initialContent={policy.content}
                  onChange={(html) => handleChange("content", html)}
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-50">
          <div
            role="status"
            className={`px-4 py-2 rounded shadow text-sm ${toast.type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}
          >
            {toast.text}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
        }
        .react-datepicker {
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .dark .react-datepicker__header {
          background-color: #374151;
          border-bottom: 1px solid #4b5563;
          color: #e5e7eb;
        }
        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        .react-datepicker__day--today {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        .dark .react-datepicker__day--today {
          background-color: #1e3a8a;
          color: #93c5fd;
        }
      ` }} />
    </div>
  )
}
