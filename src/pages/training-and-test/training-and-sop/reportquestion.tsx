"use client"

import React from "react"

type Option = { id: string; label: string }
type Row = {
  userId: string
  policyId: string
  userName: string
  policyName: string
  status: "Acknowledged" | "Pending" | "Overdue"
  assignedDate: string
  ackDate?: string
}

const USERS: Option[] = [
  { id: "all", label: "Select Assigned User" },
  { id: "u1", label: "Alice Johnson" },
  { id: "u2", label: "Bob Smith" },
  { id: "u3", label: "Carol Lee" },
]

const POLICIES: Option[] = [
  { id: "all", label: "Select Policy" },
  { id: "p1", label: "Acceptable Use Policy" },
  { id: "p2", label: "Data Protection Policy" },
  { id: "p3", label: "Remote Work Policy" },
  { id: "p4", label: "Incident Response SOP" },
]

const DEMO_ROWS: Row[] = [
  {
    userId: "u1",
    policyId: "p1",
    userName: "Alice Johnson",
    policyName: "Acceptable Use Policy",
    status: "Acknowledged",
    assignedDate: "2025-05-12",
    ackDate: "2025-05-18",
  },
  {
    userId: "u1",
    policyId: "p2",
    userName: "Alice Johnson",
    policyName: "Data Protection Policy",
    status: "Pending",
    assignedDate: "2025-05-20",
  },
  {
    userId: "u2",
    policyId: "p2",
    userName: "Bob Smith",
    policyName: "Data Protection Policy",
    status: "Pending",
    assignedDate: "2025-05-01",
  },
  {
    userId: "u2",
    policyId: "p3",
    userName: "Bob Smith",
    policyName: "Remote Work Policy",
    status: "Acknowledged",
    assignedDate: "2025-03-10",
    ackDate: "2025-03-19",
  },
  {
    userId: "u3",
    policyId: "p4",
    userName: "Carol Lee",
    policyName: "Incident Response SOP",
    status: "Overdue",
    assignedDate: "2025-04-10",
  },
]

