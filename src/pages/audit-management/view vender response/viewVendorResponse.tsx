"use client"

import React from "react"
import * as ExcelJS from "exceljs"

type QuestionItem = {
  id: number
  organization: string
  questionGroup: string
  category: string
  title: string
  citation: string
  standard: string
  text: string
  response?: "yes" | "no" | "na" | "partial"
  responseDate?: string
  finding?: "No Finding" | "Observation" | "Minor" | "Major" | "Info"
  findingDate?: string
  comment?: string
  hasReport?: boolean
  reportName?: string
}

type ResponseCode = NonNullable<QuestionItem["response"]>
type ResponseQuickFilter = "all" | "unanswered" | ResponseCode

type FindingCode = NonNullable<QuestionItem["finding"]>
type FindingQuickFilter = "all" | "unlogged" | FindingCode

const RESPONSE_ICON_MAP: Record<ResponseQuickFilter, JSX.Element> = {
  all: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  unanswered: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M7 8h10M7 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  yes: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M19 6L9.5 15.5 5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  no: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  na: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  partial: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v5l3 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const RESPONSE_BADGE: Record<ResponseCode, string> = {
  yes: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700",
  no: "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700",
  na: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
  partial: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700",
}

const FINDING_ICON_MAP: Record<FindingQuickFilter, JSX.Element> = {
  all: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M6 7h12M6 12h12M6 17h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  unlogged: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8.5a2.3 2.3 0 012.3 2.3c0 1.8-2.3 1.8-2.3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
  "No Finding": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Info: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="8.2" r="1" fill="currentColor" />
    </svg>
  ),
  Observation: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  ),
  Minor: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M12 4l8 14H4l8-14z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1" fill="currentColor" />
    </svg>
  ),
  Major: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3L8.3 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15.8" r="1" fill="currentColor" />
    </svg>
  ),
}

const FINDING_BADGE: Record<FindingCode, string> = {
  "No Finding": "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700",
  Info: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
  Observation: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700",
  Minor: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700",
  Major: "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700",
}

// Sample data
const SAMPLE_ORGS = [
  "AACANet (organization)",
  "Leopold & Associates, PLLC",
  "Heavner, Beyers & Mihlar, LLC",
]

const SAMPLE_GROUPS = ["2018 Data Security & Privacy", "2024 Data Security and Privacy"]

const SAMPLE_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    organization: "AACANet (organization)",
    questionGroup: "2018 Data Security & Privacy",
    category: "Data Security and Privacy",
    title: "Data Security Policy",
    citation: "ISO",
    standard: "Provider shall establish written data security policies",
    text: "Does the company have written data security policies and procedures? If yes, please upload a copy for our review and if the policy is part of a larger policy set, please indicate in the comments the title of the policy and/or its location within the larger document.",
    response: "yes",
    responseDate: "2019-07-16",
    finding: "No Finding",
    findingDate: "2019-09-11",
    hasReport: true,
    reportName: "DataSecurityPolicy.pdf",
  },
  {
    id: 2,
    organization: "AACANet (organization)",
    questionGroup: "2018 Data Security & Privacy",
    category: "Data Security and Privacy", 
    title: "Data Security Policy",
    citation: "ISO",
    standard: "Provider shall establish written data security policies",
    text: "Are your policies reviewed each year and approved by senior management?",
    response: "yes",
    responseDate: "2019-07-16",
    finding: "Observation",
    findingDate: "2019-09-30",
  },
  {
    id: 3,
    organization: "AACANet (organization)",
    questionGroup: "2018 Data Security & Privacy",
    category: "Data Security and Privacy",
    title: "Data Security Policy", 
    citation: "ISO",
    standard: "Provider shall establish written data security policies",
    text: "Are the policies distributed to the company staff?",
    response: "yes",
    responseDate: "2019-07-16",
    finding: "No Finding",
    findingDate: "2019-09-11",
  },
  {
    id: 4,
    organization: "AACANet (organization)",
    questionGroup: "2018 Data Security & Privacy",
    category: "Data Security and Privacy",
    title: "Data Security Policy",
    citation: "ISO", 
    standard: "Provider shall establish written data security policies",
    text: "Has the company had a recent a SOC2, SASE16 or PCI DSS Assessment conducted within the preceding 24 months? If the answer to this question is yes, please provide a copy of the report.",
    response: "no",
    responseDate: "2019-06-26",
    finding: "Observation",
    findingDate: "2019-09-11",
  },
  {
    id: 5,
    organization: "AACANet (organization)",
    questionGroup: "2018 Data Security & Privacy",
    category: "Data Security and Privacy",
    title: "Data Security Policy",
    citation: "ISO",
    standard: "Provider shall establish written data security policies",
    text: "Does the company require employees to pass a test on the security policies? If so, please upload a record of employee passage for the previous 12 months.",
    response: "yes",
    responseDate: "2019-06-10",
    finding: "Observation",
    findingDate: "2019-09-30",
  },
  {
    id: 6,
    organization: "AACANet (organization)", 
    questionGroup: "2018 Data Security & Privacy",
    category: "Data Security and Privacy",
    title: "Data Security Policy",
    citation: "ISO",
    standard: "Provider shall establish written data security policies",
    text: "Does company require employees to sign an acknowledgment that they have been provided a copy and have read the policies? If yes, please provide a copy of the acknowledgment signed by each employee for the previous 12 months.",
    response: "yes",
    responseDate: "2019-06-10",
    finding: "Observation", 
    findingDate: "2019-09-30",
  },
]

