"use client"

import React from "react"
import Link from "@/components/link"

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

export default function ViewOrganizationPage() {
  const [vendorId, setVendorId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [vendor, setVendor] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ id: number; type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ id: Date.now(), type, message })
    setTimeout(() => setToast(null), 3500)
  }

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) setVendorId(id)
  }, [])

  React.useEffect(() => {
    if (!vendorId) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/setup/vendor/${vendorId}`)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
        const data = body && body.success ? body.data : body
        if (!mounted) return
        setVendor(data)
        setError(null)
      } catch (err: any) {
        console.error('Failed to load vendor', err)
        setError(err?.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [vendorId])

  const getFileName = (att: any) => {
    return (
      att?.filename ||
      (att?.file_path ? String(att.file_path).split('/').pop() : null) ||
      (att?.url ? String(att.url).split('/').pop() : null) ||
      att?.original_name ||
      'file'
    )
  }

  const getAttachmentUrl = (att: any) => {
    if (!att) return ''
    const base = (API_BASE || '').replace(/\/$/, '')

    // absolute URL in record
    if (typeof att.url === 'string' && /^https?:\/\//i.test(att.url)) return att.url

    // file_path stored in DB (e.g. "uploads/vendor/..." or "/uploads/vendor/...")
    if (att.file_path) {
      const fp = String(att.file_path).replace(/^\/+/, '')
      return `${base}/${fp}`
    }

    // att.url like "/uploads/vendor/..."
    if (typeof att.url === 'string' && /^\/uploads\//.test(att.url)) return `${base}${att.url}`

    // fallback to backend streaming endpoint by filename
    const filename = getFileName(att)
    return `${base}/files/vendor/${encodeURIComponent(filename)}`
  }

  const downloadAttachment = async (att: any) => {
    try {
      if (!att) throw new Error('Invalid attachment')

      const isAbsolute = typeof att.url === 'string' && /^https?:\/\//i.test(att.url)
      let url: string

      if (isAbsolute) {
        url = att.url
      } else {
        const filename = att.filename || (att.url ? String(att.url).split('/').pop() : att.original_name) || 'file'
        url = `${(API_BASE || '').replace(/\/$/, '')}/files/vendor/${encodeURIComponent(filename)}`
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = att.original_name || att.filename || 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
      showToast('success', 'Download started')
    } catch (err: any) {
      console.error('Download failed', err)
      showToast('error', `Download failed: ${err?.message || String(err)}`)
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-8"><div className="text-center py-12 text-slate-600">Loading...</div></div>
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-6 py-8"><div className="text-red-600">Error: {error}</div></div>
  }

  if (!vendor) {
    return <div className="max-w-7xl mx-auto px-6 py-8"><div className="text-slate-600">No vendor selected.</div></div>
  }

  const v = vendor // alias

  const inputBase = "w-full rounded px-2 py-1.5 text-sm border bg-slate-50"
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300"
  const sectionTitle = "text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">View Organization</h1>
        <div className="flex gap-2">
          <Link href="/setup/vendor-setup" className="text-sm px-3 py-2 border rounded">Back</Link>
          <Link href={`/setup/vendor-setup/add?id=${encodeURIComponent(String(v?.id || vendorId || ''))}`} className="text-sm px-3 py-2 border rounded bg-sky-600 text-white">Edit</Link>
        </div>
      </div>

      <form className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm p-6" onSubmit={(e)=>e.preventDefault()}>
        <div className="space-y-6">
          <div>
            <h2 className={sectionTitle}>Organization Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Organization Name</label>
                <input className={inputBase} value={v.organization_name || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Organization Code</label>
                <input className={inputBase} value={v.organization_code || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <input className={inputBase} value={v.type || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <input className={inputBase} value={v.status || ''} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Risk & Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Risk</label>
                <input className={inputBase} value={v.risk_level || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input className={inputBase} value={v.category || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input className={inputBase} value={v.website || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Support #</label>
                <input className={inputBase} value={v.support_number || ''} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Addr 1</label>
                <input className={inputBase} value={v.address1 || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Addr 2</label>
                <input className={inputBase} value={v.address2 || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Addr 3</label>
                <input className={inputBase} value={v.address3 || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input className={inputBase} value={v.city || ''} disabled />
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <input className={inputBase} value={v.country || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input className={inputBase} value={v.state || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Zip</label>
                <input className={inputBase} value={v.zip || ''} disabled />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input className={inputBase} value={v.website || ''} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Contact</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px]">
                <label className={labelClass}>First</label>
                <input className={inputBase} value={v.contact_first || ''} disabled />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className={labelClass}>Last</label>
                <input className={inputBase} value={v.contact_last || ''} disabled />
              </div>

              <div className="w-20">
                <label className={labelClass}>Code</label>
                <input className={inputBase} value={v.phone_country_code || ''} disabled />
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className={labelClass}>Work Phone</label>
                <input className={inputBase} value={v.work_phone || ''} disabled />
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className={labelClass}>Email</label>
                <input className={inputBase} value={v.email || ''} disabled />
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className={labelClass}>Category</label>
                <input className={inputBase} value={v.category || ''} disabled />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className={sectionTitle}>Attachments</h2>
            <div className="space-y-3">
              {(!v.attachments || v.attachments.length === 0) && <div className="text-sm text-slate-500">No attachments</div>}
              {(v.attachments || []).map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-3 border rounded p-3">
                  <div>
                    <div className="font-medium text-sm">{a.original_name || a.filename}</div>
                    <div className="text-xs text-slate-500">Type: {a.mime_type || 'unknown'} • {a.file_size ? `${Math.round(a.file_size/1024)} KB` : 'unknown'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => downloadAttachment(a)} className="px-3 py-1 border rounded bg-slate-100">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </form>

      {/* simple toast */}
      {toast && (
        <div className={`fixed right-4 bottom-6 z-50 rounded shadow px-3 py-2 text-sm ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}