"use client"

import Link from "@/components/link"
import React from "react"

const TESTS = [
  { testName: "New Employee UDAAP_0824", setName: "UDAAP Test AACA", date: "8/8/2024", status: "approved" },
  { testName: "New Employee Data Security_0824", setName: "Data Security Test", date: "8/8/2024", status: "approved" },
  { testName: "New Employee Bankruptcy_0824", setName: "Bankruptcy Test", date: "8/8/2024", status: "approved" },
  { testName: "New Employee HIPAA_0824", setName: "HIPAA Test", date: "8/8/2024", status: "approved" },
  { testName: "New Employee GLBA_0824", setName: "GLBA Test", date: "8/8/2024", status: "approved" },
  { testName: "New Employee FDCPA_0824", setName: "FDCPA Test", date: "8/8/2024", status: "approved" },
  { testName: "New Employee Fair Credit Reporting_0824", setName: "Fair Credit Reporting Test", date: "8/8/2024", status: "approved" },
  { testName: "New Employee Fair Credit Reporting_0524", setName: "Fair Credit Reporting Test", date: "5/29/2024", status: "approved" },
  { testName: "New Employee FDCPA_0524", setName: "FDCPA Test", date: "5/29/2024", status: "approved" },
  { testName: "New Employee GLBA_0524", setName: "GLBA Test", date: "5/29/2024", status: "approved" },
]

const APPROVALS = [
  { value: "", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
]

type SortKey = "testName" | "setName" | "date" | "status" | ""

export default function TestListPage() {
  const [search, setSearch] = React.useState("")
  const [approvalStatus, setApprovalStatus] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortKey>("")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      // toggle order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("asc")
    }
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

  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0

    let valA: string | number = a[sortBy]
    let valB: string | number = b[sortBy]

    if (sortBy === "date") {
      // Convert to Date for proper comparison
      valA = new Date(a.date).getTime()
      valB = new Date(b.date).getTime()
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1
    if (valA > valB) return sortOrder === "asc" ? 1 : -1
    return 0
  })

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
                <th className="px-3 py-2 text-left w-8 font-normal border-t border-b border-gray-200 dark:border-gray-700">#</th>
                <th
                  className="px-3 py-2 text-left font-normal border-t border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => handleSort("testName")}
                >
                  Test Name {sortBy === "testName" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-3 py-2 text-left font-normal border-t border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => handleSort("setName")}
                >
                  Question Set Name {sortBy === "setName" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-3 py-2 text-center font-normal border-t border-b border-gray-200 dark:border-gray-700 w-32 cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  Date Created {sortBy === "date" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="px-3 py-2 text-center font-normal border-t border-b border-gray-200 dark:border-gray-700 w-16 cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="px-3 py-2 text-center font-normal border-t border-b border-gray-200 dark:border-gray-700 w-40">Action</th>
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
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">{item.date}</td>
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
