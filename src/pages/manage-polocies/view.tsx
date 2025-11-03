"use client"

import React from "react"
import Link from "@/components/link"

const API_BASE = typeof window !== "undefined"
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
  : "http://localhost:3000"

export default function ViewPolicyPage() {
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
        const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/manage-policies/${id}`)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`)
        const data = body?.data ?? body
        if (!mounted) return
        setRec(data)
        setError(null)
      } catch (err: any) {
        console.error("load policy error", err)
        setError(String(err?.message || "Failed to load"))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-8"><div className="text-center py-12 text-slate-600">Loading...</div></div>
  if (error) return <div className="max-w-7xl mx-auto px-6 py-8 text-red-600">Error: {error}</div>
  if (!rec) return <div className="max-w-7xl mx-auto px-6 py-8 text-slate-600">No policy found.</div>

  const inputBase = "w-full rounded px-2 py-1.5 text-sm border bg-slate-50"
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300"
  const sectionTitle = "text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">View Policy</h1>
        <div className="flex gap-2">
          <Link href="/manage-policies" className="text-sm px-3 py-2 border rounded">Back</Link>
          <Link href={`/manage-policies/add?id=${encodeURIComponent(String(rec.id || id || ''))}`} className="text-sm px-3 py-2 border rounded bg-sky-600 text-white">Edit</Link>
        </div>
      </div>

      <form className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6">
          <div>
            <h2 className={sectionTitle}>Policy Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputBase} value={rec.name ?? rec.title ?? ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Version</label>
                <input className={inputBase} value={rec.version ?? ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input className={inputBase} value={rec.category ?? rec.category_name ?? ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <input className={inputBase} value={rec.status ?? ''} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Metadata</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Creator</label>
                <input className={inputBase} value={rec.created_by_name ?? rec.creator ?? ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Approver</label>
                <input className={inputBase} value={rec.approver ?? ''} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Description & Content</h2>
            <div>
              <div className="text-xs text-slate-500 mb-1">Description</div>
              <div className="rounded p-3 bg-gray-50 dark:bg-slate-700 text-sm whitespace-pre-wrap">{rec.description ?? '—'}</div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-500 mb-1">Content</div>
              <div className="rounded p-3 bg-gray-50 dark:bg-slate-700 text-sm whitespace-pre-wrap">{rec.content ?? '—'}</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}