function uniqueField<T>(data: T[], key: keyof T): string[] {
  return [...new Set(data.map(item => item[key]).filter(Boolean) as string[])].sort()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString()
}

// --- Enhanced Excel Export ---
async function exportToExcel(grouped: any[], appliedOrg: string, appliedGroup: string) {
  try {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Pipeway Portal"
    workbook.created = new Date()
    
    const worksheet = workbook.addWorksheet("Vendor Response Report")
    
    // Set up columns with proper widths
    worksheet.columns = [
      { header: "Organization", key: "organization", width: 30 },
      { header: "Question Group", key: "questionGroup", width: 30 },
      { header: "Category", key: "category", width: 25 },
      { header: "Title", key: "title", width: 25 },
      { header: "Citation", key: "citation", width: 12 },
      { header: "Standard", key: "standard", width: 50 },
      { header: "Question", key: "question", width: 60 },
      { header: "Response", key: "response", width: 12 },
      { header: "Response Date", key: "responseDate", width: 15 },
      { header: "Finding", key: "finding", width: 15 },
      { header: "Finding Date", key: "findingDate", width: 15 },
      { header: "Has Report", key: "hasReport", width: 12 },
      { header: "Report Name", key: "reportName", width: 30 },
      { header: "Comment", key: "comment", width: 50 }
    ]

    // Style header row
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.alignment = { horizontal: "center", vertical: "middle" }
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }
    headerRow.font = { ...headerRow.font, color: { argb: "FFFFFFFF" } }

    // Add data rows
    let rowNum = 2
    grouped.forEach((section) => {
      section.questions.forEach((q: QuestionItem) => {
        const row = worksheet.addRow({
          organization: q.organization,
          questionGroup: q.questionGroup,
          category: section.category,
          title: section.title,
          citation: section.citation,
          standard: section.standard,
          question: q.text,
          response: q.response || "Not Answered",
          responseDate: formatDate(q.responseDate),
          finding: q.finding || "Not Logged",
          findingDate: formatDate(q.findingDate),
          hasReport: q.hasReport ? "Yes" : "No",
          reportName: q.reportName || "",
          comment: q.comment || ""
        })

        // Style data rows
        row.alignment = { vertical: "top", wrapText: true }
        
        // Color code responses
        const responseCell = row.getCell(8)
        switch (q.response) {
          case "yes":
            responseCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10B981" } }
            responseCell.font = { color: { argb: "FFFFFFFF" } }
            break
          case "no":
            responseCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEF4444" } }
            responseCell.font = { color: { argb: "FFFFFFFF" } }
            break
          case "partial":
            responseCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF59E0B" } }
            responseCell.font = { color: { argb: "FFFFFFFF" } }
            break
          case "na":
            responseCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } }
            responseCell.font = { color: { argb: "FFFFFFFF" } }
            break
        }

        // Color code findings
        const findingCell = row.getCell(10)
        switch (q.finding) {
          case "No Finding":
            findingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10B981" } }
            break
          case "Info":
            findingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } }
            break
          case "Observation":
            findingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF59E0B" } }
            break
          case "Minor":
            findingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEF4444" } }
            break
          case "Major":
            findingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDC2626" } }
            findingCell.font = { color: { argb: "FFFFFFFF" } }
            break
        }

        rowNum++
      })
    })

    // Add filters and freeze panes
    worksheet.autoFilter = { from: "A1", to: `N${rowNum - 1}` }
    worksheet.views = [{ state: "frozen", ySplit: 1 }]

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    })
    
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `vendor-response-${appliedOrg.replace(/[^a-zA-Z0-9]/g, "_")}-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

  } catch (error) {
    console.error("Export failed:", error)
    alert("Export failed. Please try again.")
  }
}

export default function ViewVendorResponsePage() {
  const [organization, setOrganization] = React.useState<string>("All")
  const [questionGroup, setQuestionGroup] = React.useState<string>("All")
  const [appliedOrg, setAppliedOrg] = React.useState<string>("")
  const [appliedGroup, setAppliedGroup] = React.useState<string>("All")
  const [filtersApplied, setFiltersApplied] = React.useState<boolean>(false)
  const [filterError, setFilterError] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<QuestionItem[]>(() => SAMPLE_QUESTIONS)
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All")
  const [titleFilter, setTitleFilter] = React.useState<string>("All")
  const [citationFilter, setCitationFilter] = React.useState<string>("All")
  const [responseQuickFilter, setResponseQuickFilter] = React.useState<ResponseQuickFilter>("all")
  const [findingQuickFilter, setFindingQuickFilter] = React.useState<FindingQuickFilter>("all")
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const categories = ["All", ...uniqueField(items, "category")]
  const titles = ["All", ...uniqueField(items, "title")]
  const citations = ["All", ...uniqueField(items, "citation")]

  const filteredItems = React.useMemo(() => {
    if (!filtersApplied) return []
    return items.filter((q) => {
      if (appliedOrg && appliedOrg !== "All" && q.organization !== appliedOrg) return false
      if (appliedGroup && appliedGroup !== "All" && q.questionGroup !== appliedGroup) return false
      if (categoryFilter && categoryFilter !== "All" && q.category !== categoryFilter) return false
      if (titleFilter && titleFilter !== "All" && q.title !== titleFilter) return false
      if (citationFilter && citationFilter !== "All" && q.citation !== citationFilter) return false
      
      // Quick filters
      if (responseQuickFilter !== "all") {
        if (responseQuickFilter === "unanswered" && q.response) return false
        if (responseQuickFilter !== "unanswered" && q.response !== responseQuickFilter) return false
      }
      if (findingQuickFilter !== "all") {
        if (findingQuickFilter === "unlogged" && q.finding) return false
        if (findingQuickFilter !== "unlogged" && q.finding !== findingQuickFilter) return false
      }
      
      return true
    })
  }, [items, appliedOrg, appliedGroup, categoryFilter, titleFilter, citationFilter, responseQuickFilter, findingQuickFilter])

  // Group questions by category-title-citation
  const grouped = React.useMemo(() => {
    const groups = new Map<string, {
      key: string
      category: string
      title: string
      citation: string
      standard: string
      questions: QuestionItem[]
    }>()

    filteredItems.forEach(item => {
      const key = `${item.category}-${item.title}-${item.citation}`
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          category: item.category,
          title: item.title,
          citation: item.citation,
          standard: item.standard,
          questions: []
        })
      }
      groups.get(key)!.questions.push(item)
    })

    return Array.from(groups.values())
  }, [filteredItems])

  const expandAll = () => {
    const newExpanded: Record<string, boolean> = {}
    grouped.forEach(group => {
      newExpanded[group.key] = true
    })
    setExpanded(newExpanded)
  }

  const collapseAll = () => {
    setExpanded({})
  }

  const toggleGroup = (key: string) => {
    setExpanded(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const applyFilter = () => {
    // Validation for required selections
    const errors = []
    if (organization === "All") {
      errors.push("Please select a specific Organization")
    }
    if (questionGroup === "All") {
      errors.push("Please select a specific Question Group")
    }

    if (errors.length > 0) {
      setFilterError(errors.join(" and ") + ".")
      setFiltersApplied(false)
      return
    }

    setFilterError(null)
    setAppliedOrg(organization)
    setAppliedGroup(questionGroup)
    setFiltersApplied(true)
    // Auto-expand first group
    setTimeout(() => {
      if (grouped.length > 0) {
        setExpanded({ [grouped[0].key]: true })
      }
    }, 100)
  }

  const clearFilters = () => {
    setOrganization("All")
    setQuestionGroup("All")
    setAppliedOrg("")
    setAppliedGroup("All")
    setCategoryFilter("All")
    setTitleFilter("All")
    setCitationFilter("All")
    setResponseQuickFilter("all")
    setFindingQuickFilter("all")
    setFiltersApplied(false)
    setFilterError(null)
    setExpanded({})
  }

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted border-border">
        <h1 className="text-lg font-medium text-foreground">List of Questions</h1>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Organization:</label>
            <select
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              className="w-full h-10 border rounded px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-background text-foreground border-border"
            >
              <option value="All">All Organizations</option>
              {SAMPLE_ORGS.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">Question Group:</label>
            <select
              value={questionGroup}
              onChange={e => setQuestionGroup(e.target.value)}
              className="w-full h-10 border rounded px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-background text-foreground border-border"
            >
              <option value="All">All Question Groups</option>
              {SAMPLE_GROUPS.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            {filterError && (
              <div className="text-red-600 text-sm mb-2">
                {filterError}
              </div>
            )}
            <button
              onClick={applyFilter}
              className="h-10 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm font-medium transition-colors focus:ring-2 focus:ring-sky-400 focus:outline-none"
            >
              ✓ Apply Filter
            </button>
          </div>
        </div>

        {/* Quick Filter Toolbar */}
        {filtersApplied && (
          <div className="flex items-center gap-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Response:</span>
              <div className="flex gap-1">
                {(["all", "unanswered", "yes", "no", "na", "partial"] as ResponseQuickFilter[]).map(value => (
                  <button
                    key={value}
                    onClick={() => setResponseQuickFilter(value)}
                    className={`w-8 h-8 border rounded flex items-center justify-center transition-colors ${
                      responseQuickFilter === value
                        ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                        : value === "yes" ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                        : value === "no" ? "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700"
                        : value === "partial" ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
                        : value === "na" ? "bg-muted text-muted-foreground border-border hover:opacity-80"
                        : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                    }`}
                    title={value === "unanswered" ? "Unanswered" : value.toUpperCase()}
                  >
                    {RESPONSE_ICON_MAP[value]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Findings:</span>
              <div className="flex gap-1">
                {(["all", "unlogged", "No Finding", "Info", "Observation", "Minor", "Major"] as FindingQuickFilter[]).map(value => (
                  <button
                    key={value}
                    onClick={() => setFindingQuickFilter(value)}
                    className={`w-8 h-8 border rounded flex items-center justify-center transition-colors ${
                      findingQuickFilter === value
                        ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                        : value === "No Finding" ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                        : value === "Info" ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                        : value === "Observation" ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
                        : value === "Minor" ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                        : value === "Major" ? "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700"
                        : "bg-muted text-muted-foreground border-border hover:opacity-80"
                    }`}
                    title={value === "unlogged" ? "Unlogged" : value}
                  >
                    {FINDING_ICON_MAP[value]}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Reports:</span>
                <button className="w-8 h-8 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded flex items-center justify-center hover:bg-emerald-200 transition-colors dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <text x="12" y="16" fontSize="8" textAnchor="middle" fill="white">X</text>
                  </svg>
                </button>
              </div>
              <button 
                onClick={expandAll}
                disabled={grouped.length === 0}
                className="px-3 py-1 bg-sky-100 text-sky-700 border border-sky-200 rounded text-sm hover:bg-sky-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700"
              >
                Expand All
              </button>
              <button 
                onClick={collapseAll}
                disabled={grouped.length === 0}
                className="px-3 py-1 bg-sky-100 text-sky-700 border border-sky-200 rounded text-sm hover:bg-sky-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700"
              >
                Collapse All
              </button>
            </div>
          </div>
        )}

        {/* Secondary Filters with Labels */}
        {filtersApplied && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full h-9 border rounded px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-background text-foreground border-border"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Title</label>
              <select
                value={titleFilter}
                onChange={e => setTitleFilter(e.target.value)}
                className="w-full h-9 border rounded px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-background text-foreground border-border"
              >
                {titles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">Citation</label>
              <select
                value={citationFilter}
                onChange={e => setCitationFilter(e.target.value)}
                className="w-full h-9 border rounded px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-background text-foreground border-border"
              >
                {citations.map(citation => (
                  <option key={citation} value={citation}>{citation}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grouped Content */}
      {filtersApplied && grouped.length > 0 ? (
        <div className="space-y-0">
          {grouped.map(group => {
            const isExpanded = expanded[group.key] ?? false
            return (
              <div key={group.key} className="border-b border-border">
                {/* Group Header */}
                <div className="px-4 py-3 border-y bg-muted border-border">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-foreground"><strong>Category:</strong> {group.category}</span>
                    <span className="text-foreground"><strong>Title:</strong> {group.title}</span> 
                    <span className="text-foreground"><strong>Citation:</strong> {group.citation}</span>
                    <span className="text-muted-foreground"><strong>Standard:</strong> {group.standard}</span>
                    <button 
                      onClick={() => toggleGroup(group.key)}
                      className="ml-auto text-sky-600 hover:text-sky-700 transition-colors dark:text-sky-400 dark:hover:text-sky-300"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Group Table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted border-border">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium w-12 text-foreground">#</th>
                          <th className="px-4 py-3 text-left font-medium w-16 text-foreground">Log</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Question (s)</th>
                          <th className="px-4 py-3 text-left font-medium w-24 text-foreground">Response</th>
                          <th className="px-4 py-3 text-left font-medium w-24 text-foreground">Finding</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background">
                        {group.questions.map((q, idx) => (
                          <tr key={q.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-4 text-foreground">{idx + 1}</td>
                            <td className="px-4 py-4 text-center">
                              <div className="w-6 h-6 border rounded flex items-center justify-center bg-background border-border">
                                <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-foreground">{q.text}</td>
                            <td className="px-4 py-4">
                              {q.response && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center shadow-sm ${
                                    q.response === "yes" ? "bg-emerald-500 text-white" :
                                    q.response === "no" ? "bg-rose-500 text-white" :
                                    q.response === "partial" ? "bg-amber-500 text-white" :
                                    "bg-slate-500 text-white"
                                  }`}>
                                    {RESPONSE_ICON_MAP[q.response]}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(q.responseDate)}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {q.finding && (
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center shadow-sm ${
                                    q.finding === "No Finding" ? "bg-emerald-500 text-white" :
                                    q.finding === "Observation" ? "bg-amber-500 text-white" :
                                    q.finding === "Minor" ? "bg-orange-500 text-white" :
                                    q.finding === "Major" ? "bg-rose-500 text-white" :
                                    "bg-blue-500 text-white"
                                  }`}>
                                    {FINDING_ICON_MAP[q.finding]}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(q.findingDate)}
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : filtersApplied ? (
        <div className="p-8 text-center text-muted-foreground">
          No questions match the current filters.
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          Please apply filters to view questions.
        </div>
      )}
    </div>
  )
}
