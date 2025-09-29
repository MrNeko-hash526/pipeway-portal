import React from "react"
import Link from "@/components/link"

type Assignment = {
  id: number
  organization: string
  assignment: string
  assignedDate: string // ISO
  deadline: string // ISO
  status: "Open" | "Closed" | "Locked"
}

const SAMPLE: Assignment[] = [
  { id: 1, organization: "Leopold & Associates, PLLC", assignment: "2024 Physical Security Audit", assignedDate: "2024-06-18", deadline: "2024-08-27", status: "Open" },
  { id: 2, organization: "Heavner, Beyers & Mihlar, LLC", assignment: "2024 Physical Security Audit", assignedDate: "2024-06-18", deadline: "2024-08-19", status: "Locked" },
  { id: 3, organization: "Leopold & Associates, PLLC", assignment: "2024 New Firm Due Diligence", assignedDate: "2024-06-18", deadline: "2024-08-12", status: "Locked" },
  { id: 4, organization: "Heavner, Beyers & Mihlar, LLC", assignment: "2024 New Firm Due Diligence", assignedDate: "2024-06-18", deadline: "2024-08-19", status: "Locked" },
  { id: 5, organization: "Leopold & Associates, PLLC", assignment: "2024 Data Security and Privacy", assignedDate: "2024-06-18", deadline: "2024-08-28", status: "Open" },
  { id: 6, organization: "Heavner, Beyers & Mihlar, LLC", assignment: "2024 Data Security and Privacy", assignedDate: "2024-06-18", deadline: "2024-08-20", status: "Locked" },
  { id: 7, organization: "Consuegra & Duffy, P.L.", assignment: "2024 Reg-F Questionnaire", assignedDate: "2024-05-29", deadline: "2024-08-08", status: "Locked" },
  { id: 8, organization: "Stillman Law Office", assignment: "2024 Reg-F Questionnaire", assignedDate: "2024-05-29", deadline: "2024-08-16", status: "Open" },
  { id: 9, organization: "Breit Law Offices", assignment: "2024 Reg-F Questionnaire", assignedDate: "2024-05-29", deadline: "2024-07-17", status: "Open" },
]

export default function AssignmentsListPage() {
  const [items] = React.useState<Assignment[]>(() => [...SAMPLE])
  const [search, setSearch] = React.useState("")
  const [orgFilter, setOrgFilter] = React.useState<string>("All")
  const [statusFilter, setStatusFilter] = React.useState<string>("All")

  const [sort, setSort] = React.useState<{ key: string | null; dir: "asc" | "desc" | null }>({ key: null, dir: null })
  const toggleSort = (key: string) => {
    if (sort.key !== key) return setSort({ key, dir: "asc" })
    if (sort.dir === "asc") setSort({ key, dir: "desc" })
    return setSort({ key: null, dir: null })
  }

  const orgOptions = React.useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.organization)))], [items])

  const filteredAndSorted = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    let arr = items.filter(i => {
      if (orgFilter !== "All" && i.organization !== orgFilter) return false
      if (statusFilter !== "All" && i.status !== statusFilter) return false
      if (!q) return true
      return (
        i.organization.toLowerCase().includes(q) ||
        i.assignment.toLowerCase().includes(q) ||
        i.assignedDate.toLowerCase().includes(q) ||
        i.deadline.toLowerCase().includes(q)
      )
    })

    if (!sort.key || !sort.dir) return arr

    const dir = sort.dir === "asc" ? 1 : -1
    const key = sort.key

    arr = [...arr].sort((a: any, b: any) => {
      if (key === "assignedDate" || key === "deadline") {
        const da = new Date(a[key]).getTime()
        const db = new Date(b[key]).getTime()
        return (da - db) * dir
      }
      const va = String(a[key] ?? "").toLowerCase()
      const vb = String(b[key] ?? "").toLowerCase()
      return va.localeCompare(vb) * dir
    })

    return arr
  }, [items, search, orgFilter, statusFilter, sort])

  const columns = [
    { key: "idx", label: "#" },
    { key: "organization", label: "Organization", sortable: true },
    { key: "assignment", label: "Assignment", sortable: true },
    { key: "assignedDate", label: "Assigned Date", sortable: true },
    { key: "deadline", label: "Deadline", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "action", label: "Action" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-4 bg-white dark:bg-[rgb(33,33,36)] border border-border rounded">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">List of Assignments</h2>
          <div>
            <Link href="/audit-management/create-assignments" className="inline-flex items-center gap-2 h-10 px-4 bg-sky-600 text-white rounded hover:bg-sky-700">
              Create Assignment
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6 md:col-span-4">
              <label className="text-sm block mb-1">Search:</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6]" />
            </div>
            <div className="col-span-3 md:col-span-2">
              <label className="text-sm block mb-1">Organization:</label>
              <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className="w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6]">
                {orgOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="col-span-3 md:col-span-2">
              <label className="text-sm block mb-1">Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6]">
                <option>All</option>
                <option>Open</option>
                <option>Locked</option>
                <option>Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[rgb(33,33,36)] border border-border rounded overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-50 dark:bg-[rgba(255,255,255,0.03)]">
            <tr>
              {columns.map(col => {
                const isSorted = sort.key === col.key && !!sort.dir
                const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : ""
                return (
                  <th key={col.key} className={`p-3 text-left border-b border-border ${col.sortable ? "cursor-pointer select-none" : ""}`} onClick={() => col.sortable && toggleSort(col.key)}>
                    <div className="inline-flex items-center gap-2">
                      <span>{col.label}</span>
                      {col.sortable && <span className="text-xs text-slate-400">{arrow}</span>}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 dark:text-[#e6e6e6]">
                  No assignments found.
                </td>
              </tr>
            )}

            {filteredAndSorted.map((r, idx) => (
              <tr key={r.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-[rgba(255,255,255,0.02)] dark:even:bg-transparent">
                <td className="p-3 border-b border-border align-top">{idx + 1}</td>
                <td className="p-3 border-b border-border align-top">{r.organization}</td>
                <td className="p-3 border-b border-border align-top">{r.assignment}</td>
                <td className="p-3 border-b border-border align-top">{new Date(r.assignedDate).toLocaleDateString()}</td>
                <td className="p-3 border-b border-border align-top">{new Date(r.deadline).toLocaleDateString()}</td>
                <td className="p-3 border-b border-border align-top">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${r.status === "Open" ? "bg-emerald-100 text-emerald-800" : r.status === "Locked" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700 dark:bg-[rgba(255,255,255,0.03)] dark:text-[#e6e6e6]"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 border-b border-border align-top">
                  <div className="flex items-center gap-2">
                    <Link href={`/audit-management/create-assignments?editId=${r.id}`} className="text-amber-600 hover:underline">
                      Edit
                    </Link>
                    <Link href={`/audit-management/view-assignment?viewId=${r.id}`} className="text-sky-600 hover:underline">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
