"use client"

import React from "react"
import Link from "@/components/link"
import * as yup from "yup"
import PolicyEditor from "@/components/toolbar"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function ManagePoliciesAdd() {
  // start at chooser step so user first selects upload OR create
  const [step, setStep] = React.useState<"choose" | "upload" | "create">("choose")
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
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
    await new Promise((r) => setTimeout(r, 900))
    setIsUploading(false)
    showToast("PDF uploaded", "success")
    setTimeout(() => (window.location.href = "/manage-policies"), 800)
  }

  const handleChange = (k: string, v: any) => setPolicy((p) => ({ ...p, [k]: v }))

  // basic rich text exec wrapper (demo only)
  const exec = (cmd: string, val?: string) => {
    try {
      document.execCommand(cmd, false, val)
    } catch {
      // no-op for modern browsers where execCommand may be deprecated
    }
  }

  const handleCreateSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    // Convert date to American format for submission
    const submission = {
      ...policy,
      expDate: policy.expDate ? policy.expDate.toLocaleDateString('en-US') : null
    }

    try {
      await createSchema.validate(policy, { abortEarly: false, strict: true })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // join errors for user feedback
        showToast(err.errors.join(". "), "error")
        return
      }
      showToast("Validation failed", "error")
      return
    }

    // simulate save
    await new Promise((r) => setTimeout(r, 700))
    showToast("Policy created", "success")
    setTimeout(() => (window.location.href = "/manage-policies"), 700)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Manage Policy</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Choose how you'd like to add a policy.</p>
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
          {/* STEP 1: chooser */}
          {step === "choose" && (
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

          {/* STEP 2a: Upload form */}
          {step === "upload" && (
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

          {/* STEP 2b: Create form */}
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

                  <div className="mt-6">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => showToast("Draft saved (demo)")}
                        className="flex-1 px-4 py-3 bg-sky-100 text-sky-700 rounded-md border hover:shadow"
                      >
                        Save Draft
                      </button>
                      <button type="submit" className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700">
                        Submit
                      </button>
                    </div>
                    <div className="mt-3">
                      <button type="button" onClick={() => setStep("choose")} className="text-sm text-slate-500 hover:underline">
                        Back to choice
                      </button>
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
