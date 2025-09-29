

import React from "react"
import Link from "@/components/link"

type ResponseCode = "yes" | "no" | "na" | "partial"
type FindingCode = "No Finding" | "Info" | "Observation" | "Minor" | "Major"

type QuestionItem = {
  id: number
  organization: string
  questionGroup: string
  category: string
  title: string
  citation: string
  standard: string
  text: string
  response?: ResponseCode
  finding?: FindingCode
  comment?: string
}

type ResponseQuickFilter = "all" | "unanswered" | ResponseCode
type FindingQuickFilter = "all" | "unlogged" | FindingCode

// Review List Modal Data
type ReviewItem = {
  organization: string
  assignment: string
  total: number
  unansweredOrg: number
  answeredOrg: number
  unansweredAuditor: number
  answeredAuditor: number
}

const REVIEW_ITEMS: ReviewItem[] = [
  {
    organization: "AACANet (organization)",
    assignment: "2024 Data Security and Privacy",
    total: 93,
    unansweredOrg: 44,
    answeredOrg: 49,
    unansweredAuditor: 93,
    answeredAuditor: 0,
  },
  {
    organization: "Dobberstein Law Firm, LLC",
    assignment: "2024 Data Security and Privacy",
    total: 93,
    unansweredOrg: 0,
    answeredOrg: 93,
    unansweredAuditor: 0,
    answeredAuditor: 93,
  },
  {
    organization: "Gordon, Aylworth & Tami, PC",
    assignment: "2024 Data Security and Privacy",
    total: 93,
    unansweredOrg: 0,
    answeredOrg: 93,
    unansweredAuditor: 0,
    answeredAuditor: 93,
  },
  {
    organization: "The Law Office of Frederick I. Weinberg & Associates, P.C.",
    assignment: "2024 Data Security and Privacy",
    total: 93,
    unansweredOrg: 93,
    answeredOrg: 0,
    unansweredAuditor: 93,
    answeredAuditor: 0,
  },
  {
    organization: "Hodosh, Lyon & Hammer, LTD",
    assignment: "2024 Data Security and Privacy",
    total: 93,
    unansweredOrg: 93,
    answeredOrg: 0,
    unansweredAuditor: 93,
    answeredAuditor: 0,
  },
]

const RESPONSE_OPTIONS: ResponseQuickFilter[] = ["all", "unanswered", "yes", "no", "na", "partial"]
const FINDING_OPTIONS: FindingQuickFilter[] = ["all", "unlogged", "No Finding", "Info", "Observation", "Minor", "Major"]

const SAMPLE_ORGS = [
  "AACANet (organization)",
  "Leopold & Associates, PLLC",
  "Heavner, Beyers & Mihlar, LLC",
]

const SAMPLE_GROUPS = ["2024 Data Security and Privacy", "2024 Physical Security Audit"]

