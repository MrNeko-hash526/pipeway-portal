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

export default function QuestioSetup() {
  const [filters, setFilters] = React.useState({ search: "", trainingType: "All", approvalStatus: "All" })
  const [appliedFilters, setAppliedFilters] = React.useState(filters)
  const [sort, setSort] = React.useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "trainingType", direction: "asc" })

  const handleSort = (key: SortKey) => {
    setSort(prev => (prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }))
  }

  const sortIndicator = (key: SortKey) =>
    sort.key !== key ? <span className="text-gray-400">⇅</span> : sort.direction === "asc" ? "↑" : "↓"

  const filteredData = React.useMemo(() => {
    return QUESTION_BANKS.filter(row => {
      const searchLower = appliedFilters.search.toLowerCase()
      const matchesSearch = !appliedFilters.search || row.name.toLowerCase().includes(searchLower) || row.trainingType.toLowerCase().includes(searchLower)
      const matchesTraining = appliedFilters.trainingType === "All" || row.trainingType === appliedFilters.trainingType
      const matchesApproval = appliedFilters.approvalStatus === "All" || row.status === appliedFilters.approvalStatus
      return matchesSearch && matchesTraining && matchesApproval
    })
  }, [appliedFilters])

  const sortedData = React.useMemo(() => {
    let dataCopy = [...filteredData]
    dataCopy.sort((a, b) => {
      const aStr = a[sort.key].toLowerCase()
      const bStr = b[sort.key].toLowerCase()
      if (aStr < bStr) return sort.direction === "asc" ? -1 : 1
      if (aStr > bStr) return sort.direction === "asc" ? 1 : -1
      return 0
    })
    return dataCopy
  }, [filteredData, sort])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-white dark:from-[#191a1a] dark:via-[#1f2024] dark:to-[#1f2024] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-white">List of Question Banks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage question banks.</p>
          </div>
          <Link
            href="/training-and-test/question-setup/create"
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 transition"
          >
            Create
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
                <th className="p-4 w-12">#</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort("trainingType")}>
                  Training Type {sort.key === "trainingType" ? (sort.direction === "asc" ? "↑" : "↓") : "⇅"}
                </th>
                <th className="p-4">Question Bank Name</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort("status")}>
                  Status {sort.key === "status" ? (sort.direction === "asc" ? "↑" : "↓") : "⇅"}
                </th>
                <th className="p-4">Action</th>
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
                    <td className="p-4">{row.status}</td>
                    <td className="p-4 space-x-2">
                      <Link href={`/training-and-test/question-setup/view?id=${row.id}`} className="text-black dark:text-white" title="View">
                        View
                      </Link>
                      <Link href={`/training-and-test/question-setup/create?id=${row.id}&mode=edit`} className="text-black dark:text-white" title="Edit">
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
