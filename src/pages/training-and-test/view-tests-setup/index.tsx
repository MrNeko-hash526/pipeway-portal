"use client"

import React from "react"

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
  const rows: TestRow[] = [] // Add test rows here if any.

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
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal w-8">#</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal">Test Name</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal">Assign Date</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal">Due Date</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal">Last Attempt Date</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal">Last Attempt Result</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal">Training Materials</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    {/* No data to display */}
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white dark:bg-[#232326]" : "bg-gray-50 dark:bg-[#19191c]"}>
                    <td className="border-b px-3 py-2">{idx + 1}</td>
                    {/* ...rest of columns... */}
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
