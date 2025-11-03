import React, { useState, useEffect, useRef } from "react"
import * as yup from "yup"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

// Add API base
const API_BASE = typeof window !== "undefined"
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
  : "http://localhost:3000"

type FormState = {
  forScope: "org" | "company"
  orgCode: string
  companyName: string
  certType: string
  file: File | null
  expDate: Date | null
  frequency: string
  comment: string
  orgReadOnly?: boolean
}

const INITIAL_CERT_TYPES = [
  { id: 1, type: "Professional Liability" },
  { id: 2, type: "Commercial General Liability" },
  { id: 3, type: "Client Information Request" },
  { id: 4, type: "Physical Security Audit" },
  { id: 5, type: "Bar Card Proof of Good Standing" },
  { id: 6, type: "Errors and Omission" },
  { id: 7, type: "Directors and Officers" },
]

const schema = yup
  .object()
  .strict(true)
  .shape({
    forScope: yup.string().oneOf(["org", "company"]).required(),
    // only require orgCode when scope=org AND orgReadOnly is NOT true
    orgCode: yup.string().trim().when(["forScope", "orgReadOnly"], {
      is: (forScope: any, orgReadOnly: any) => forScope === "org" && !orgReadOnly,
      then: (s) => s.required("Organisation code is required"),
      otherwise: (s) => s.optional(),
    }),
    companyName: yup.string().trim().when("forScope", {
      is: "company",
      then: (s) => s.required("Company is required"),
      otherwise: (s) => s.optional(),
    }),
    certType: yup.string().trim().when("forScope", {
      is: "company",
      then: (s) => s.required("Certificate type is required"),
      otherwise: (s) => s.optional(),
    }),
    // file validation: size/type checks are applied but requirement is enforced in handleSubmit
    file: yup
      .mixed()
      .nullable()
      .test("fileSize", "File must be smaller than 5MB", (f: any) => {
        if (!f) return true
        return f.size && f.size <= 5 * 1024 * 1024
      })
      .test("fileType", "Unsupported file type", (f: any) => {
        if (!f) return true
        const allowed = ["application/pdf", "image/png", "image/jpeg"]
        return allowed.includes(f.type)
      }),
    expDate: yup
      .date()
      .when("forScope", {
        is: "company",
        then: (s) => s.typeError("Expiry date is required")
          .required("Expiry date is required")
          .min(new Date(1900, 0, 1), "Expiry date is invalid"),
        otherwise: (s) => s.optional(),
      }),
    frequency: yup.string().when("forScope", {
      is: "company",
      then: (s) => s.required("Frequency is required"),
      otherwise: (s) => s.optional(),
    }),
    comment: yup.string().max(2000, "Comment is too long"),
  })

