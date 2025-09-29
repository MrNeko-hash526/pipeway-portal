"use client"
import Link from "@/components/link"
import React from "react"

const QUESTION_SETS = [
  { name: "HIPAA Test", status: "approved" },
  { name: "Bankruptcy Test", status: "approved" },
  { name: "UDAAP Test AACA", status: "approved" },
  { name: "Data Security Test", status: "approved" },
  { name: "GLBA Test", status: "approved" },
  { name: "FDCPA Test", status: "approved" },
  { name: "Fair Credit Reporting Test", status: "approved" },
]

const APPROVALS = [
  { value: "", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
]

export default function QuestionSetListPage() {
  const [search, setSearch] = React.useState("")
  const [approvalStatus, setApprovalStatus] = React.useState("")

  const filtered = QUESTION_SETS.filter(row => {
    if (search && !row.name.toLowerCase().includes(search.toLowerCase())) return false
    if (approvalStatus && row.status !== approvalStatus) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#19191c] pt-10 px-6 transition-colors duration-300">
      <div className="mx-auto max-w-6xl rounded-lg bg-white dark:bg-[#212124] shadow-lg ring-1 ring-gray-200/60 dark:ring-white/10 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 select-none">
            List of Question Sets
          </h2>
          <Link
            className="rounded bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Create Question Set"
            href="/training-and-test/question-setup/createquestionset"
          >
            Create Question Set
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center px-6 py-5">
          <div className="flex flex-col flex-grow max-w-xs">
            <label
              htmlFor="search"
              className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300 select-none"
            >
              Search
            </label>
            <input
              id="search"
              type="search"
              value={search}
              placeholder="Search"
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm placeholder-gray-400 text-gray-900 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200 dark:border-gray-600 dark:bg-[#19191c] dark:placeholder-gray-500 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-700"
              aria-label="Search question sets"
            />
          </div>

          <div className="flex flex-col max-w-xs ml-auto">
            <label
              htmlFor="approval"
              className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300 select-none"
            >
              Approval Status
            </label>
            <select
              id="approval"
              value={approvalStatus}
              onChange={e => setApprovalStatus(e.target.value)}
              className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200 dark:border-gray-600 dark:bg-[#19191c] dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-700"
              aria-label="Filter approval status"
            >
              {APPROVALS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm text-gray-900 dark:text-gray-100">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#19191c] select-none">
                <th className="border-t border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold w-12">
                  #
                </th>
                <th className="border-t border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                  Question Set
                </th>
                <th className="border-t border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold w-16">
                  Status
                </th>
                <th className="border-t border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold w-28">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr
                    key={row.name}
                    className={
                      idx % 2 === 0
                        ? "bg-white dark:bg-[#212124]"
                        : "bg-gray-50 dark:bg-[#232326]"
                    }
                  >
                    <td className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                      {idx + 1}
                    </td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                      {row.name}
                    </td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                      <span className="inline-flex items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                        {row.status}
                      </span>
                    </td>
                    <td className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center flex items-center justify-center gap-3">
                      {/* View Link */}
                      <Link
                        href={`/questions/view?id=${encodeURIComponent(row.name)}`}
                        className="text-black dark:text-white hover:underline"
                        aria-label={`View ${row.name}`}
                      >
                        View
                      </Link>

                      {/* Edit Link */}
                      <Link
                        href={`/questions/edit?id=${encodeURIComponent(row.name)}`}
                        className="text-black dark:text-white hover:underline"
                        aria-label={`Edit ${row.name}`}
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
