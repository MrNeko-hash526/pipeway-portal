"use client"

import React from "react"
import Link from "@/components/link"

type QuestionBank = {
  id: number
  trainingType: string
  name: string
  status: "Approved" | "Pending" | "Rejected"
}

const TRAINING_TYPES = ["All", "HIPAA", "Bankruptcy", "UDA", "Data Security", "GLBA", "FDCPA", "FCRA"]
const APPROVAL_STATUSES = ["All", "Approved", "Pending", "Rejected"]

const QUESTION_BANKS: QuestionBank[] = [
  { id: 1, trainingType: "HIPAA", name: "HIPAA Test", status: "Approved" },
  { id: 2, trainingType: "Bankruptcy", name: "Bankruptcy Test", status: "Approved" },
  { id: 3, trainingType: "UDA", name: "UDA Test", status: "Approved" },
  { id: 4, trainingType: "Data Security", name: "Security Awareness", status: "Approved" },
  { id: 5, trainingType: "GLBA", name: "GLBA Test", status: "Approved" },
  { id: 6, trainingType: "FDCPA", name: "FDCPA Test", status: "Pending" },
  { id: 7, trainingType: "FCRA", name: "Fair Debt", status: "Rejected" },
]

type SortKey = keyof Pick<QuestionBank, "trainingType" | "name" | "status">

export default function QuestionBankSetup() {
  const [filters, setFilters] = React.useState({ search: "", trainingType: "All", approvalStatus: "All" })
  const [appliedFilters, setAppliedFilters] = React.useState(filters)
  
  // Updated sorting state structure
  const [sort, setSort] = React.useState<{ key: SortKey | null; dir: "asc" | "desc" | null }>({
    key: null,
    dir: null,
  })

  // Updated toggle function with three-state cycle
  const toggleSort = (key: SortKey) => {
    if (sort.key !== key) return setSort({ key, dir: "asc" })
    if (sort.dir === "asc") setSort({ key, dir: "desc" })
    else setSort({ key: null, dir: null })
  }

  const filteredData = React.useMemo(() => {
    return QUESTION_BANKS.filter(row => {
      const searchLower = appliedFilters.search.toLowerCase()
      const matchesSearch = !appliedFilters.search || row.name.toLowerCase().includes(searchLower) || row.trainingType.toLowerCase().includes(searchLower)
      const matchesTraining = appliedFilters.trainingType === "All" || row.trainingType === appliedFilters.trainingType
      const matchesApproval = appliedFilters.approvalStatus === "All" || row.status === appliedFilters.approvalStatus
      return matchesSearch && matchesTraining && matchesApproval
    })
  }, [appliedFilters])

  // Updated sorting logic
  const sortedData = React.useMemo(() => {
    if (!sort.key || !sort.dir) return filteredData

    return [...filteredData].sort((a, b) => {
      const key = sort.key as SortKey
      const aStr = String(a[key]).toLowerCase()
      const bStr = String(b[key]).toLowerCase()
      return sort.dir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [filteredData, sort])

  // Column configuration
  const columns: { key: SortKey | 'idx' | 'action'; label: string; sortable?: boolean }[] = [
    { key: 'idx', label: '#' },
    { key: 'trainingType', label: 'Training Type', sortable: true },
    { key: 'name', label: 'Question Bank Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'action', label: 'Action' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-white dark:from-[#191a1a] dark:via-[#1f2024] dark:to-[#1f2024] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-white">List of Question Banks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage question banks.</p>
          </div>
          <Link
            href="/training-and-test/question-bank-setup/add"
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 transition"
          >
            Create Question Bank
          </Link>
        </header>

        <section className="bg-white dark:bg-[#222] rounded p-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="border border-gray-300 rounded p-2 text-black dark:bg-gray-900 dark:text-white"
            />
            <select
              value={filters.trainingType}
              onChange={e => setFilters(f => ({ ...f, trainingType: e.target.value }))}
              className="border border-gray-300 rounded p-2 text-black dark:bg-gray-900 dark:text-white"
            >
              {TRAINING_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={filters.approvalStatus}
              onChange={e => setFilters(f => ({ ...f, approvalStatus: e.target.value }))}
              className="border border-gray-300 rounded p-2 text-black dark:bg-gray-900 dark:text-white"
            >
              {APPROVAL_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setAppliedFilters({ ...filters })}
            className="bg-sky-600 hover:bg-sky-700 text-white rounded py-2 px-4"
          >
            Apply
          </button>
        </section>

        <section className="overflow-x-auto bg-white dark:bg-[#222] rounded shadow mt-6">
          <table className="w-full text-left text-black dark:text-white text-sm">
            <thead className="bg-gray-100 dark:bg-[#333]">
              <tr>
                {columns.map(col => {
                  const isSorted = sort.key === col.key && !!sort.dir
                  const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : null
                  return (
                    <th
                      key={col.key}
                      className={`p-4 ${col.key === 'idx' ? 'w-12' : ''} ${col.sortable ? "cursor-pointer select-none" : ""}`}
                      onClick={() => col.sortable && toggleSort(col.key as SortKey)}
                      role={col.sortable ? "button" : undefined}
                      tabIndex={col.sortable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (col.sortable && (e.key === "Enter" || e.key === " ")) toggleSort(col.key as SortKey)
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
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-600 dark:text-gray-400">
                    No question banks found.
                  </td>
                </tr>
              ) : (
                sortedData.map((row, idx) => (
                  <tr key={row.id} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="p-4">{idx + 1}</td>
                    <td className="p-4">{row.trainingType}</td>
                    <td className="p-4">{row.name}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          row.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : row.status === "Pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      <Link 
                        href={`/training-and-test/question-setup/view?id=${row.id}`} 
                        className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300" 
                        title="View"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/training-and-test/question-setup/create?id=${row.id}&mode=edit`} 
                        className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300" 
                        title="Edit"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
