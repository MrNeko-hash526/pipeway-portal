"use client"

import React, { useMemo, useState } from "react"
import Link from "@/components/link"
import toast, { Toaster } from "react-hot-toast"

type TrainingRecord = {
  id: number
  docType: string
  trainingName: string
  category: string
  title: string
  expDate: string
  approver: string
  status: "Published" | "Draft" | "Archived" | "Pending"
}

const CATEGORY_OPTIONS = [
  "All",
  "Customer Communications",
  "Governance and Consumer Compliance",
  "Audit and Compliance",
  "Data Security and Privacy",
]
const TITLE_OPTIONS = [
  "All",
  "Compliance and Training",
  "Consumer Complaint and Dispute Resolution",
  "Employee Training and Testing Programs",
  "Audit and Compliance",
  "Data Awareness",
  "Right Party Contact",
  "Credit Bureau Reporting",
]
const APPROVAL_OPTIONS = ["All", "Approved", "Pending", "Rejected"]

const DEMO_ROWS: TrainingRecord[] = [
  {
    id: 1,
    docType: "UDAAP_Velocity",
    trainingName: "UDAAP-082024 Service Provider Course",
    category: "False, deceptive, or misleading representations or means",
    title: "Compliance and Training",
    expDate: "2025-07-31",
    approver: "Tonia",
    status: "Published",
  },
  {
    id: 2,
    docType: "Client Training",
    trainingName: "Trust Third Party Complaints Management Program_2023",
    category: "Customer Communications",
    title: "Consumer Complaint and Dispute Resolution",
    expDate: "2024-04-11",
    approver: "Tami",
    status: "Published",
  },
  {
    id: 3,
    docType: "HIPAA",
    trainingName: "HIPAA Training Material",
    category: "Governance and Consumer Compliance",
    title: "Employee Training and Testing Programs",
    expDate: "2025-02-27",
    approver: "Tonia",
    status: "Draft",
  },
  {
    id: 4,
    docType: "Bankruptcy",
    trainingName: "Bankruptcy Training Manual",
    category: "Governance and Consumer Compliance",
    title: "Employee Training and Testing Programs",
    expDate: "2025-02-27",
    approver: "Tonia",
    status: "Published",
  },
  {
    id: 5,
    docType: "UDAAP",
    trainingName: "UDAAP Training Guide",
    category: "Customer Communications",
    title: "Audit and Compliance",
    expDate: "2025-02-27",
    approver: "Tonia",
    status: "Published",
  },
  {
    id: 6,
    docType: "Data Security",
    trainingName: "Information Security Program",
    category: "Data Security and Privacy",
    title: "Data Awareness",
    expDate: "2025-02-27",
    approver: "Tonia",
    status: "Pending",
  },
  {
    id: 7,
    docType: "FDCPA",
    trainingName: "Fair Debt Collections Practices",
    category: "Customer Communications",
    title: "Right Party Contact",
    expDate: "2025-02-27",
    approver: "Tonia",
    status: "Published",
  },
  {
    id: 8,
    docType: "FCRA",
    trainingName: "Fair Credit Reporting",
    category: "Customer Communications",
    title: "Credit Bureau Reporting",
    expDate: "2025-02-27",
    approver: "Tonia",
    status: "Draft",
  },
  {
    id: 9,
    docType: "GLBA",
    trainingName: "GRAMM-LEACH-BLILEY",
    category: "Customer Communications",
    title: "Right Party Contact",
    expDate: "2025-02-27",
    approver: "Tonia",
    status: "Published",
  },
]

type SortKey = keyof Pick<
  TrainingRecord,
  "docType" | "trainingName" | "category" | "title" | "expDate" | "approver" | "status"
>

