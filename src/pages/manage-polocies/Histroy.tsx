"use client"

import React from "react"
import Link from "@/components/link"

export default function AddPolicyHistoryPage() {
  const [policyId, setPolicyId] = React.useState<string>("")
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<number>(0)

  const policies = [
    { id: "1", name: "IPs Removal Policy" },
    { id: "2", name: "Acceptable Use" },
  ]

  const MAX_BYTES = 10 * 1024 * 1024 // 10MB
  const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null
    validateAndSetFile(f)
  }

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault()
    const f = ev.dataTransfer.files && ev.dataTransfer.files[0] ? ev.dataTransfer.files[0] : null
    validateAndSetFile(f)
  }

  const validateAndSetFile = (f: File | null) => {
    setMessage(null)
    if (!f) {
      setFile(null)
      return
    }
    if (!allowed.includes(f.type)) {
      setMessage("Invalid file type. Allowed: PDF, DOCX.")
      setFile(null)
      return
    }
    if (f.size > MAX_BYTES) {
      setMessage("File too large. Max 10MB.")
      setFile(null)
      return
    }
    setFile(f)
  }

  const handleUpload = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    if (!policyId) {
      setMessage("Please select a policy.")
      return
    }
    if (!file) {
      setMessage("Please choose a file to upload.")
      return
    }

    setIsUploading(true)
    setProgress(0)

    // simulated upload progress
    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 70))
      setProgress(i * 10)
    }

    // simulated server delay
    await new Promise((r) => setTimeout(r, 300))

    setIsUploading(false)
    setMessage("Upload successful")
    setFile(null)
    setProgress(0)
  }

  const removeFile = () => {
    setFile(null)
    setMessage(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add Policy History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload a document related to a policy (PDF / DOCX). Max 10MB.</p>
        </div>

        <div>
          <Link
            href="/manage-policies"
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 shadow-sm hover:shadow"
          >
            Back
          </Link>
        </div>
      </div>

      <form onSubmit={handleUpload} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          <label className="text-sm text-slate-700 dark:text-slate-300">Select Policy</label>
          <select
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            className="w-full md:w-2/3 border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Select policy"
          >
            <option value="">-- select policy --</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300 mb-2 block">Attachment</label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-md p-6 bg-slate-50 dark:bg-slate-900"
              aria-label="File drop area"
            >
              {!file ? (
                <div className="text-center">
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">Drag & drop a file here, or</div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFile}
                      className="sr-only"
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-200 shadow-sm hover:shadow">
                      Choose file
                    </span>
                  </label>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Allowed: PDF, DOCX • Max 10MB</div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB • {file.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={removeFile} className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-700 border text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="w-full md:w-2/3">
              <div className="h-2 bg-slate-100 rounded overflow-hidden">
                <div className="h-2 bg-sky-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Uploading… {progress}%</div>
            </div>
          )}

          {message && <div className="text-sm text-slate-700 dark:text-slate-200">{message}</div>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-4 h-10 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {isUploading ? "Uploading…" : "Upload"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPolicyId("")
                setFile(null)
                setMessage(null)
              }}
              className="inline-flex items-center gap-2 px-4 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:shadow"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}