export default function AddCertificatePage() {
  const [form, setForm] = useState<FormState>({
    forScope: "org",
    orgCode: "",
    companyName: "",
    certType: "",
    file: null,
    expDate: null,
    frequency: "",
    comment: "",
    orgReadOnly: false, // set true when org field is read-only (pre-filled)
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newCertType, setNewCertType] = useState("")
  const [certTypes, setCertTypes] = useState(INITIAL_CERT_TYPES)
  const [errorMessage, setErrorMessage] = useState("")
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [uploadedFile, setUploadedFile] = useState<any>(null) // store backend response for uploaded file
  const orgInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [removeExistingFile, setRemoveExistingFile] = useState(false)
  
  // show existing filename when editing / if a new file selected
  const displayFileName = form.file
    ? form.file.name
    : (uploadedFile?.original_name || uploadedFile?.filename) ?? "Choose file (PDF, PNG, JPG) - max 5MB"

  const [editId, setEditId] = useState<number | null>(null)
  const isEdit = editId !== null

  // auto-hide toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // keep orgReadOnly in form synced with actual input.readOnly
  useEffect(() => {
    const isReadOnly = !!orgInputRef.current?.readOnly
    setForm((s) => (s.orgReadOnly === isReadOnly ? s : { ...s, orgReadOnly: isReadOnly }))
    // run when scope or orgCode changes (in case parent/prop toggles readOnly)
  }, [form.forScope, form.orgCode])

  // prefetch when editing (reads ?id= in URL) - plain React (no next/navigation)
  useEffect(() => {
    let mounted = true

    async function loadForId(id: number) {
      try {
        const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/certificates/${id}`)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (mounted) setToast({ msg: body?.error || "Failed to load certificate", type: "error" })
          return
        }
        const data = body?.data ?? body
        if (!data || !mounted) return

        setEditId(id)
        setForm((s) => ({
          ...s,
          forScope: data.scope ?? (data.org_code ? "org" : "company"),
          orgCode: data.org_code ?? data.orgCode ?? "",
          companyName: data.company_name ?? data.companyName ?? "",
          certType: data.cert_type ?? data.certType ?? "",
          expDate: data.exp_date ? new Date(data.exp_date) : (data.expDate ? new Date(data.expDate) : null),
          frequency: data.frequency ?? "",
          comment: data.comment ?? "",
          orgReadOnly: !!(data.org_code)
        }))
        setUploadedFile({
          id: data.id,
          filename: data.filename,
          original_name: data.original_name,
          file_path: data.file_path,
          file_size: data.file_size,
          mime_type: data.mime_type,
          uploaded_at: data.uploaded_at
        })
      } catch (err: any) {
        console.error("prefetch certificate error", err)
        if (mounted) setToast({ msg: String(err?.message || "Failed to fetch certificate"), type: "error" })
      }
    }

    function handleLocationChange() {
      const params = new URLSearchParams(window.location.search)
      const idStr = params.get("id")
      if (!idStr) {
        if (mounted) {
          setEditId(null)
        }
        return
      }
      const id = Number(idStr)
      if (!id || Number.isNaN(id)) {
        if (mounted) setEditId(null)
        return
      }
      // fetch if different id
      if (id !== editId) loadForId(id)
    }

    // initial
    handleLocationChange()

    // patch history methods so SPA nav triggers our handler
    const origPush = history.pushState
    const origReplace = history.replaceState
    history.pushState = function (...args: any[]) {
      const r = origPush.apply(this, args as any)
      window.dispatchEvent(new Event("locationchange"))
      return r
    }
    history.replaceState = function (...args: any[]) {
      const r = origReplace.apply(this, args as any)
      window.dispatchEvent(new Event("locationchange"))
      return r
    }
    const onPop = () => handleLocationChange()
    const onLoc = () => handleLocationChange()
    window.addEventListener("popstate", onPop)
    window.addEventListener("locationchange", onLoc)

    return () => {
      mounted = false
      window.removeEventListener("popstate", onPop)
      window.removeEventListener("locationchange", onLoc)
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [editId])

  const isOrgScope = form.forScope === "org"

  const resetForm = () => {
    setForm({
      forScope: "org",
      orgCode: "",
      companyName: "",
      certType: "",
      file: null,
      expDate: null,
      frequency: "",
      comment: "",
      orgReadOnly: false,
    })
    setErrors({})
    setEditId(null)
    setUploadedFile(null)
  }

  const handleFileChange = (f: File | null) => {
    setForm((s) => ({ ...s, file: f }))
    setErrors((e) => ({ ...e, file: undefined }))
    // if user selects a new file, clear existing uploadedFile (we'll replace on submit)
    if (f) {
      setUploadedFile(null)
      setRemoveExistingFile(false)
    }
  }

  const handleAddCertType = () => {
    if (!newCertType.trim()) {
      setErrorMessage("Certificate type cannot be empty")
      return
    }

    const exists = certTypes.some(
      item => item.type.toLowerCase() === newCertType.trim().toLowerCase()
    )

    if (exists) {
      setErrorMessage("Certificate type already exists")
      return
    }

    setErrorMessage("")
    // handle empty list safely
    const maxId = certTypes.length ? Math.max(...certTypes.map(item => item.id)) : 0
    const newId = maxId + 1
    setCertTypes(prev => [...prev, { id: newId, type: newCertType.trim() }])
    setForm(s => ({ ...s, certType: newCertType.trim() }))
    setNewCertType("")
    setShowModal(false)
  }

  // ensure modal buttons are not accidental form-submits by setting type="button"
  const handleResetModal = () => {
    setNewCertType("")
    setErrorMessage("")
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setNewCertType("")
    setErrorMessage("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCertType(e.target.value)
    if (errorMessage) {
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSubmitting(true)
    setErrors({})
    setErrorMessage("")
    try {
      // validate current form state (do not convert expDate before validation)
      await schema.validate(form, { abortEarly: false })

      // file is required when creating/updating company entries only if no existing uploaded file and no new file selected
      if (form.forScope === "company" && !form.file && !(isEdit && uploadedFile)) {
        setErrors({ file: "Please select a file" })
        setSubmitting(false)
        return
      }

      // build form data for API
      const fd = new FormData()
      fd.append("scope", form.forScope)
      if (form.forScope === "org") {
        fd.append("org_code", form.orgCode || "")
      } else {
        fd.append("company_name", form.companyName || "")
        fd.append("cert_type", form.certType || "")
        if (form.expDate) {
          // send as YYYY-MM-DD
          const iso = form.expDate.toISOString().slice(0, 10)
          fd.append("exp_date", iso)
        }
        fd.append("frequency", form.frequency || "")
      }
      fd.append("comment", form.comment || "")
      // include file only if user selected a new one
      if (form.file) fd.append("file", form.file)
      // notify backend to remove existing stored file when user removed it in UI
      if (removeExistingFile) fd.append("remove_existing_file", "1")

      const url = isEdit ? `${API_BASE.replace(/\/$/, "")}/api/certificates/${editId}` : `${API_BASE.replace(/\/$/, "")}/api/certificates`
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        body: fd
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        // map backend validation errors to UI
        if (body?.errors && Array.isArray(body.errors)) {
          const next: Partial<Record<keyof FormState, string>> = {}
          // try to map first relevant error
          const first = String(body.errors[0] || "")
          if (first.toLowerCase().includes("orgcode") || first.toLowerCase().includes("org")) next.orgCode = first
          else if (first.toLowerCase().includes("company")) next.companyName = first
          else if (first.toLowerCase().includes("cert")) next.certType = first
          else if (first.toLowerCase().includes("file")) next.file = first
          else setErrorMessage(first)
          setErrors(next)
        } else if (body?.error) {
          setErrorMessage(String(body.error))
        } else {
          setErrorMessage(`Upload failed (${res.status})`)
        }
        setSubmitting(false)
        return
      }

      // success - show toast and store returned file metadata
      const created = body?.data ?? body
      setUploadedFile(created)
      setToast({ msg: isEdit ? "Certificate updated successfully" : "Certificate uploaded successfully", type: "success" })
      // if updated, keep edit mode and update form with returned values
      if (isEdit && created) {
        setForm((s) => ({
          ...s,
          forScope: created.scope ?? s.forScope,
          orgCode: created.org_code ?? created.orgCode ?? s.orgCode,
          companyName: created.company_name ?? created.companyName ?? s.companyName,
          certType: created.cert_type ?? created.certType ?? s.certType,
          expDate: created.exp_date ? new Date(created.exp_date) : s.expDate,
          frequency: created.frequency ?? s.frequency,
          comment: created.comment ?? s.comment
        }))
        // after successful update redirect back to main table
        navigateToList()
      } else {
        resetForm()
        // after successful create redirect back to main table
        navigateToList()
      }
    } catch (err: any) {
      const next: Partial<Record<keyof FormState, string>> = {}
      if (err?.inner && Array.isArray(err.inner)) {
        err.inner.forEach((violation: any) => {
          if (violation.path) next[violation.path as keyof FormState] = violation.message
        })
      } else if (err?.message) {
        setErrorMessage(err.message)
      }
      setErrors(next)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSubmitting(false)
    }
  }

  // helper: navigate to main certificates table (SPA pushState + dispatch)
  const navigateToList = (delay = 250) => {
    setTimeout(() => {
      try {
        history.pushState({}, "", "/licence-and-certificates")
        window.dispatchEvent(new Event("locationchange"))
      } catch {
        // fallback to full navigation if history not available
        window.location.href = "/licence-and-certificates"
      }
    }, delay)
  }

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{isEdit ? "Edit Certificate" : "Add Certificates"}</h1>
        <button
          type="button"
          onClick={() => history.back()}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-sky-600 text-white shadow-sm hover:bg-sky-700"
        >
          Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border p-6 shadow-sm"
        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
        noValidate
      >
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded-md bg-rose-50 text-rose-700 px-4 py-2 text-sm border border-rose-100">
            There are issues with your submission — please review highlighted fields.
          </div>
        )}

        <div className="mb-6 flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="scope"
              checked={form.forScope === "org"}
              onChange={() => setForm((s) => ({ ...s, forScope: "org" }))}
              className="h-4 w-4"
            />
            <span className="text-sm">For Org</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="scope"
              checked={form.forScope === "company"}
              onChange={() => setForm((s) => ({ ...s, forScope: "company" }))}
              className="h-4 w-4"
            />
            <span className="text-sm">For Company</span>
          </label>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">
            {form.forScope === "org" ? "Certificate / Insurance for:" : "Company:"} <span className="text-rose-500">*</span>
          </label>

          <div className="col-span-12 md:col-span-9">
            {form.forScope === "org" ? (
              <>
                <input
                  ref={orgInputRef}
                  value={form.orgCode}
                  onChange={(e) => setForm((s) => ({ ...s, orgCode: e.target.value }))}
                  placeholder="Select Organisation Code"
                  readOnly={!!form.orgReadOnly}
                  className={`w-full h-11 rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${errors.orgCode ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
                  aria-invalid={!!errors.orgCode}
                />
                {errors.orgCode ? (
                  <p className="mt-1 text-sm text-rose-600">{errors.orgCode}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Start typing to search organisation codes.</p>
                )}
              </>
            ) : (
              <>
                <input
                  value={form.companyName}
                  onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
                  placeholder="Select Company"
                  className={`w-full h-11 rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${errors.companyName ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName ? (
                  <p className="mt-1 text-sm text-rose-600">{errors.companyName}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Start typing to search companies.</p>
                )}
              </>
            )}
          </div>

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Certificate Type {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9 flex gap-3 items-center">
            <select
              value={form.certType}
              onChange={(e) => !isOrgScope && setForm((s) => ({ ...s, certType: e.target.value }))}
              disabled={isOrgScope}
              className={`flex-1 h-11 rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${
                isOrgScope
                  ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 text-slate-400 cursor-not-allowed'
                  : errors.certType ? 'border-rose-500' : 'border-slate-200'
              } ${!isOrgScope ? 'bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100' : ''}`}
              aria-invalid={!!errors.certType}
            >
              <option value="">Select Certificate Type...</option>
              {certTypes.map(cert => (
                <option key={cert.id} value={cert.type}>{cert.type}</option>
              ))}
            </select>

            <button
              type="button"
              className={`h-11 px-4 rounded-md flex items-center gap-2 ${
                isOrgScope 
                  ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
              onClick={() => !isOrgScope && setShowModal(true)}
              disabled={isOrgScope}
            >
              Add Type
            </button>
          </div>
          {errors.certType && <p className="col-start-4 col-span-9 mt-1 text-sm text-rose-600">{errors.certType}</p>}

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Select File {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9">
            <label className={`flex items-center justify-between h-11 rounded-md px-3 border cursor-pointer transition ${
              isOrgScope 
                ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 cursor-not-allowed' 
                : errors.file ? "border-rose-500" : "border-slate-200"
            } ${!isOrgScope && 'bg-white/80 dark:bg-slate-800 dark:border-slate-700'}`}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={isOrgScope ? 'text-slate-400' : ''}>
                  <path d="M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={`text-sm ${
                  isOrgScope 
                    ? 'text-slate-400 dark:text-slate-500' 
                    : form.file || uploadedFile ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"
                }`}>
                  {displayFileName}
                </span>
              </div>

              {/* inline actions: replace/remove/clear/open — operate directly on the field */}
              <div className="flex items-center gap-2">
                {/* If user selected a new file show Clear button so they can undo */}
                {form.file ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setForm((s) => ({ ...s, file: null }))
                      // if previously had uploadedFile, restore display to it
                      if (uploadedFile) setRemoveExistingFile(false)
                    }}
                    className="px-3 py-1 h-9 rounded border bg-white text-slate-800 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                ) : null}

                {/* When an existing uploaded file is present and no new file selected, allow replace/remove/open */}
                {!form.file && uploadedFile ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      className="px-3 py-1 h-9 rounded bg-sky-600 text-white hover:bg-sky-700"
                    >
                      Replace
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFile(null)
                        setRemoveExistingFile(true)
                        setForm((s) => ({ ...s, file: null }))
                      }}
                      className="px-3 py-1 h-9 rounded border bg-white text-slate-800 hover:bg-slate-50"
                    >
                      Remove
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const p = (uploadedFile.file_path || uploadedFile.filePath || "").replace(/^\/+/, "")
                        const url = `${API_BASE.replace(/\/$/, "")}/${p}`
                        try { window.open(url, "_blank", "noopener") } catch { window.location.href = url }
                      }}
                      className="px-3 py-1 h-9 rounded border bg-white text-slate-800 hover:bg-slate-50"
                    >
                      Open
                    </button>
                  </>
                ) : null}
              </div>

               <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files ? e.target.files[0] : null
                  if (!isOrgScope) handleFileChange(f)
                }}
                accept=".pdf,image/*"
                aria-invalid={!!errors.file}
                disabled={isOrgScope}
              />
            </label>
            {errors.file ? (
              <p className="mt-1 text-sm text-rose-600">{errors.file}</p>
            ) : (
              <p className={`mt-1 text-xs ${isOrgScope ? 'text-slate-400' : 'text-muted-foreground'}`}>
                We accept PDF and image formats.
              </p>
            )}
          </div>

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Expiry Date {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9">
            <DatePicker
              selected={form.expDate}
              onChange={(date) => !isOrgScope && setForm((s) => ({ ...s, expDate: date }))}
              dateFormat="MM/dd/yyyy"
              placeholderText="MM/DD/YYYY"
              disabled={isOrgScope}
              className={`h-11 w-full rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${
                isOrgScope 
                  ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 text-slate-400 cursor-not-allowed' 
                  : errors.expDate ? "border-rose-500" : "border-slate-200"
              } ${!isOrgScope && 'bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'}`}
              calendarClassName="bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg"
              dayClassName={(date) => 
                "text-gray-900 dark:text-gray-100 hover:bg-blue-500 hover:text-white cursor-pointer"
              }
            />
            {errors.expDate && <p className="mt-1 text-sm text-rose-600">{errors.expDate}</p>}
          </div>

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Frequency {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9">
            <select
              value={form.frequency}
              onChange={(e) => !isOrgScope && setForm((s) => ({ ...s, frequency: e.target.value }))}
              disabled={isOrgScope}
              className={`h-11 w-full rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${
                isOrgScope 
                  ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 text-slate-400 cursor-not-allowed' 
                  : errors.frequency ? "border-rose-500" : "border-slate-200"
              } ${!isOrgScope && 'bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'}`}
              aria-invalid={!!errors.frequency}
            >
              <option value="">Select Frequency</option>
              <option>Annually</option>
              <option>Quarterly</option>
              <option>Monthly</option>
            </select>
            {errors.frequency && <p className="mt-1 text-sm text-rose-600">{errors.frequency}</p>}
          </div>

          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">Comment</label>
          <div className="col-span-12 md:col-span-9">
            <textarea
              value={form.comment}
              onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))}
              rows={5}
              placeholder="Comment"
              className="w-full rounded-md border px-3 py-2 bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
            {errors.comment && <p className="mt-1 text-sm text-rose-600">{errors.comment}</p>}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-md bg-sky-600 text-white shadow hover:bg-sky-700 disabled:opacity-60"
          >
            {isEdit ? "Update Certificate" : "Add Certificate"}
          </button>

          <button type="button" onClick={resetForm} className="h-11 px-4 rounded-md border border-slate-200 text-slate-800 bg-white/60 hover:bg-white dark:border-slate-700 dark:bg-transparent dark:text-slate-100">
            Reset Certificate
          </button>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-sky-600 dark:text-sky-400">Add Certificate Type</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Add Certificate Type Form */}
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate Type: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCertType}
                    onChange={handleInputChange}
                    placeholder="Certificate Type"
                    className={`w-full h-10 px-3 border rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errorMessage 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errorMessage && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errorMessage}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddCertType}
                  className="h-10 px-6 bg-sky-500 hover:bg-sky-600 text-white rounded font-medium flex items-center gap-2"
                >
                  <span>✓</span> Add Type
                </button>
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="h-10 px-6 bg-red-500 hover:bg-red-600 text-white rounded font-medium flex items-center gap-2"
                >
                  <span>↻</span> Reset
                </button>
              </div>

              {/* Certificate Types Table */}
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-700">
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left w-12">#</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Certificate Type</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certTypes.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-600">
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-white">{item.type}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                          <button
                            className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200"
                            disabled
                            title="Edit"
                          >
                            ✎
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded font-medium"
              >
                × Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* show uploaded file info when available */}
              {uploadedFile && (
                <div className="mt-4 p-4 rounded border bg-green-50 text-sm text-slate-800 flex items-center justify-between">
                  <div>
                    <strong>Uploaded file:</strong>{" "}
                    {uploadedFile.original_name || uploadedFile.filename ? (
                      <span>{uploadedFile.original_name || uploadedFile.filename}</span>
                    ) : (
                      <span>No file info returned from server.</span>
                    )}
                    <div className="text-xs text-slate-600 mt-1">
                      {uploadedFile.mime_type && <span className="mr-3">{uploadedFile.mime_type}</span>}
                      {uploadedFile.file_size && <span>{Math.round((uploadedFile.file_size||0)/1024)} KB</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 h-9 rounded bg-sky-600 text-white hover:bg-sky-700"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null)
                        setRemoveExistingFile(true)
                        setForm((s) => ({ ...s, file: null }))
                      }}
                      className="px-3 py-1 h-9 rounded border bg-white text-slate-800 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                    <a
                      href={`${API_BASE.replace(/\/$/, "")}/${(uploadedFile.file_path || uploadedFile.filePath || "").replace(/^\/+/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 h-9 rounded border bg-white text-slate-800 hover:bg-slate-50"
                    >
                      Open
                    </a>
                  </div>
                </div>
              )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 bottom-6 z-50 px-4 py-3 rounded shadow-lg text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-rose-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
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
      `}</style>
    </div>
  )
}