const SAMPLE_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    organization: "AACANet (organization)",
    questionGroup: "2024 Data Security and Privacy",
    category: "Data Security and Privacy",
    title: "Data Security Policy",
    citation: "ISO",
    standard: "Provider shall establish written data security policies",
    text: "Does the company have written data security policies and procedures?",
    response: "yes",
    finding: "No Finding",
    comment: "Policy library reviewed 03/14/2024.",
  },
  {
    id: 2,
    organization: "AACANet (organization)",
    questionGroup: "2024 Data Security and Privacy",
    category: "Data Security and Privacy",
    title: "Data Security Policy",
    citation: "ISO",
    standard: "Provider shall establish written data security policies",
    text: "Are your policies reviewed each year and approved by senior management?",
    response: "partial",
    finding: "Observation",
    comment: "Approval pending at June steering committee.",
  },
  {
    id: 3,
    organization: "AACANet (organization)",
    questionGroup: "2024 Data Security and Privacy",
    category: "Data Security and Privacy",
    title: "Access Control",
    citation: "ISO",
    standard: "Access to systems must be controlled",
    text: "Are unique user accounts required for system access and are passwords rotated regularly?",
    response: "no",
    finding: "Major",
    comment: "Legacy CRM still uses shared accounts.",
  },
  {
    id: 4,
    organization: "AACANet (organization)",
    questionGroup: "2024 Data Security and Privacy",
    category: "Data Security and Privacy",
    title: "Encryption",
    citation: "NIST",
    standard: "Sensitive data must be encrypted in transit and at rest",
    text: "Is customer data encrypted at rest and in transit?",
    response: "na",
    finding: "Info",
    comment: "Customer data hosted by third party provider.",
  },
  {
    id: 5,
    organization: "AACANet (organization)",
    questionGroup: "2024 Data Security and Privacy",
    category: "Incident Response",
    title: "Breach Notification",
    citation: "ISO",
    standard: "Incident response procedures must be documented",
    text: "Is there a documented incident response plan with notification procedures?",
    response: "yes",
    finding: "Minor",
    comment: "Plan refreshed but contact tree needs update.",
  },
  {
    id: 6,
    organization: "Leopold & Associates, PLLC",
    questionGroup: "2024 Physical Security Audit",
    category: "Physical Security",
    title: "Facility Controls",
    citation: "PCI",
    standard: "Provider shall maintain physical access controls",
    text: "Are access cards used to control entry to secure areas?",
    response: "yes",
    finding: "No Finding",
    comment: "Access logs reviewed quarterly.",
  },
]

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
      <path d="M12 8.5a2.4 2.4 0 012.4 2.4c0 1.9-2.4 1.9-2.4 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

function uniqueField<T>(rows: T[], key: keyof T): string[] {
  return Array.from(new Set(rows.map(row => row[key] as string))).sort()
}

