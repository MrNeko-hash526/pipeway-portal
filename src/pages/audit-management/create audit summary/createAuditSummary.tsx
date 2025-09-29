

import React from "react"
import Link from "@/components/link"

type AuditReport = {
  id: number
  organization: string
  questionGroup: string
  assignmentDate: string
  rating: string
  completionDate: string
  hasDocument: boolean
}

type SortField = keyof AuditReport
type SortDirection = 'asc' | 'desc'

const SAMPLE_AUDIT_REPORTS: AuditReport[] = [
  {
    id: 1,
    organization: "AACANet (organization)",
    questionGroup: "2018 Data Security & Privacy",
    assignmentDate: "4/5/2018",
    rating: "Auto Close after Remediation",
    completionDate: "10/11/2019",
    hasDocument: true,
  },
  {
    id: 2,
    organization: "AACANet (organization)",
    questionGroup: "2021 Proof of Good Standing with Bar",
    assignmentDate: "2/8/2021",
    rating: "Satisfactory",
    completionDate: "4/5/2021",
    hasDocument: true,
  },
  {
    id: 3,
    organization: "AACANet (organization)",
    questionGroup: "2022 Data Security and Privacy",
    assignmentDate: "4/26/2022",
    rating: "Satisfactory",
    completionDate: "5/19/2022",
    hasDocument: true,
  },
  {
    id: 4,
    organization: "AACANet (organization)",
    questionGroup: "2023 Data Security and Privacy",
    assignmentDate: "4/12/2023",
    rating: "Satisfactory",
    completionDate: "4/20/2023",
    hasDocument: true,
  },
  {
    id: 5,
    organization: "Aldridge File Haan, LLP",
    questionGroup: "2022 Data Security and Privacy",
    assignmentDate: "8/23/2022",
    rating: "Need Improvement",
    completionDate: "1/4/2023",
    hasDocument: true,
  },
  {
    id: 6,
    organization: "Aldridge File Haan, LLP",
    questionGroup: "On-Premises Exchange Server Audit (New)",
    assignmentDate: "5/2/2021",
    rating: "Satisfactory",
    completionDate: "5/4/2021",
    hasDocument: true,
  },
  {
    id: 7,
    organization: "Aldridge File Haan, LLP",
    questionGroup: "Reg-F Questionnaire",
    assignmentDate: "10/11/2021",
    rating: "Satisfactory",
    completionDate: "12/3/2021",
    hasDocument: true,
  },
  {
    id: 8,
    organization: "Aldridge File Haan, LLP",
    questionGroup: "2018 Data Security & Privacy",
    assignmentDate: "4/5/2018",
    rating: "Closed Remediation Incomplete",
    completionDate: "5/7/2019",
    hasDocument: true,
  },
  {
    id: 9,
    organization: "Aldridge File Haan, LLP",
    questionGroup: "2021 Proof of Good Standing with Bar",
    assignmentDate: "2/8/2021",
    rating: "Satisfactory",
    completionDate: "4/6/2021",
    hasDocument: true,
  },
  {
    id: 10,
    organization: "Aldridge File Haan, LLP",
    questionGroup: "On-Premises Exchange Server Audit",
    assignmentDate: "4/14/2021",
    rating: "Need Improvement",
    completionDate: "5/12/2021",
    hasDocument: true,
  },
]

const ORGANIZATIONS = [
  "All",
  "AACANet (organization)",
  "Aldridge File Haan, LLP",
  "Leopold & Associates, PLLC",
  "Heavner, Beyers & Mihlar, LLC",
]

function getRatingBadgeClass(rating: string): string {
  switch (rating) {
    case "Satisfactory":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
    case "Need Improvement":
      return "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
    case "Auto Close after Remediation":
      return "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
    case "Closed Remediation Incomplete":
      return "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700"
    default:
      return "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
  }
}

function parseDate(dateString: string): Date {
  const [month, day, year] = dateString.split('/')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

export default function CreateAuditSummaryPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedOrg, setSelectedOrg] = React.useState("All")
  const [sortField, setSortField] = React.useState<SortField>('id')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedAndFilteredReports = React.useMemo(() => {
    let filtered = SAMPLE_AUDIT_REPORTS.filter(report => {
      const matchesSearch = searchTerm === "" || 
        report.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.questionGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.rating.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesOrg = selectedOrg === "All" || report.organization === selectedOrg

      return matchesSearch && matchesOrg
    })

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortField === 'assignmentDate' || sortField === 'completionDate') {
        aValue = parseDate(a[sortField])
        bValue = parseDate(b[sortField])
      } else {
        aValue = a[sortField]
        bValue = b[sortField]
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [searchTerm, selectedOrg, sortField, sortDirection])

  const handleDocumentClick = (reportId: number, organization: string, questionGroup: string) => {
    // TODO: Implement document download/view functionality
    console.log(`Document clicked for report ${reportId}:`, { organization, questionGroup })
    // This could open a modal, download a file, or navigate to a document viewer
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-muted-foreground opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" />
      </svg>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="bg-slate-600 text-white px-6 py-4 dark:bg-slate-700">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Audit Reports</h1>
          <Link 
            href="/audit-management/create-summary/create-report"
            className="bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded text-sm font-medium transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 inline-block"
          >
            Create Audit Report
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-muted border-b border-border">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-80 h-9 px-3 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">Organization:</label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-64 h-9 px-3 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none"
            >
              {ORGANIZATIONS.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-foreground font-medium w-12">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors"
                  >
                    #
                    {getSortIcon('id')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-foreground font-medium">
                  <button
                    onClick={() => handleSort('organization')}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors"
                  >
                    Organization
                    {getSortIcon('organization')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-foreground font-medium">
                  <button
                    onClick={() => handleSort('questionGroup')}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors"
                  >
                    Question Group
                    {getSortIcon('questionGroup')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-foreground font-medium">
                  <button
                    onClick={() => handleSort('assignmentDate')}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors"
                  >
                    Assignment Date
                    {getSortIcon('assignmentDate')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-foreground font-medium">
                  <button
                    onClick={() => handleSort('rating')}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors"
                  >
                    Rating
                    {getSortIcon('rating')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-foreground font-medium">
                  <button
                    onClick={() => handleSort('completionDate')}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors"
                  >
                    Completion Date
                    {getSortIcon('completionDate')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-foreground font-medium w-24">Document</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {sortedAndFilteredReports.map((report, index) => (
                <tr 
                  key={report.id} 
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground font-medium">{index + 1}</td>
                  <td className="px-4 py-3 text-foreground">{report.organization}</td>
                  <td className="px-4 py-3 text-foreground">{report.questionGroup}</td>
                  <td className="px-4 py-3 text-foreground">{report.assignmentDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRatingBadgeClass(report.rating)}`}>
                      {report.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{report.completionDate}</td>
                  <td className="px-4 py-3 text-center">
                    {report.hasDocument && (
                      <button 
                        onClick={() => handleDocumentClick(report.id, report.organization, report.questionGroup)}
                        className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1"
                        title={`View document for ${report.organization} - ${report.questionGroup}`}
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedAndFilteredReports.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No audit reports found matching your criteria.
            </div>
          )}
        </div>

        {/* Pagination indicator */}
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {sortedAndFilteredReports.length} of {SAMPLE_AUDIT_REPORTS.length} results</span>
            <button className="p-1 hover:bg-muted rounded transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}