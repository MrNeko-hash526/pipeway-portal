import React, { useMemo, useState } from "react"
import Link from "@/components/link"
import * as yup from "yup"

type Question = {
  id: number
  text: string
  status: "Active" | "Inactive" | "Draft"
  logCount: number
}

const SAMPLE_CATEGORY = {
  category: "Governance and Consumer Compliance",
  title: "Provider Capability",
  citation: "ALL",
  standard: "Provider shall keep and maintain appropriate documentation for audit review",
}

const INIT_QUESTIONS: Question[] = [
  { id: 1, text: "Do you have a Business Profile for your organization? If yes, please share the link or website for audit review.", status: "Active", logCount: 2 },
  { id: 2, text: "Do you provide adequate information on your organization's website for consumers on how to contact you? If so, please share a screenshot for review.", status: "Active", logCount: 1 },
  { id: 3, text: "Do you have adequate number of desktop, workstations, servers, telephone and internet services?", status: "Active", logCount: 0 },
  { id: 4, text: "Do you have policies and practices for the management of the office? If so, please share a copy of the Operation Manual, Technical Manual, Employee Handbook or Training Materials for Audit Review.", status: "Active", logCount: 3 },
  { id: 5, text: "Do you have designated licensed employees working on AACANet claims? Please share a list of licensed employees mentioning the date of validity of their licenses.", status: "Active", logCount: 0 },
  { id: 6, text: "Do you have a list of current employees with their title and job duties? If so, please share the list, with job descriptions, for audit review.", status: "Draft", logCount: 0 },
  { id: 7, text: "Do you have sufficient staff to work on AACANet Claims? Please share a list of current employees assigned for handling claims.", status: "Inactive", logCount: 1 },
]