// Review List Modal Component
function ReviewListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted">
            <h2 className="text-lg font-semibold text-foreground">Review Pending</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted-foreground/10 rounded transition-colors"
            >
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Organization</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Assignment (Group)</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Unanswered (Organization)</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Answered (Organization)</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Unanswered (Auditor)</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Answered (Auditor)</th>
                </tr>
              </thead>
              <tbody className="bg-background">
                {REVIEW_ITEMS.map((item, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground">{item.organization}</td>
                    <td className="px-4 py-3 text-foreground">{item.assignment}</td>
                    <td className="px-4 py-3 text-center text-foreground font-medium">{item.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        item.unansweredOrg > 0 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.unansweredOrg}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        item.answeredOrg > 0 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.answeredOrg}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        item.unansweredAuditor > 0 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.unansweredAuditor}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        item.answeredAuditor > 0 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.answeredAuditor}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-border bg-muted">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RespondToVendorResponsePage() {
  const [organization, setOrganization] = React.useState("All")
  const [questionGroup, setQuestionGroup] = React.useState("All")
  const [appliedOrg, setAppliedOrg] = React.useState("")
  const [appliedGroup, setAppliedGroup] = React.useState("All")
  const [filtersApplied, setFiltersApplied] = React.useState(false)
  const [filterError, setFilterError] = React.useState<string | null>(null)

  const [categoryFilter, setCategoryFilter] = React.useState("All")
  const [titleFilter, setTitleFilter] = React.useState("All")
  const [citationFilter, setCitationFilter] = React.useState("All")
  const [responseFilter, setResponseFilter] = React.useState<ResponseQuickFilter>("all")
  const [findingFilter, setFindingFilter] = React.useState<FindingQuickFilter>("all")

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [showReviewModal, setShowReviewModal] = React.useState(false)

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
    setExpanded({})
  }

  const clearFilters = () => {
    setOrganization("All")
    setQuestionGroup("All")
    setAppliedOrg("")
    setAppliedGroup("All")
    setFiltersApplied(false)
    setFilterError(null)
    setCategoryFilter("All")
    setTitleFilter("All")
    setCitationFilter("All")
    setResponseFilter("all")
    setFindingFilter("all")
    setExpanded({})
  }

  const filteredItems = React.useMemo(() => {
    if (!filtersApplied) return []
    return SAMPLE_QUESTIONS.filter(item => {
      if (appliedOrg && appliedOrg !== "All" && item.organization !== appliedOrg) return false
      if (appliedGroup !== "All" && item.questionGroup !== appliedGroup) return false
      if (categoryFilter !== "All" && item.category !== categoryFilter) return false
      if (titleFilter !== "All" && item.title !== titleFilter) return false
      if (citationFilter !== "All" && item.citation !== citationFilter) return false

      const responseState = item.response ?? "unanswered"
      if (responseFilter !== "all" && responseState !== responseFilter) return false

      const findingState = item.finding ?? "unlogged"
      if (findingFilter !== "all" && findingState !== findingFilter) return false

      return true
    })
  }, [filtersApplied, appliedOrg, appliedGroup, categoryFilter, titleFilter, citationFilter, responseFilter, findingFilter])

  const grouped = React.useMemo(() => {
    const map = new Map<
      string,
      { key: string; category: string; title: string; citation: string; standard: string; questions: QuestionItem[] }
    >()
    filteredItems.forEach(item => {
      const key = `${item.category}||${item.title}||${item.citation}`
      if (!map.has(key)) {
        map.set(key, {
          key,
          category: item.category,
          title: item.title,
          citation: item.citation,
          standard: item.standard,
          questions: [],
        })
      }
      map.get(key)!.questions.push(item)
    })
    return Array.from(map.values())
  }, [filteredItems])

  const categories = React.useMemo(() => ["All", ...uniqueField(filteredItems, "category")], [filteredItems])
  const titles = React.useMemo(() => ["All", ...uniqueField(filteredItems, "title")], [filteredItems])
  const citations = React.useMemo(() => ["All", ...uniqueField(filteredItems, "citation")], [filteredItems])

  const expandAll = () => {
    const newExpanded: Record<string, boolean> = {}
    grouped.forEach(group => {
      newExpanded[group.key] = true
    })
    setExpanded(newExpanded)
  }

  const collapseAll = () => setExpanded({})
  const toggleSection = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4 bg-background text-foreground">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Review Audit Questions</h1>
          <button
            onClick={() => setShowReviewModal(true)}
            className="inline-flex items-center h-10 px-4 rounded bg-sky-600 text-white hover:bg-sky-700 transition-colors"
          >
            Review List
          </button>
        </div>

        <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Organization</label>
              <select
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                className="w-full h-10 border border-border rounded px-3 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none bg-background text-foreground"
              >
                <option value="All">All Organizations</option>
                {SAMPLE_ORGS.map(org => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Question Group</label>
              <select
                value={questionGroup}
                onChange={e => setQuestionGroup(e.target.value)}
                className="w-full h-10 border border-border rounded px-3 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none bg-background text-foreground"
              >
                <option value="All">All Question Groups</option>
                {SAMPLE_GROUPS.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col justify-end">
              {filterError && <div className="text-red-600 text-sm mb-2 text-right">{filterError}</div>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={applyFilter}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  ✓ Apply Filter
                </button>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 h-10 px-3 rounded bg-background border border-border text-muted-foreground hover:bg-muted focus:outline-none focus:ring-1 focus:ring-border"
                >
                  Clear
                </button>
                <button
                  onClick={expandAll}
                  disabled={!grouped.length}
                  className="inline-flex items-center gap-2 h-10 px-3 rounded bg-sky-100 border border-sky-200 text-sky-700 hover:bg-sky-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  disabled={!grouped.length}
                  className="inline-flex items-center gap-2 h-10 px-3 rounded bg-sky-100 border border-sky-200 text-sky-700 hover:bg-sky-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>
        </div>

        {filtersApplied && grouped.length > 0 && (
          <div className="bg-background border border-border rounded-lg px-4 py-3 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Response:</span>
              <div className="flex items-center gap-1">
                {RESPONSE_OPTIONS.map(value => {
                  const active = responseFilter === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setResponseFilter(value)}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded transition-colors ${
                        active
                          ? "bg-sky-600 text-white"
                          : value === "yes" ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                          : value === "no" ? "bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700"
                          : value === "partial" ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
                          : value === "na" ? "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                          : "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                      } hover:ring-2 hover:ring-offset-1 hover:ring-slate-300`}
                      title={value === "unanswered" ? "No response" : value.toUpperCase()}
                    >
                      {RESPONSE_ICON_MAP[value]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Findings:</span>
              <div className="flex items-center gap-1">
                {FINDING_OPTIONS.map(value => {
                  const active = findingFilter === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFindingFilter(value)}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded transition-colors ${
                        active
                          ? "bg-sky-600 text-white"
                          : value === "No Finding" ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                          : value === "Info" ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                          : value === "Observation" ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
                          : value === "Minor" ? "bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                          : value === "Major" ? "bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700"
                          : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                      } hover:ring-2 hover:ring-offset-1 hover:ring-slate-300`}
                      title={value === "unlogged" ? "No finding logged" : value}
                    >
                      {FINDING_ICON_MAP[value]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {filtersApplied && grouped.length > 0 && (
          <div className="flex flex-col md:flex-row w-full gap-3">
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {categories.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
              <select
                value={titleFilter}
                onChange={e => setTitleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {titles.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Citation</label>
              <select
                value={citationFilter}
                onChange={e => setCitationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {citations.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {!filtersApplied ? (
          <div className="min-h-[420px] border border-dashed border-border rounded-lg bg-background flex items-center justify-center text-muted-foreground">
            Please apply filters to view questions.
          </div>
        ) : grouped.length === 0 ? (
          <div className="p-6 bg-background border border-border rounded text-center text-muted-foreground">No questions match the current filters.</div>
        ) : (
          grouped.map(section => {
            const isOpen = expanded[section.key] ?? false
            return (
              <div key={section.key} className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-4 text-sm text-muted-foreground">
                    <span>
                      <strong className="text-foreground">Category:</strong> {section.category}
                    </span>
                    <span>
                      <strong className="text-foreground">Title:</strong> {section.title}
                    </span>
                    <span>
                      <strong className="text-foreground">Citation:</strong> {section.citation}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Standard:</strong> {section.standard}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded border border-border bg-background hover:bg-muted text-muted-foreground"
                    title={isOpen ? "Collapse section" : "Expand section"}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      {isOpen ? (
                        <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      )}
                    </svg>
                  </button>
                </div>
                {isOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="p-3 text-left w-12 text-foreground">#</th>
                          <th className="p-3 text-left w-12 text-foreground">Log</th>
                          <th className="p-3 text-left text-foreground">Question (s)</th>
                          <th className="p-3 text-left w-28 text-foreground">Response</th>
                          <th className="p-3 text-left w-40 text-foreground">Finding</th>
                          <th className="p-3 text-left w-72 text-foreground">Comment</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background">
                        {section.questions.map((q, idx) => (
                          <tr key={q.id} className="border-t border-border hover:bg-muted/50">
                            <td className="p-3 align-top text-foreground">{idx + 1}</td>
                            <td className="p-3 align-top text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-border bg-background text-muted-foreground">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 5h10l4 4v10H5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                  <path d="M9 5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                </svg>
                              </span>
                            </td>
                            <td className="p-3 align-top text-foreground">{q.text}</td>
                            <td className="p-3 align-top">
                              {q.response ? (
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${RESPONSE_BADGE[q.response]}`}>
                                  {RESPONSE_ICON_MAP[q.response]}
                                  <span className="text-xs uppercase font-semibold">{q.response}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">No response</span>
                              )}
                            </td>
                            <td className="p-3 align-top">
                              {q.finding ? (
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${FINDING_BADGE[q.finding]}`}>
                                  {FINDING_ICON_MAP[q.finding]}
                                  <span className="text-xs font-semibold">{q.finding}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Not logged</span>
                              )}
                            </td>
                            <td className="p-3 align-top">
                              <textarea
                                value={q.comment ?? ""}
                                readOnly
                                placeholder="Comment"
                                className="w-full h-24 border border-border rounded px-3 py-2 text-sm bg-muted text-foreground"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Review List Modal */}
      <ReviewListModal 
        isOpen={showReviewModal} 
        onClose={() => setShowReviewModal(false)} 
      />
    </>
  )
}