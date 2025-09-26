"use client"

import React from "react"

type FindingData = {
  type: string
  count: number
  color: string
}

type ResponseData = {
  type: string
  count: number
  color: string
}

type OrganizationDetail = {
  label: string
  value: string
}

type QuestionDetail = {
  question: string
  response: "Yes" | "No" | "N/A"
  responseDate: string
  finding: string
  findingDetail: string
}

const SAMPLE_ORGANIZATIONS = [
  "All Organization",
  "AACANet (organization)",
  "Aldridge File Haan, LLP",
  "Leopold & Associates, PLLC",
]

const SAMPLE_QUESTION_GROUPS = [
  "All Question Group",
  "2018 Data Security & Privacy",
  "2021 Proof of Good Standing with Bar",
  "2022 Data Security and Privacy",
]

const FINDING_DATA: FindingData[] = [
  { type: "Fully Comply", count: 3300, color: "#22c55e" },
  { type: "Part Comply", count: 81, color: "#f59e0b" },
  { type: "Not Comply", count: 1841, color: "#ef4444" },
  { type: "In Process", count: 8, color: "#8b5cf6" },
  { type: "Unable To Verify", count: 28, color: "#06b6d4" },
  { type: "N/A", count: 211, color: "#6b7280" },
  { type: "Unanswered", count: 1409, color: "#1f2937" },
]

const RESPONSE_DATA: ResponseData[] = [
  { type: "Yes", count: 3412, color: "#22c55e" },
  { type: "In Process", count: 78, color: "#f59e0b" },
  { type: "No", count: 619, color: "#ef4444" },
  { type: "N/A", count: 238, color: "#6b7280" },
  { type: "Unanswered", count: 1662, color: "#1f2937" },
]

const ORGANIZATION_DETAILS: OrganizationDetail[] = [
  { label: "Organization Code:", value: "AACANet" },
  { label: "Question Group:", value: "2018 Data Security & Privacy" },
  { label: "Date Assigned:", value: "4/5/2018" },
  { label: "Final Comment:", value: "Auto Close after Remediation Date" },
  { label: "Rating:", value: "Auto Close after Remediation" },
  { label: "Audit Submission Date:", value: "10/11/2019" },
  { label: "Auditor's Name:", value: "Tom" },
  { label: "Audit Final Date:", value: "10/11/2019" },
  { label: "Report Date:", value: "25/09/2025" },
]

const SAMPLE_QUESTIONS: QuestionDetail[] = [
  {
    question: "Does the company have written data security policies and procedures? If yes, please upload a copy for our review and if the policy is part of a larger policy set, please indicate in the comments the title of the policy and/or its location within the larger document.",
    response: "Yes",
    responseDate: "04/26/2019",
    finding: "Fully Comply",
    findingDetail: "Firm has provided all its data security policies including access control policy, asset management policy and other relevant policies."
  }
]

export default function CreateReportPage() {
  const [step, setStep] = React.useState(1)
  const [selectedOrg, setSelectedOrg] = React.useState("All Organization")
  const [selectedGroup, setSelectedGroup] = React.useState("All Question Group")
  const [showGraph, setShowGraph] = React.useState(true)
  const [showSummary, setShowSummary] = React.useState(true)
  const [showDetail, setShowDetail] = React.useState(true)
  const [validationError, setValidationError] = React.useState("")

  const handleGenerateReport = () => {
    if (selectedOrg === "All Organization" && selectedGroup === "All Question Group") {
      setValidationError("You must select at least one option from one of the pull downs")
      return
    }
    setValidationError("")
    setStep(2)
  }

  const handleBackToStep1 = () => {
    setStep(1)
  }

  const renderPieChart = (data: (FindingData | ResponseData)[], title: string) => {
    const total = data.reduce((sum, item) => sum + item.count, 0)
    let currentAngle = 0

    return (
      <div className="flex flex-col items-center bg-white dark:bg-[#212124] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="flex items-center gap-8">
          {/* Pie Chart */}
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90 drop-shadow-sm">
              {data.map((item, index) => {
                const percentage = (item.count / total) * 100
                const angle = (percentage / 100) * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                currentAngle += angle

                const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180)
                const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180)
                const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180)
                const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180)
                const largeArc = angle > 180 ? 1 : 0

                return (
                  <path
                    key={index}
                    d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity"
                  />
                )
              })}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-[#212124] px-2 py-1 rounded-full shadow-sm">
                {total}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
                <div 
                  className="w-4 h-4 rounded-sm shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[120px]">{item.type}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-md">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-[#212124] shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Audit Report Generator</h1>

            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[#212124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 shadow-sm transition-colors"
                >
                  {SAMPLE_ORGANIZATIONS.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[#212124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 shadow-sm transition-colors"
                >
                  {SAMPLE_QUESTION_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateReport}
                  className="w-full h-12 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationError}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex flex-wrap items-center gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Options:</div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showGraph}
                  onChange={(e) => setShowGraph(e.target.checked)}
                  className="w-4 h-4 text-gray-600 border-gray-300 dark:border-gray-600 rounded focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-[#212124]"
                />
                Show Graph
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showSummary}
                  onChange={(e) => setShowSummary(e.target.checked)}
                  className="w-4 h-4 text-gray-600 border-gray-300 dark:border-gray-600 rounded focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-[#212124]"
                />
                Show Summary
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showDetail}
                  onChange={(e) => setShowDetail(e.target.checked)}
                  className="w-4 h-4 text-gray-600 border-gray-300 dark:border-gray-600 rounded focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-[#212124]"
                />
                Show Detail
              </label>
              
              {/* Export buttons */}
              <div className="flex gap-3 ml-auto">
                <button className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md" title="Export to Excel">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md" title="Export to PDF">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {renderPieChart(FINDING_DATA, "Finding Summary")}
            {renderPieChart(RESPONSE_DATA, "Response Summary")}
          </div>
        </div>
      </div>
    )
  }

  // Step 2 - Report Details
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-[#212124] shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Audit Report</h1>
            <button
              onClick={handleBackToStep1}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-2 w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Selection
            </button>
          </div>

          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization</label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[#212124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 shadow-sm"
              >
                {SAMPLE_ORGANIZATIONS.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[#212124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 shadow-sm"
              >
                {SAMPLE_QUESTION_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                className="w-full h-12 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {renderPieChart(FINDING_DATA, "Finding Summary")}
          {renderPieChart(RESPONSE_DATA, "Response Summary")}
        </div>

        {/* Organization Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-blue-900 dark:bg-blue-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Organization Summary</h2>
            <p className="text-blue-100 text-sm">AACANet (organization)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {ORGANIZATION_DETAILS.map((detail, index) => (
              <React.Fragment key={index}>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-r border-gray-200 dark:border-gray-600">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{detail.label}</span>
                </div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 md:col-span-1 xl:col-span-2">
                  <span className="text-gray-700 dark:text-gray-300">{detail.value}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Organization Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-blue-900 dark:bg-blue-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Organization Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-gray-100">Question(s)</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-gray-100 w-48">Response</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-gray-100 w-48">Finding</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_QUESTIONS.map((question, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-6 text-gray-700 dark:text-gray-300">{question.question}</td>
                    <td className="px-6 py-6">
                      <div className="space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                          ✓ {question.response}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{question.responseDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                          ✓ {question.finding}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{question.findingDetail}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}