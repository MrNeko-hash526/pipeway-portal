"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "@/components/link"
import toast, { Toaster } from "react-hot-toast"

// Add API base (same pattern used elsewhere)
const API_BASE = typeof window !== "undefined"
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
  : "http://localhost:3000"

// --- ADDED: define Row type and initialData to fix ReferenceError ---
type Row = {
  id: number
  company: string
  fileName: string
  fileUrl?: string
  type: string
  expDate: string
  frequency: string
  status: "Valid" | "Expired"
  approval: "Approved" | "Pending" | "Rejected"
}

const initialData: Row[] = []
// --- end added ---

export default function LicenceAndCertificates() {
  const [data, setData] = useState<Row[]>(initialData)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewing, setViewing] = useState<any>(null) // detailed record from API
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(200)

  // add missing filter state (prevents ReferenceError)
  const [filterActive, setFilterActive] = useState<"All" | "Active" | "Inactive">("All")
  const [approvalFilter, setApprovalFilter] = useState<"All" | "Approved" | "Pending" | "Rejected">("All")

  // fetch list helper (used on mount and after delete)
  const fetchCertificates = async (p = page, l = limit): Promise<Row[]> => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/certificates?page=${p}&limit=${l}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error || `Failed to load (${res.status})`)
      const rows = body?.data ?? body?.rows ?? []
      const mapped: Row[] = rows.map((r: any, idx: number) => {
        const filePath = r.file_path || r.filePath || ""
        const fileUrl = filePath ? `${API_BASE.replace(/\/$/, "")}/${filePath.replace(/^\/+/, "")}` : undefined
        const expIso = r.exp_date ? new Date(r.exp_date).toISOString() : (r.expDate ? new Date(r.expDate).toISOString() : "")
        const isExpired = expIso ? (new Date(expIso).getTime() < Date.now()) : false
        return {
          id: Number(r.id ?? (idx + 1)),
          company: r.company_name ?? r.org_code ?? r.orgCode ?? "—",
          fileName: r.original_name ?? r.filename ?? "",
          fileUrl,
          type: r.cert_type ?? r.certType ?? "—",
          expDate: expIso || "",
          frequency: r.frequency ?? "",
          status: isExpired ? "Expired" : "Valid",
          approval: (r.approval ?? "Pending") as Row["approval"]
        }
      })
      setData(mapped)
      return mapped
    } catch (err: any) {
      console.error('fetch certificates error', err)
      toast.error(String(err?.message || 'Failed to load certificates'))
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])
  
  // Updated sorting state structure
  const [sort, setSort] = useState<{ key: keyof Row | null; dir: "asc" | "desc" | null }>({
    key: null,
    dir: null,
  })

  // Updated toggle function with three-state cycle
  const toggleSort = (key: keyof Row) => {
    if (sort.key !== key) return setSort({ key, dir: "asc" })
    if (sort.dir === "asc") setSort({ key, dir: "desc" })
    else setSort({ key: null, dir: null })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = data.filter(r => {
      if (q) {
        const hay = `${r.company} ${r.fileName} ${r.type}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterActive === "Active" && r.status === "Expired") return false
      if (filterActive === "Inactive" && r.status === "Valid") return false
      if (approvalFilter !== "All" && r.approval !== approvalFilter) return false
      return true
    })

    // Updated sorting logic
    if (sort.key && sort.dir) {
      rows = rows.slice().sort((a, b) => {
        const key = sort.key as keyof Row
        const av = a[key]
        const bv = b[key]
        
        if (key === "expDate") {
          const da = new Date(a.expDate).getTime()
          const db = new Date(b.expDate).getTime()
          return sort.dir === "asc" ? da - db : db - da
        }
        
        const sa = String(av).toLowerCase()
        const sb = String(bv).toLowerCase()
        if (sa < sb) return sort.dir === "asc" ? -1 : 1
        if (sa > sb) return sort.dir === "asc" ? 1 : -1
        return 0
      })
    }
    return rows
  }, [data, query, filterActive, approvalFilter, sort])

  const handleApprove = (id: number) => {
    setData(prev =>
      prev.map(row =>
        row.id === id ? { ...row, approval: "Approved", status: "Valid" } : row
      )
    )
    toast.success("Certificate approved")
  }

  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <div>Are you sure you want to delete this certificate?</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              const loader = toast.loading('Deleting...')
              try {
                // try primary DELETE endpoint
                let res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/certificates/${id}`, {
                  method: 'DELETE'
                })
                // try to parse json but ignore parse errors
                let body: any = {}
                try { body = await res.json() } catch { body = {} }

                const ok = (res.ok || (res.status >= 200 && res.status < 300) || body?.success === true)

                // if not ok and 404 try fallbacks
                if (!ok && res.status === 404) {
                  const fallbacks = [
                    'soft-delete',
                    'soft_delete',
                    'soft',
                    'remove',
                    'archive'
                  ]
                  let triedOk = false
                  for (const ep of fallbacks) {
                    try {
                      res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/certificates/${id}/${ep}`, { method: 'POST' })
                      try { body = await res.json() } catch { body = {} }
                      if (res.ok || (res.status >= 200 && res.status < 300) || body?.success === true) {
                        triedOk = true
                        break
                      }
                    } catch (e) {
                      // ignore and continue
                    }
                  }
                  if (!triedOk && !ok) {
                    // final check: refresh list and verify row removed server-side using returned rows
                    const rows = await fetchCertificates()
                    const stillThere = rows.some(r => r.id === id)
                    if (!stillThere) {
                      toast.dismiss(loader)
                      toast.success("Certificate deleted")
                      return
                    }
                    throw new Error(body?.error || `Delete failed (${res.status})`)
                  }
                } else if (!ok) {
                  throw new Error(body?.error || `Delete failed (${res.status})`)
                }

                // success - refresh list
                await fetchCertificates()
                toast.dismiss(loader)
                toast.success("Certificate deleted")
              } catch (err: any) {
                toast.dismiss(loader)
                console.error('delete error', err)
                // as a last-ditch: refresh list and if row is gone treat as success
                try {
                  const rows = await fetchCertificates()
                  const stillThere = rows.some(r => r.id === id)
                  if (!stillThere) {
                    toast.success("Certificate deleted")
                    return
                  }
                } catch (_) { /* ignore */ }

                toast.error(String(err?.message || 'Delete failed'))
              }
            }}
            className="px-3 py-1 bg-rose-500 text-white rounded"
          >
            Yes
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-300 rounded">
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
    })
  }

  // Column configuration
  const columns: { key: keyof Row | 'action'; label: string; sortable?: boolean }[] = [
    { key: 'id', label: '#' },
    { key: 'company', label: 'Certificate / Insurance for', sortable: true },
    { key: 'fileName', label: 'File Name', sortable: true },
    { key: 'type', label: 'Certificate Type', sortable: true },
    { key: 'expDate', label: 'Exp Date', sortable: true },
    { key: 'frequency', label: 'Frequency', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'action', label: 'Action' },
  ]

  async function openView(id: number) {
    setViewing(null)
    setShowViewModal(true)
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/certificates/${id}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body?.error || "Failed to load record")
      }
      setViewing(body?.data ?? body)
    } catch (err: any) {
      console.error("view fetch error", err)
      toast.error(String(err?.message || "Failed to load details"))
      setShowViewModal(false)
    }
  }

  function closeView() {
    setShowViewModal(false)
    setViewing(null)
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Licence and Certificates Management</h1>
        </header>

        <div className="border rounded-lg p-4 mb-6" style={{ backgroundColor: "var(--background)" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search"
                className="h-10 w-full md:w-64 rounded border px-3 bg-white text-slate-900 placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-[rgb(33,33,36)] dark:text-white dark:placeholder-gray-400 dark:border-slate-700"
              />
              <div className="flex items-center gap-2 text-sm ml-2">
                <label className="flex items-center gap-1">
                  <input type="radio" checked={filterActive === "All"} onChange={() => setFilterActive("All")} /> <span className="ml-1">All</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={filterActive === "Active"} onChange={() => setFilterActive("Active")} /> <span className="ml-1">Active</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={filterActive === "Inactive"} onChange={() => setFilterActive("Inactive")} /> <span className="ml-1">Inactive</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={approvalFilter}
                onChange={e => setApprovalFilter(e.target.value as any)}
                className="h-10 rounded border px-3 bg-white dark:bg-transparent"
              >
                <option value="All">All Approval Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>

              <Link href="/licence-and-certificates/add" className="h-10 px-4 rounded bg-sky-600 text-white inline-flex items-center justify-center">
                Add Certificate
              </Link>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto shadow-sm" style={{ backgroundColor: "var(--background)" }}>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--background)" }} className="text-muted-foreground">
                {columns.map(col => {
                  const isSorted = sort.key === col.key && !!sort.dir
                  const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : null
                  return (
                    <th
                      key={col.key}
                      className={`px-4 py-3 ${col.sortable ? "cursor-pointer select-none" : ""}`}
                      onClick={() => col.sortable && toggleSort(col.key as keyof Row)}
                      role={col.sortable ? "button" : undefined}
                      tabIndex={col.sortable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (col.sortable && (e.key === "Enter" || e.key === " ")) toggleSort(col.key as keyof Row)
                      }}
                    >
                      {col.sortable ? (
                        <button className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                          <span className="flex-1 text-left">{col.label}</span>
                          <span className="text-xs text-slate-400">{arrow}</span>
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No records
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t last:border-b hover:bg-gray-50 dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="px-4 py-3 align-top w-[48px] text-slate-700 dark:text-slate-200">{r.id}</td>
                    <td className="px-4 py-3 align-top text-slate-800 dark:text-slate-100">{r.company}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-slate-800 dark:text-slate-100">{r.fileName}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">{r.type}</td>
                    <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">{new Date(r.expDate).toLocaleDateString('en-US')}</td>
                    <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">{r.frequency}</td>
                    <td className="px-4 py-3 align-top">
                      {r.status === "Valid" ? (
                        <span className="inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-red-700 bg-red-50 dark:bg-red-900/20">
                          Expired
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openView(r.id)}
                          title={`View ${r.fileName}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white text-slate-800 hover:bg-sky-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-100"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M12 5c-7 0-11 6-11 7s4 7 11 7 11-6 11-7-4-7-11-7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
                          </svg>
                        </button>

                        <Link
                          // pass query param "id" so add.tsx prefetch logic picks it up
                          href={`/licence-and-certificates/add?id=${r.id}`}
                          title={`Edit ${r.fileName}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded border border-slate-200 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M3 21l3-1 11-11 1-3-3 1L3 21z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>

                        <button
                          type="button"
                          title={`Approve ${r.fileName}`}
                          onClick={() => handleApprove(r.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded border border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-700/30 dark:bg-transparent dark:text-emerald-300"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>

                        <button
                          type="button"
                          title={`Delete ${r.fileName}`}
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-700/30 dark:text-rose-300"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M3 6h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal (in-place preview/details) */}
      {showViewModal && viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  {viewing.original_name || viewing.filename || "Certificate details"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {viewing.cert_type ?? viewing.certType ?? ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded bg-rose-600 text-white" onClick={closeView}>Close</button>
              </div>
            </div>

            {/* details (form fields) */}
            <div className="p-6 grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div><strong>Scope:</strong> {viewing.scope ?? (viewing.org_code ? "org" : "company")}</div>
              <div><strong>Organisation Code:</strong> {viewing.org_code ?? "—"}</div>
              <div><strong>Company Name:</strong> {viewing.company_name ?? "—"}</div>
              <div><strong>Certificate Type:</strong> {viewing.cert_type ?? viewing.certType ?? "—"}</div>
              <div><strong>Expiry Date:</strong> {viewing.exp_date ? new Date(viewing.exp_date).toLocaleDateString() : "—"}</div>
              <div><strong>Frequency:</strong> {viewing.frequency ?? "—"}</div>
              <div>
                <strong>Comment:</strong>
                <div className="mt-1 whitespace-pre-wrap rounded-md p-2 bg-gray-50 dark:bg-slate-700">{viewing.comment ?? "—"}</div>
              </div>
              <div><strong>Uploaded By:</strong> {viewing.uploaded_by ?? "—"}</div>
              <div><strong>Uploaded At:</strong> {viewing.uploaded_at ?? "—"}</div>
              <div>
                <strong>File:</strong>{" "}
                {viewing.original_name || viewing.filename ? (
                  <>
                    <span>{viewing.original_name ?? viewing.filename}</span>
                    <span className="ml-2">
                      <a
                        className="text-sky-600 underline"
                        href={`${API_BASE.replace(/\/$/, "")}/${(viewing.file_path || viewing.filePath || "").replace(/^\/+/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                    </span>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