export default function TrainingReportPage() {
  const [user, setUser] = React.useState<string>("all")
  const [policy, setPolicy] = React.useState<string>("all")
  
  // Sorting state
  const [sort, setSort] = React.useState<{ key: keyof Row | null; dir: "asc" | "desc" | null }>({
    key: null,
    dir: null,
  })

  // Toggle sort function
  const toggleSort = (key: keyof Row) => {
    if (sort.key !== key) return setSort({ key, dir: "asc" })
    if (sort.dir === "asc") setSort({ key, dir: "desc" })
    else setSort({ key: null, dir: null })
  }

  const filteredAndSorted = React.useMemo(() => {
    let rows = DEMO_ROWS.filter((row) => {
      const matchesUser = user === "all" || row.userId === user
      const matchesPolicy = policy === "all" || row.policyId === policy
      return matchesUser && matchesPolicy
    })

    // Apply sorting
    if (sort.key && sort.dir) {
      rows = [...rows].sort((a, b) => {
        const key = sort.key as keyof Row
        const aVal = a[key]
        const bVal = b[key]
        
        if (key === "assignedDate" || key === "ackDate") {
          // Handle date sorting
          const aDate = aVal ? new Date(aVal as string).getTime() : 0
          const bDate = bVal ? new Date(bVal as string).getTime() : 0
          return sort.dir === "asc" ? aDate - bDate : bDate - aDate
        }
        
        // Handle string sorting
        const aStr = String(aVal || "").toLowerCase()
        const bStr = String(bVal || "").toLowerCase()
        return sort.dir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
      })
    }

    return rows
  }, [user, policy, sort])

  const handleExport = async () => {
    try {
      const ExcelJS = await import("exceljs")
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Policy Status")

      worksheet.columns = [
        { header: "User Name", key: "userName", width: 28 },
        { header: "Policy Name", key: "policyName", width: 32 },
        { header: "Status", key: "status", width: 16 },
        { header: "Assigned Date", key: "assignedDate", width: 18 },
        { header: "Acknowledged Date", key: "ackDate", width: 20 },
      ]

      filteredAndSorted.forEach((row) =>
        worksheet.addRow({
          userName: row.userName,
          policyName: row.policyName,
          status: row.status,
          assignedDate: new Date(row.assignedDate).toLocaleDateString('en-US'),
          ackDate: row.ackDate ? new Date(row.ackDate).toLocaleDateString('en-US') : "-",
        })
      )

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "policy-acknowledgement-status.xlsx"
      link.click()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Excel export failed:", error)
      alert("Excel export is unavailable right now.")
    }
  }

  // Column configuration
  const columns: { key: keyof Row; label: string; sortable?: boolean; width?: string }[] = [
    { key: 'userName', label: 'User Name', sortable: true },
    { key: 'policyName', label: 'Policy Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true, width: 'w-32' },
    { key: 'assignedDate', label: 'Assigned Date', sortable: true },
    { key: 'ackDate', label: 'Acknowledged Date', sortable: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-[#19191c] dark:via-[#212124] dark:to-[#19191c] transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Policy Acknowledgement Status
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Filter by user and policy to review acknowledgement progress.
          </p>
        </header>

        <section className="rounded-2xl bg-white dark:bg-[#212124]/85 shadow-xl ring-1 ring-gray-200/60 dark:ring-white/5 backdrop-blur-sm transition-colors">
          <div className="px-6 py-6 border-b border-gray-200/70 dark:border-white/5">
            <div className="grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select User <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <select
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#19191c] px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                >
                  {USERS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Policy <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <select
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#19191c] px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                >
                  {POLICIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <button
                  onClick={handleExport}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M19 2H9a2 2 0 00-2 2v4H5a2 2 0 00-2 2v9a1 1 0 001 1h14a1 1 0 001-1V4a2 2 0 00-2-2zM7 13h10v2H7v-2z" />
                  </svg>
                  Export Excel
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredAndSorted.length} of {DEMO_ROWS.length} records.
            </p>
          </div>

          <div className="px-6 pb-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/5 bg-white dark:bg-[#19191c]/70 transition-colors">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10 text-sm">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr className="text-left font-semibold text-gray-700 dark:text-gray-200">
                    {columns.map(col => {
                      const isSorted = sort.key === col.key && !!sort.dir
                      const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : null
                      return (
                        <th
                          key={col.key}
                          className={`px-5 py-4 ${col.width || ''} ${col.sortable ? "cursor-pointer select-none" : ""}`}
                          onClick={() => col.sortable && toggleSort(col.key)}
                          role={col.sortable ? "button" : undefined}
                          tabIndex={col.sortable ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (col.sortable && (e.key === "Enter" || e.key === " ")) toggleSort(col.key)
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
                <tbody className="divide-y divide-gray-100 dark:divide-white/10 bg-white dark:bg-[#19191c]/80">
                  {filteredAndSorted.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                        No records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSorted.map((row, idx) => (
                      <tr
                        key={`${row.userId}-${row.policyId}-${idx}`}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-[#212124]"
                      >
                        <td className="px-5 py-4 text-gray-900 dark:text-gray-100">{row.userName}</td>
                        <td className="px-5 py-4 text-gray-900 dark:text-gray-100">{row.policyName}</td>
                        <td className="px-5 py-4">
                          <span
                            className={
                              row.status === "Acknowledged"
                                ? "inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-1 text-xs font-semibold"
                                : row.status === "Pending"
                                ? "inline-flex items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-3 py-1 text-xs font-semibold"
                                : "inline-flex items-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 px-3 py-1 text-xs font-semibold"
                            }
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-gray-200">
                          {new Date(row.assignedDate).toLocaleDateString('en-US')}
                        </td>
                        <td className="px-5 py-4 text-gray-700 dark:text-gray-200">
                          {row.ackDate ? new Date(row.ackDate).toLocaleDateString('en-US') : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
