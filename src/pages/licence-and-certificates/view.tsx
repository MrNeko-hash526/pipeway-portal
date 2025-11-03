"use client"

import React from "react"
import Link from "@/components/link"
import toast from "react-hot-toast"

const API_BASE = typeof window !== "undefined"
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
  : "http://localhost:3000"

export default function CertificateViewPage() {
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [rec, setRec] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const v = p.get("id")
    if (v) setId(v)
  }, [])

  React.useEffect(() => {
    if (!id) { setLoading(false); return }
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/certificates/${id}`)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
        const data = body?.data ?? body
        if (!mounted) return
        setRec(data)
        setError(null)
      } catch (err: any) {
        console.error("load certificate error", err)
        setError(String(err?.message || "Failed to load"))
        toast.error(String(err?.message || "Failed to load"))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-8"><div className="text-center py-12 text-slate-600">Loading...</div></div>
  if (error) return <div className="max-w-7xl mx-auto px-6 py-8 text-red-600">Error: {error}</div>
  if (!rec) return <div className="max-w-7xl mx-auto px-6 py-8 text-slate-600">No record found.</div>

  const inputBase = "w-full rounded px-2 py-1.5 text-sm border bg-slate-50"
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300"
  const sectionTitle = "text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"

  const fileUrl = (() => {
    const fp = rec.file_path || rec.filePath || ""
    if (!fp) return ""
    const clean = fp.replace(/^\/+/, "")
    return `${API_BASE.replace(/\/$/, "")}/${clean}`
  })()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">View Certificate</h1>
        <div className="flex gap-2">
          <Link href="/licence-and-certificates" className="text-sm px-3 py-2 border rounded">Back</Link>
          <Link href={`/licence-and-certificates/add?id=${encodeURIComponent(String(rec.id || id || ''))}`} className="text-sm px-3 py-2 border rounded bg-sky-600 text-white">Edit</Link>
        </div>
      </div>

      <form className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm p-6" onSubmit={(e)=>e.preventDefault()}>
        <div className="space-y-6">
          <div>
            <h2 className={sectionTitle}>Certificate Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Company / Org</label>
                <input className={inputBase} value={rec.company_name ?? rec.org_code ?? ""} disabled />
              </div>
              <div>
                <label className={labelClass}>File Name</label>
                <input className={inputBase} value={rec.original_name ?? rec.filename ?? ""} disabled />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <input className={inputBase} value={rec.cert_type ?? rec.certType ?? ""} disabled />
              </div>
              <div>
                <label className={labelClass}>Frequency</label>
                <input className={inputBase} value={rec.frequency ?? ""} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Dates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Expiry Date</label>
                <input className={inputBase} value={rec.exp_date ? new Date(rec.exp_date).toLocaleDateString() : (rec.expDate ? new Date(rec.expDate).toLocaleDateString() : "")} disabled />
              </div>
              <div>
                <label className={labelClass}>Uploaded At</label>
                <input className={inputBase} value={rec.uploaded_at ?? ""} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Notes & File</h2>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div><strong>Comment:</strong></div>
              <div className="rounded p-2 bg-gray-50 dark:bg-slate-700 whitespace-pre-wrap">{rec.comment ?? "—"}</div>

              <div className="pt-2">
                <strong>File:</strong>{" "}
                {rec.original_name || rec.filename ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div>
                      <div className="font-medium">{rec.original_name ?? rec.filename}</div>
                      <div className="text-xs text-slate-500">{rec.mime_type ?? rec.file_type ?? ""} • {rec.file_size ? `${Math.round(rec.file_size/1024)} KB` : ""}</div>
                    </div>
                    <div className="ml-auto flex gap-2">
                      {fileUrl ? (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border rounded bg-slate-100">Open</a>
                      ) : null}
                      <a href={`${API_BASE.replace(/\/$/, "")}${rec.file_path ? `/${String(rec.file_path).replace(/^\/+/, "")}` : ""}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border rounded bg-white">New tab</a>
                    </div>
                  </div>
                ) : <span>—</span>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}