export default function QuestionsSetupPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Inactive" | "Draft">("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [items, setItems] = useState<Question[]>(INIT_QUESTIONS)

  // validation schema for filters
  const filterSchema = yup.object({
    query: yup.string().max(200, "Search may be at most 200 characters").trim(),
    statusFilter: yup.mixed().oneOf(["", "Active", "Inactive", "Draft"]),
  }).strict(true)

  // handlers that validate using yup before applying state
  const handleQueryChange = (v: string) => {
    try {
      filterSchema.validateSync({ query: v, statusFilter })
      setValidationError(null)
      setQuery(v)
    } catch (err: any) {
      setValidationError(err?.message ?? "Invalid input")
    }
  }

  const handleStatusChange = (v: "" | "Active" | "Inactive" | "Draft") => {
    try {
      filterSchema.validateSync({ query, statusFilter: v })
      setValidationError(null)
      setStatusFilter(v)
    } catch (err: any) {
      setValidationError(err?.message ?? "Invalid input")
    }
  }

  // Approve/Disable handlers
  const handleApprove = (id: number) => {
    setItems(list =>
      list.map(q =>
        q.id === id ? { ...q, status: "Active" } : q
      )
    )
  }

  const handleDisable = (id: number) => {
    setItems(list =>
      list.map(q =>
        q.id === id ? { ...q, status: "Inactive" } : q
      )
    )
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      if (statusFilter && it.status !== statusFilter) return false
      if (!q) return true
      return it.text.toLowerCase().includes(q) || String(it.id) === q
    })
  }, [items, query, statusFilter])

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">List of Questions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            {items.length} total questions — use search and status filter to narrow results.
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400"> {/* kept small auxiliary info here if needed */} </div>
      </div>

      <section className="mb-4 bg-white dark:bg-slate-800 rounded border border-border p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm text-slate-700 dark:text-slate-200 mr-2">Search:</label>
            <div className="w-full md:w-72">
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded border px-3 bg-white text-slate-900 placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-gray-400 dark:border-slate-700"
              />
              {validationError && <div className="text-rose-600 text-xs mt-1">{validationError}</div>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700 dark:text-slate-200">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="h-10 rounded border px-3 bg-white dark:bg-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            >
              <option value="">All</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Inactive</option>
            </select>

            <div className="ml-2 flex items-center gap-2">
              <Link href="/audit-management/questions-setup/add" className="inline-flex items-center gap-2 h-10 px-4 bg-slate-600 text-white rounded hover:bg-slate-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Add Questions
              </Link>
              <Link href="/audit-management/questions-setup/upload" className="inline-flex items-center gap-2 h-10 px-4 bg-slate-500 text-white rounded hover:bg-slate-600">
                Upload Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 text-sm mb-0">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-b-0 border-r-0 text-slate-700 dark:text-slate-200 font-medium">Category</div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-b-0 border-r-0 text-slate-700 dark:text-slate-200 font-medium">Title</div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-b-0 border-r-0 text-slate-700 dark:text-slate-200 font-medium">Citation</div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-b-0 text-slate-700 dark:text-slate-200 font-medium">Standard</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 text-sm">
          <div className="p-3 border border-t-0 border-r-0 col-span-1 text-slate-800 dark:text-slate-100">{SAMPLE_CATEGORY.category}</div>
          <div className="p-3 border border-t-0 border-r-0 text-slate-800 dark:text-slate-100">{SAMPLE_CATEGORY.title}</div>
          <div className="p-3 border border-t-0 border-r-0 text-slate-800 dark:text-slate-100">{SAMPLE_CATEGORY.citation}</div>
          <div className="p-3 border border-t-0 text-slate-800 dark:text-slate-100 truncate">{SAMPLE_CATEGORY.standard}</div>
        </div>
      </section>

      <section className="rounded-lg overflow-hidden shadow-sm border border-border bg-slate-50 dark:bg-[rgb(33,33,36)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px] dark:text-[#e6e6e6]">
            <thead className="bg-white/60 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-sm sticky top-0">
              <tr>
                <th className="w-12 text-left p-3 border-b border-border text-slate-600 dark:text-[#e6e6e6]">#</th>
                <th className="text-left p-3 border-b border-border text-slate-600 dark:text-[#e6e6e6]">Question</th>
                <th className="w-28 text-center p-3 border-b border-border text-slate-600 dark:text-[#e6e6e6]">Status</th>
                <th className="w-44 text-center p-3 border-b border-border text-slate-600 dark:text-[#e6e6e6]">Action</th>
                <th className="w-16 text-center p-3 border-b border-border text-slate-600 dark:text-[#e6e6e6]">Log</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-[#e6e6e6]">No questions match your filter.</td>
                </tr>
              )}
              {filtered.map((q) => (
                <tr key={q.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-[rgba(255,255,255,0.02)] dark:even:bg-transparent">
                  <td className="p-3 align-top border-b border-border text-slate-800 dark:text-[#e6e6e6]">{q.id}</td>
                  <td className="p-3 align-top border-b border-border text-slate-800 dark:text-[#e6e6e6]">{q.text}</td>
                  <td className="p-3 align-top border-b border-border text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${q.status === "Active" ? "bg-emerald-100 text-emerald-800" : q.status === "Draft" ? "bg-yellow-100 text-amber-800" : "bg-slate-100 text-slate-700 dark:bg-[rgba(255,255,255,0.03)] dark:text-[#e6e6e6]"}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3 align-top border-b border-border text-center space-x-2">
                    <button title="Edit" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.04)]">
                      <Link href={`/audit-management/questions-setup/add?id=${q.id}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 21v-3l11-11 3 3L6 21H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </button>
                    <button title="Duplicate" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.04)]">
                      <Link href={`/audit-management/questions-setup/add?duplicate=${q.id}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <rect x="2" y="2" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                      </Link>
                    </button>
                    <button
                      title="Approve"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.04)]"
                      onClick={() => handleApprove(q.id)}
                      disabled={q.status === "Active"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      title="Disable"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[rgba(255,255,255,0.04)]"
                      onClick={() => handleDisable(q.id)}
                      disabled={q.status === "Inactive"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M18.36 5.64l-12.72 12.72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                  <td className="p-3 align-top border-b border-border text-center">
                    <button
                      title="View Log"
                      className="h-8 w-8 inline-flex items-center justify-center rounded bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-[rgba(255,255,255,0.03)] dark:text-[#e6e6e6]"
                    >
                      <Link href={`/audit-management/questions-setup/add?id=${q.id}&view=log`}>
                        {q.logCount}
                      </Link>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
