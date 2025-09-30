"use client"

import React from "react"
import Link from "@/components/link"

interface TestRow {
  id: number
  testName: string
  assignDate?: string
  dueDate?: string
  lastAttemptDate?: string
  lastAttemptResult?: string
  trainingMaterials?: string
}

export default function TakeTestPage() {
  const [rows] = React.useState<TestRow[]>([
    {
      id: 1,
      testName: "Data Security Fundamentals",
      assignDate: "2025-01-15",
      dueDate: "2025-02-15",
      lastAttemptDate: "2025-01-20",
      lastAttemptResult: "Passed",
      trainingMaterials: "Security Training Module 1"
    },
    {
      id: 2,
      testName: "Privacy Policy Quiz",
      assignDate: "2025-01-10",
      dueDate: "2025-02-10",
      lastAttemptDate: "2025-01-18",
      lastAttemptResult: "Failed",
      trainingMaterials: "Privacy Policy Document"
    },
    {
      id: 3,
      testName: "Incident Response Test",
      assignDate: "2025-01-20",
      dueDate: "2025-02-20",
      trainingMaterials: "Incident Response SOP"
    }
  ])

  // Sorting state
  const [sort, setSort] = React.useState<{ key: keyof TestRow | null; dir: "asc" | "desc" | null }>({
    key: null,
    dir: null,
  })

  // Toggle sort function
  const toggleSort = (key: keyof TestRow) => {
    if (sort.key !== key) return setSort({ key, dir: "asc" })
    if (sort.dir === "asc") setSort({ key, dir: "desc" })
    else setSort({ key: null, dir: null })
  }

  // Apply sorting
  const sortedRows = React.useMemo(() => {
    if (!sort.key || !sort.dir) return rows

    return [...rows].sort((a, b) => {
      const key = sort.key as keyof TestRow
      const aVal = a[key]
      const bVal = b[key]
      
      if (key === "assignDate" || key === "dueDate" || key === "lastAttemptDate") {
        // Handle date sorting
        const aDate = aVal ? new Date(aVal as string).getTime() : 0
        const bDate = bVal ? new Date(bVal as string).getTime() : 0
        return sort.dir === "asc" ? aDate - bDate : bDate - aDate
      }
      
      // Handle string/number sorting
      const aStr = String(aVal || "").toLowerCase()
      const bStr = String(bVal || "").toLowerCase()
      return sort.dir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [rows, sort])

  // Column configuration
  const columns: { key: keyof TestRow | 'idx' | 'action'; label: string; sortable?: boolean; width?: string }[] = [
    { key: 'idx', label: '#', width: 'w-8' },
    { key: 'testName', label: 'Test Name', sortable: true },
    { key: 'assignDate', label: 'Assign Date', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'lastAttemptDate', label: 'Last Attempt Date', sortable: true },
    { key: 'lastAttemptResult', label: 'Last Attempt Result', sortable: true },
    { key: 'trainingMaterials', label: 'Training Materials', sortable: true },
    { key: 'action', label: 'Action' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#19191c] py-6 px-2">
      <div className="max-w-7xl mx-auto border border-gray-200 dark:border-gray-800 rounded shadow bg-white dark:bg-[#212124]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-[#19191c] rounded-t">
          <span className="text-sm text-sky-700 dark:text-sky-200 font-medium">Take Test</span>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#212124]">
                {columns.map(col => {
                  const isSorted = sort.key === col.key && !!sort.dir
                  const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : null
                  return (
                    <th
                      key={col.key}
                      className={`border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal ${col.width || ''} ${col.sortable ? "cursor-pointer select-none" : ""}`}
                      onClick={() => col.sortable && toggleSort(col.key as keyof TestRow)}
                      role={col.sortable ? "button" : undefined}
                      tabIndex={col.sortable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (col.sortable && (e.key === "Enter" || e.key === " ")) toggleSort(col.key as keyof TestRow)
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
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No data to display
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? "bg-white dark:bg-[#232326]" : "bg-gray-50 dark:bg-[#19191c]"}>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">{idx + 1}</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-slate-900 dark:text-slate-100">
                      {row.testName}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-slate-700 dark:text-slate-300">
                      {row.assignDate ? new Date(row.assignDate).toLocaleDateString('en-US') : '-'}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-slate-700 dark:text-slate-300">
                      {row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-US') : '-'}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-slate-700 dark:text-slate-300">
                      {row.lastAttemptDate ? new Date(row.lastAttemptDate).toLocaleDateString('en-US') : '-'}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                      {row.lastAttemptResult ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          row.lastAttemptResult === "Passed" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                        }`}>
                          {row.lastAttemptResult}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-slate-700 dark:text-slate-300">
                      {row.trainingMaterials || '-'}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/training-and-test/take-test?id=${row.id}&test=${encodeURIComponent(row.testName)}`}
                          className="inline-flex items-center px-2 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
                        >
                          Take Test
                        </Link>
                        <Link
                          href={`/training-and-test/view-test-details?id=${row.id}&test=${encodeURIComponent(row.testName)}`}
                          className="inline-flex items-center px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                        >
                          View
                        </Link>
                      </div>
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
