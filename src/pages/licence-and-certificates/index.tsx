"use client"

import React, { useMemo, useState } from "react"
import Link from "@/components/link"
import toast, { Toaster } from "react-hot-toast"

type Row = {
  id: number
  company: string
  fileName: string
  fileUrl?: string
  type: string
  expDate: string // ISO
  frequency: string
  status: "Valid" | "Expired"
  approval: "Approved" | "Pending" | "Rejected"
}

const initialData: Row[] = [
  { id: 1, company: "AACANet, Inc.", fileName: "24_25_Professional_Certs_AA_CANet_COI.pdf", fileUrl: "#", type: "Professional Liability", expDate: "2025-01-23", frequency: "Annually", status: "Valid", approval: "Pending" },
  { id: 2, company: "TEMPHEAV Heavner, Beyers & Mihlar, LLC", fileName: "ARDC_8_5_24.pdf", fileUrl: "#", type: "Bar Card Proof of Good Standing", expDate: "2025-07-31", frequency: "Annually", status: "Valid", approval: "Approved" },
  { id: 3, company: "TEMPHEAV Heavner, Beyers & Mihlar, LLC", fileName: "Heavner_COI_CGL.pdf", fileUrl: "#", type: "Commercial General Liability", expDate: "2024-10-14", frequency: "Annually", status: "Expired", approval: "Rejected" },
  { id: 4, company: "TEMPLEO Leopold & Associates, PLLC", fileName: "COI_Professional_Liability_2024_2025_3.pdf", fileUrl: "#", type: "Professional Liability", expDate: "2025-04-30", frequency: "Annually", status: "Valid", approval: "Approved" },
  { id: 5, company: "TEMPHEAV Heavner, Beyers & Mihlar, LLC", fileName: "E_O_9_1_24.pdf", fileUrl: "#", type: "Errors and Omission", expDate: "2024-08-31", frequency: "Annually", status: "Expired", approval: "Pending" },
]

export default function LicenceAndCertificates() {
  const [data, setData] = useState<Row[]>(initialData)
  const [query, setQuery] = useState("")
  const [filterActive, setFilterActive] = useState<"All" | "Active" | "Inactive">("All")
  const [approvalFilter, setApprovalFilter] = useState<"All" | Row["approval"]>("All")
  
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
            onClick={() => {
              setData(prev => prev.filter(row => row.id !== id))
              toast.dismiss(t.id)
              toast.success("Certificate deleted")
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
                        <Link
                          href={`/licence-and-certificates/view?id=${r.id}`}
                          title={`View ${r.fileName}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white text-slate-800 hover:bg-sky-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-100"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M12 5c-7 0-11 6-11 7s4 7 11 7 11-6 11-7-4-7-11-7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
                          </svg>
                        </Link>

                        <Link
                          href={`/licence-and-certificates/add?editId=${r.id}`}
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
    </>
  )
}
