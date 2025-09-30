"use client"

import Link from "@/components/link"
import React from "react"

const TESTS = [
  { testName: "New Employee UDAAP_0824", setName: "UDAAP Test AACA", date: "2024-08-08", status: "approved" },
  { testName: "New Employee Data Security_0824", setName: "Data Security Test", date: "2024-08-08", status: "approved" },
  { testName: "New Employee Bankruptcy_0824", setName: "Bankruptcy Test", date: "2024-08-08", status: "approved" },
  { testName: "New Employee HIPAA_0824", setName: "HIPAA Test", date: "2024-08-08", status: "approved" },
  { testName: "New Employee GLBA_0824", setName: "GLBA Test", date: "2024-08-08", status: "approved" },
  { testName: "New Employee FDCPA_0824", setName: "FDCPA Test", date: "2024-08-08", status: "approved" },
  { testName: "New Employee Fair Credit Reporting_0824", setName: "Fair Credit Reporting Test", date: "2024-08-08", status: "approved" },
  { testName: "New Employee Fair Credit Reporting_0524", setName: "Fair Credit Reporting Test", date: "2024-05-29", status: "approved" },
  { testName: "New Employee FDCPA_0524", setName: "FDCPA Test", date: "2024-05-29", status: "approved" },
  { testName: "New Employee GLBA_0524", setName: "GLBA Test", date: "2024-05-29", status: "approved" },
]

const APPROVALS = [
  { value: "", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
]

type TestItem = {
  testName: string
  setName: string
  date: string
  status: string
}

type SortKey = keyof Pick<TestItem, "testName" | "setName" | "date" | "status">

export default function TestListPage() {
  const [search, setSearch] = React.useState("")
  const [approvalStatus, setApprovalStatus] = React.useState("")
  
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

  const filtered = TESTS.filter(item => {
    if (
      search &&
      !(
        item.testName.toLowerCase().includes(search.toLowerCase()) ||
        item.setName.toLowerCase().includes(search.toLowerCase())
      )
    ) return false
    if (approvalStatus && item.status !== approvalStatus) return false
    return true
  })

  // Updated sorting logic
  const sorted = React.useMemo(() => {
    if (!sort.key || !sort.dir) return filtered

    return [...filtered].sort((a, b) => {
      const key = sort.key as SortKey
      let valA: string | number = a[key]
      let valB: string | number = b[key]

      if (key === "date") {
        // Convert to Date for proper comparison
        valA = new Date(a.date).getTime()
        valB = new Date(b.date).getTime()
      } else {
        valA = String(valA).toLowerCase()
        valB = String(valB).toLowerCase()
      }

      if (valA < valB) return sort.dir === "asc" ? -1 : 1
      if (valA > valB) return sort.dir === "asc" ? 1 : -1
      return 0
    })
  }, [filtered, sort])

  // Column configuration
  const columns: { key: SortKey | 'idx' | 'action'; label: string; sortable?: boolean; width?: string; align?: string }[] = [
    { key: 'idx', label: '#', width: 'w-8' },
    { key: 'testName', label: 'Test Name', sortable: true },
    { key: 'setName', label: 'Question Set Name', sortable: true },
    { key: 'date', label: 'Date Created', sortable: true, width: 'w-32', align: 'text-center' },
    { key: 'status', label: 'Status', sortable: true, width: 'w-16', align: 'text-center' },
    { key: 'action', label: 'Action', width: 'w-40', align: 'text-center' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#19191c] py-8 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto border border-gray-200 dark:border-gray-800 rounded-lg shadow bg-white dark:bg-[#212124]">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-[#19191c] rounded-t-lg">
          <span className="text-sm font-medium text-sky-700 dark:text-sky-200">List of Tests</span>
          <Link
            href="/training-and-test/tests-setup/create-test-parameter"
            className="rounded bg-sky-500 text-white px-4 py-2 text-sm font-medium hover:bg-sky-600"
          >
            Create Test
          </Link>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center px-6 py-4 bg-white dark:bg-[#212124]">
          <div className="flex flex-col flex-grow max-w-xs">
            <label htmlFor="search" className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Search</label>
            <input
              id="search"
              type="text"
              value={search}
              placeholder="Search"
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full rounded border border-gray-300 dark:border-gray-700 px-3 text-sm bg-white dark:bg-[#19191c] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col max-w-xs ml-auto">
            <label htmlFor="approval" className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Approval Status</label>
            <select
              id="approval"
              value={approvalStatus}
              onChange={e => setApprovalStatus(e.target.value)}
              className="h-9 w-32 rounded border border-gray-300 dark:border-gray-700 px-3 text-sm bg-white dark:bg-[#19191c] text-gray-900 dark:text-gray-100"
            >
              {APPROVALS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#19191c]">
                {columns.map(col => {
                  const isSorted = sort.key === col.key && !!sort.dir
                  const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : null
                  return (
                    <th
                      key={col.key}
                      className={`px-3 py-2 font-normal border-t border-b border-gray-200 dark:border-gray-700 ${col.width || ''} ${col.align || 'text-left'} ${col.sortable ? "cursor-pointer select-none" : ""}`}
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
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400 dark:text-gray-500">No records found.</td>
                </tr>
              ) : (
                sorted.map((item, idx) => (
                  <tr
                    key={item.testName + item.setName + item.date}
                    className={idx % 2 === 0
                      ? "bg-white dark:bg-[#212124]"
                      : "bg-gray-50 dark:bg-[#232326]"}
                  >
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">{idx + 1}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">{item.testName}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">{item.setName}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                      {new Date(item.date).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                      <span className="inline-flex items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center flex items-center justify-center gap-4">
                      {/* View */}
                      <Link
                        href={`/tests/view?id=${encodeURIComponent(item.testName)}`}
                        className="text-black dark:text-white hover:underline"
                        aria-label={`View ${item.testName}`}
                      >
                        View
                      </Link>

                      {/* Duplicate */}
                      <Link
                        href={`/tests/duplicate?id=${encodeURIComponent(item.testName)}`}
                        className="text-black dark:text-white hover:underline"
                        aria-label={`Duplicate ${item.testName}`}
                      >
                        Duplicate
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/training-and-test/tests-setup/create-test-parameter?edit=${encodeURIComponent(item.testName)}`}
                        className="text-black dark:text-white hover:underline"
                        aria-label={`Edit ${item.testName}`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