export default function QuestionBankSetupPage() {
  const [filters, setFilters] = React.useState({
    category: "All",
    title: "All",
    approval: "All",
    search: "",
  })
  const [appliedFilters, setAppliedFilters] = React.useState(filters)
  
  // Updated sorting state structure
  const [sort, setSort] = React.useState<{ key: SortKey | null; dir: "asc" | "desc" | null }>({
    key: null,
    dir: null,
  })

  const [data, setData] = React.useState(DEMO_ROWS)

  // Updated toggle function with three-state cycle
  const toggleSort = (key: SortKey) => {
    if (sort.key !== key) return setSort({ key, dir: "asc" })
    if (sort.dir === "asc") setSort({ key, dir: "desc" })
    else setSort({ key: null, dir: null })
  }

  const filteredData = React.useMemo(() => {
    const { category, title, approval, search } = appliedFilters

    return data.filter((row) => {
      const categoryMatch = category === "All" || row.category === category
      const titleMatch = title === "All" || row.title === title
      const approvalMatch =
        approval === "All" ||
        (approval === "Approved" && row.status === "Published") ||
        (approval === "Pending" && row.status === "Pending") ||
        (approval === "Rejected" && row.status === "Archived")

      const searchMatch =
        search.trim().length === 0 ||
        row.trainingName.toLowerCase().includes(search.toLowerCase()) ||
        row.docType.toLowerCase().includes(search.toLowerCase())

      return categoryMatch && titleMatch && approvalMatch && searchMatch
    })
  }, [appliedFilters, data])

  // Updated sorting logic
  const sortedData = React.useMemo(() => {
    if (!sort.key || !sort.dir) return filteredData

    return [...filteredData].sort((a, b) => {
      const key = sort.key as SortKey
      const aValue = a[key]
      const bValue = b[key]

      if (key === "expDate") {
        // Handle date sorting
        const aDate = new Date(aValue).getTime()
        const bDate = new Date(bValue).getTime()
        return sort.dir === "asc" ? aDate - bDate : bDate - aDate
      }

      // Handle string sorting
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      return sort.dir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [filteredData, sort])

  const applyFilters = () => setAppliedFilters(filters)

  const handleApprove = (id: number) => {
    setData((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Published", approver: "You" } : r
      )
    )
    toast.success("Training approved")
  }

  const handleDecline = (id: number) => {
    setData((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Archived" } : r
      )
    )
    toast.error("Training rejected")
  }

  const handleDelete = (id: number) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <div>Are you sure you want to delete this training?</div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setData((prev) => prev.filter((r) => r.id !== id))
                toast.dismiss(t.id)
                toast.success("Training deleted")
              }}
              className="px-3 py-1 bg-rose-500 text-white rounded"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    )
  }

  const handleExport = () => {
    // Implement Excel export functionality here
    toast.success("Export to Excel feature is not implemented yet.")
  }

  // Column configuration
  const columns: { key: SortKey | 'idx' | 'action'; label: string; sortable?: boolean }[] = [
    { key: 'idx', label: '#' },
    { key: 'docType', label: 'Doc Type', sortable: true },
    { key: 'trainingName', label: 'Training Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'expDate', label: 'Exp Date', sortable: true },
    { key: 'approver', label: 'Approver', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'action', label: 'Action' },
  ]

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-[#19191c] dark:via-[#212124] dark:to-[#19191c] py-10 px-6 transition-colors">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                List of Training
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage training documents, categories, and approvals.
              </p>
            </div>
            <div className="flex gap-3">
              {/* Updated Report button to link to report page */}
              <Link
                href="/training-and-test/training-sop/report"
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                View Reports
              </Link>
              {/* <button 
                onClick={handleExport}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Export Excel
              </button> */}
              <Link
                href="/training-and-test/training-sop/add"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
              >
                Add Training
              </Link>
            </div>
          </header>

          <section className="rounded-xl bg-white/95 shadow-xl ring-1 ring-gray-200/60 backdrop-blur-sm transition-colors dark:bg-[#212124]/85 dark:ring-white/5">
            <div className="border-b border-gray-200/70 px-6 py-6 dark:border-white/10">
              <div className="grid gap-5 md:grid-cols-[repeat(4,minmax(0,1fr))]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white/10 dark:bg-[#19191c] dark:text-gray-100"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <select
                    value={filters.title}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white/10 dark:bg-[#19191c] dark:text-gray-100"
                  >
                    {TITLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Approval Status
                  </label>
                  <select
                    value={filters.approval}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, approval: e.target.value }))
                    }
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white/10 dark:bg-[#19191c] dark:text-gray-100"
                  >
                    {APPROVAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search
                  </label>
                  <input
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                    placeholder="Search…"
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-white/10 dark:bg-[#19191c] dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-500"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="overflow-hidden rounded-lg border border-gray-200/70 bg-white shadow-sm transition-colors dark:border-white/10 dark:bg-[#19191c]/80">
                <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-white/10">
                  <thead className="bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-gray-200">
                    <tr>
                      {columns.map(col => {
                        const isSorted = sort.key === col.key && !!sort.dir
                        const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : null
                        return (
                          <th
                            key={col.key}
                            className={`px-4 py-3 text-left ${col.sortable ? "cursor-pointer select-none" : ""}`}
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
                  <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/10 dark:bg-[#19191c]/70">
                    {sortedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-14 text-center text-gray-500 dark:text-gray-400"
                        >
                          No training records match the applied filters.
                        </td>
                      </tr>
                    ) : (
                      sortedData.map((row, index) => (
                        <tr
                          key={row.id}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-[#212124]"
                        >
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-300">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                            {row.docType}
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                            {row.trainingName}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                            {row.category}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                            {row.title}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                            {new Date(row.expDate).toLocaleDateString('en-US')}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                            {row.approver}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                row.status === "Published"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                  : row.status === "Pending"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-500">
                              {/* View */}
                              <Link
                                href={`/training-and-test/question-bank-setup/view?id=${row.id}`}
                                title="View"
                                className="rounded-md p-2 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-[#212124] dark:hover:text-gray-200"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
                                  />
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="3.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Link>

                              {/* Approve */}
                              <button
                                onClick={() => handleApprove(row.id)}
                                title="Approve"
                                className="rounded-md p-2 hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-[#212124]"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>

                              {/* Decline */}
                              <button
                                onClick={() => handleDecline(row.id)}
                                title="Decline"
                                className="rounded-md p-2 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-[#212124]"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>

                              {/* Edit */}
                              <Link
                                href={`/training-and-test/question-bank-setup/add?editId=${row.id}`}
                                title="Edit"
                                className="rounded-md p-2 hover:bg-gray-100 hover:text-sky-600 dark:hover:bg-[#212124]"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 16H5a2 2 0 01-2-2V5a2 2 0 012-2h11m3 3v11a2 2 0 01-2 2H8m8-16h2a2 2 0 012 2v2"
                                  />
                                </svg>
                              </Link>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(row.id)}
                                title="Delete"
                                className="rounded-md p-2 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-[#212124]"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 6h18"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6"
                                  />
                                  <path d="M10 11v6M14 11v6" />
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
          </section>
        </div>
      </div>
    </>
  )
}
