import React, { useEffect, useMemo, useState } from "react"
import { Pencil, Trash2, PlusCircle, XCircle, DownloadCloud } from "lucide-react"
import * as yup from "yup"

type Row = {
  id: string
  criteria: string
  option: string
  level: number
  exception: string
  active: boolean
}

type LevelOption = {
  value: number
  label: string
  range?: { min: number; max: number }
}

const SAMPLE: Row[] = [
  { id: "1", criteria: "Total Value of Exposure/Risk (volume of records exposed)", option: "Greater than $5,000,000", level: 3, exception: "Vendor Compliance Committee", active: true },
  { id: "2", criteria: "Total Value of Exposure/Risk (volume of records exposed)", option: "$500,001-$5,000,000", level: 2, exception: "President", active: true },
  { id: "3", criteria: "Total Value of Exposure/Risk (volume of records exposed)", option: "Less than $500,000", level: 1, exception: "Director of Operations", active: true },
  { id: "4", criteria: "Physical Safety of Employees/Guests & Vendors", option: "Risk High/Injury Potential High", level: 3, exception: "Oversight, Governance and Audit Committee", active: true },
]

const rrmSchema = yup.object().strict(true).shape({
  criteria: yup.string().required("Criteria is required").min(3, "Criteria is too short"),
  option: yup.string().required("RRM Option is required"),
  level: yup.number().min(1, "Invalid level").max(99, "Invalid level").required("RRM Level is required"),
  exception: yup.string().required("Exception By is required"),
})

type Toast = {
  id: string
  message: string
  type?: "info" | "confirm"
  targetId?: string
}

export default function RiskManagement() {
  const [rows, setRows] = useState<Row[]>(SAMPLE)

  // form
  const [criteria, setCriteria] = useState<string>("")
  const [option, setOption] = useState<string>("")
  const [level, setLevel] = useState<number>(1)
  const [exceptionBy, setExceptionBy] = useState<string>("")
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // search / filter
  const [search, setSearch] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // criteria / level option stores (can add)
  const [criteriaOptions, setCriteriaOptions] = useState<string[]>(() => Array.from(new Set(SAMPLE.map((s) => s.criteria))))
  const [showAddCriteria, setShowAddCriteria] = useState(false)
  const [newCriteria, setNewCriteria] = useState("")

  // build initial level options from SAMPLE (simulates DB-provided options)
  const defaultLevelLabel = (v: number) => {
    if (v === 1) return `${v} (Low)`
    if (v === 2) return `${v} (Medium)`
    if (v === 3) return `${v} (High)`
    return `${v} (Level)`
  }
  const initialLevels = Array.from(new Set(SAMPLE.map((s) => s.level))).sort((a, b) => a - b)
  const [levelOptions, setLevelOptions] = useState<LevelOption[]>(
    () => {
      // ensure we have at least 1..3 in options (common defaults), plus any sample levels
      const base = [1, 2, 3]
      const all = Array.from(new Set([...initialLevels, ...base])).sort((a, b) => a - b)
      return all.map((v) => ({ value: v, label: defaultLevelLabel(v) }))
    }
  )

  // show add-level and "ranges" inputs (Low/Medium/High)
  const [showAddLevel, setShowAddLevel] = useState(false)
  const [newLevelValue, setNewLevelValue] = useState<number | "">("")
  const [newLevelLabel, setNewLevelLabel] = useState("")

  // range inputs for Low/Medium/High (prefill from DB/sample)
  const [rangeInputs, setRangeInputs] = useState({
    lowMin: 0,
    lowMax: 6,
    medMin: 7,
    medMax: 12,
    highMin: 13,
    highMax: 18,
  })

  // sorting
  const [sortBy, setSortBy] = useState<keyof Row | "none">("none")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([])

  // auto-dismiss non-confirm toasts
  useEffect(() => {
    if (!toasts.length) return
    const timers = toasts
      .filter((t) => t.type !== "confirm")
      .map((t) =>
        setTimeout(() => setToasts((prev) => prev.filter((p) => p.id !== t.id)), 4000)
      )
    return () => timers.forEach(clearTimeout)
  }, [toasts])

  const pushToast = (message: string, opts?: { type?: Toast["type"]; targetId?: string }) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7)
    setToasts((s) => [{ id, message, type: opts?.type ?? "info", targetId: opts?.targetId }, ...s])
    return id
  }
  const removeToast = (id: string) => setToasts((s) => s.filter((t) => t.id !== id))

  // filtering + sorting
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter === "active" && !r.active) return false
      if (statusFilter === "inactive" && r.active) return false
      if (!q) return true
      return r.criteria.toLowerCase().includes(q) || r.option.toLowerCase().includes(q) || r.exception.toLowerCase().includes(q)
    })
  }, [rows, search, statusFilter])

  const displayed = useMemo(() => {
    const list = [...filtered]
    if (sortBy === "none") return list
    list.sort((a, b) => {
      const va = a[sortBy]
      const vb = b[sortBy]
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va
      if (typeof va === "boolean" && typeof vb === "boolean") return sortDir === "asc" ? Number(Number(vb) - Number(va)) : Number(Number(va) - Number(vb))
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortDir === "asc" ? -1 : 1
      if (sa > sb) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return list
  }, [filtered, sortBy, sortDir])

  function resetForm() {
    setCriteria("")
    setOption("")
    setLevel(1)
    setExceptionBy("")
    setEditingId(null)
    setFormErrors({})
  }

  async function onAddOrSave(e?: React.FormEvent) {
    e?.preventDefault()
    setFormErrors({})
    try {
      const payload = { criteria, option, level, exception: exceptionBy }
      await rrmSchema.validate(payload, { abortEarly: false })
      if (editingId) {
        setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, criteria, option, level, exception: exceptionBy } : r)))
        pushToast("RRM entry updated")
      } else {
        const id = String(Date.now())
        setRows((prev) => [{ id, criteria, option, level, exception: exceptionBy, active: true }, ...prev])
        pushToast("RRM entry added")
      }
      resetForm()
      setShowForm(false)
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errs: Record<string, string> = {}
        err.inner.forEach((e) => {
          if (e.path) errs[e.path] = e.message
        })
        setFormErrors(errs)
      } else {
        pushToast("Validation failed")
      }
    }
  }

  function onEdit(id: string) {
    const r = rows.find((x) => x.id === id)
    if (!r) return
    setEditingId(id)
    setCriteria(r.criteria)
    setOption(r.option)
    setLevel(r.level)
    setExceptionBy(r.exception)
    setShowForm(true)
    setFormErrors({})
  }

  // delete flow with confirm toast
  function requestDelete(id: string) {
    const r = rows.find((x) => x.id === id)
    pushToast(`Delete "${r ? r.criteria : "this entry"}"?`, { type: "confirm", targetId: id })
  }
  function confirmDelete(toastId: string, rowId?: string) {
    if (!rowId) {
      removeToast(toastId)
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== rowId))
    removeToast(toastId)
    pushToast("RRM entry deleted")
    if (editingId === rowId) resetForm()
  }
  function cancelDelete(toastId: string) {
    removeToast(toastId)
  }

  function toggleActive(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  function handleSort(col: keyof Row) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortBy(col)
      setSortDir("asc")
    }
  }

  // Add / edit / remove criteria handlers
  const addCriteria = (v: string) => {
    const trimmed = v.trim()
    if (!trimmed) return pushToast("Enter criteria")
    if (!criteriaOptions.includes(trimmed)) setCriteriaOptions((p) => [trimmed, ...p])
    setCriteria(trimmed)
    pushToast("Criteria added")
    setShowAddCriteria(false)
  }

  const editCriteria = (idx: number) => {
    const c = criteriaOptions[idx]
    if (!c) return
    setNewCriteria(c)
  }

  const removeCriteria = (idx: number) => {
    const removed = criteriaOptions[idx]
    setCriteriaOptions((p) => p.filter((_, i) => i !== idx))
    pushToast(`Removed criteria: ${removed}`)
  }

  // existing single-level add (keeps backwards compatibility)
  const addLevel = (value: number, label: string) => {
    if (!value || !label.trim()) return pushToast("Enter level and label")
    const labelText = `${value} (${label.trim()})`
    if (!levelOptions.some((lo) => lo.value === value)) setLevelOptions((p) => [{ value, label: labelText }, ...p])
    setLevel(value)
    pushToast("Level added")
    setShowAddLevel(false)
  }

  const saveLevelRanges = () => {
    const { lowMin, lowMax, medMin, medMax, highMin, highMax } = rangeInputs

    if ([lowMin, lowMax, medMin, medMax, highMin, highMax].some((n) => typeof n !== "number" || Number.isNaN(n))) {
      return pushToast("Enter valid numeric ranges")
    }
    if (lowMin > lowMax || medMin > medMax || highMin > highMax) {
      return pushToast("Range min must be <= max")
    }
    if (lowMax >= medMin || medMax >= highMin) pushToast("Warning: ranges overlap or are contiguous")

    const others = levelOptions.filter((lo) => ![1, 2, 3].includes(lo.value))
    const newOnes: LevelOption[] = [
      { value: 1, label: `1 (Low ${lowMin}-${lowMax})`, range: { min: lowMin, max: lowMax } },
      { value: 2, label: `2 (Medium ${medMin}-${medMax})`, range: { min: medMin, max: medMax } },
      { value: 3, label: `3 (High ${highMin}-${highMax})`, range: { min: highMin, max: highMax } },
    ]
    setLevelOptions([...newOnes, ...others])
    setLevel(1)
    setShowAddLevel(false)
    pushToast("RRM level ranges saved")
  }

  const toggleAddLevelPanel = () => {
    if (!showAddLevel) {
      const low = levelOptions.find((lo) => lo.value === 1)
      const med = levelOptions.find((lo) => lo.value === 2)
      const high = levelOptions.find((lo) => lo.value === 3)
      setRangeInputs({
        lowMin: low?.range?.min ?? rangeInputs.lowMin,
        lowMax: low?.range?.max ?? rangeInputs.lowMax,
        medMin: med?.range?.min ?? rangeInputs.medMin,
        medMax: med?.range?.max ?? rangeInputs.medMax,
        highMin: high?.range?.min ?? rangeInputs.highMin,
        highMax: high?.range?.max ?? rangeInputs.highMax,
      })
    }
    setShowAddLevel((v) => !v)
  }

  // Export CSV (works client-side)
  const exportCSV = () => {
    if (!rows || rows.length === 0) {
      pushToast("No rows to export")
      return
    }
    const headers = ["Criteria", "RRM Option", "RRM Level", "RRM Exception", "Status"]
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          `"${String(r.criteria).replace(/"/g, '""')}"`,
          `"${String(r.option).replace(/"/g, '""')}"`,
          r.level,
          `"${String(r.exception).replace(/"/g, '""')}"`,
          r.active ? "Active" : "Inactive",
        ].join(",")
      ),
    ]
    const csv = lines.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")
    a.download = `rrm-export-${ts}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    pushToast(`Exported ${rows.length} row(s)`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Risk Rating Matrix</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">Define criteria, options and approval exceptions for risk levels.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border rounded px-2 py-1">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search criteria, option or exception..." className="bg-transparent outline-none text-sm px-2 py-1 w-56" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-transparent text-sm px-2 py-1">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => { setShowForm((s) => !s); setEditingId(null) }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-primary text-primary-foreground shadow-sm hover:shadow focus:outline-none">
              <PlusCircle className="h-4 w-4" /> {showForm ? "Close Form" : "New RRM"}
            </button>

            <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-slate-200 to-slate-100 text-slate-800 shadow-sm hover:from-slate-300 transition-colors" title="Export CSV">
              <DownloadCloud className="w-4 h-4" /> <span className="text-sm">Export</span>
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {showForm && (
          <form onSubmit={onAddOrSave} className="bg-transparent rounded p-4">
            <div className="flex items-start justify-between mb-3 gap-4">
              <h2 className="text-sm font-medium text-foreground">{editingId ? "Edit RRM" : "Add RRM"}</h2>
              {editingId && (
                <button type="button" onClick={() => { resetForm(); setShowForm(false) }} className="text-sm text-muted-foreground flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Cancel
                </button>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3/4 min-w-[360px]">
                    <label className="text-xs text-muted-foreground dark:text-slate-300 block mb-1">Criteria</label>
                    <div className="flex items-center gap-3">
                      <select
                        value={criteria}
                        onChange={(e) => setCriteria(e.target.value)}
                        className={`flex-1 h-10 px-3 rounded border ${formErrors.criteria ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100`}
                      >
                        <option value="">Select a Criteria</option>
                        {criteriaOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setNewCriteria(criteria || criteriaOptions[0] || SAMPLE[0].criteria || "")
                          setShowAddCriteria(true)
                        }}
                        className="h-10 px-4 min-w-[150px] whitespace-nowrap rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                      >
                        Add RRM Criteria
                      </button>
                    </div>
                    {formErrors.criteria && <div className="text-rose-600 text-xs mt-1">{formErrors.criteria}</div>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-3/4 min-w-[560px]">
                    <label className="text-xs text-muted-foreground dark:text-slate-300 block mb-1">RRM Level</label>
                    <div className="flex items-center gap-3">
                      <select
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className={`flex-1 h-10 px-3 rounded border ${formErrors.level ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100`}
                      >
                        {levelOptions.map((lo) => <option key={lo.value} value={lo.value}>{lo.label}</option>)}
                      </select>

                      <button
                        type="button"
                        onClick={toggleAddLevelPanel}
                        className="h-10 px-4 min-w-[150px] whitespace-nowrap rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                      >
                        {showAddLevel ? "Close" : "Add RRM Level"}
                      </button>
                    </div>
                    {formErrors.level && <div className="text-rose-600 text-xs mt-1">{formErrors.level}</div>}
                  </div>
                </div>

                {showAddLevel && (
                  <div className="mt-2 space-y-2 border-t pt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-sm text-muted-foreground">Low</div>
                      <input type="number" value={rangeInputs.lowMin} onChange={(e) => setRangeInputs((p) => ({ ...p, lowMin: Number(e.target.value) }))} className="w-28 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm" />
                      <input type="number" value={rangeInputs.lowMax} onChange={(e) => setRangeInputs((p) => ({ ...p, lowMax: Number(e.target.value) }))} className="w-28 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm" />
                      <div className="text-sm text-muted-foreground">Range</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 text-sm text-muted-foreground">Medium</div>
                      <input type="number" value={rangeInputs.medMin} onChange={(e) => setRangeInputs((p) => ({ ...p, medMin: Number(e.target.value) }))} className="w-28 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm" />
                      <input type="number" value={rangeInputs.medMax} onChange={(e) => setRangeInputs((p) => ({ ...p, medMax: Number(e.target.value) }))} className="w-28 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm" />
                      <div className="text-sm text-muted-foreground">Range</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 text-sm text-muted-foreground">High</div>
                      <input type="number" value={rangeInputs.highMin} onChange={(e) => setRangeInputs((p) => ({ ...p, highMin: Number(e.target.value) }))} className="w-28 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm" />
                      <input type="number" value={rangeInputs.highMax} onChange={(e) => setRangeInputs((p) => ({ ...p, highMax: Number(e.target.value) }))} className="w-28 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm" />
                      <div className="text-sm text-muted-foreground">Range</div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={saveLevelRanges} className="h-10 px-4 rounded bg-primary text-primary-foreground">Save Ranges</button>
                      <button type="button" onClick={() => setShowAddLevel(false)} className="h-10 px-4 rounded border">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button type="submit" className="inline-flex items-center justify-center gap-2 h-10 py-0 px-4 rounded bg-primary text-primary-foreground">{editingId ? "Save" : "Add"}</button>
                  <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 h-10 py-0 px-4 rounded border border-border bg-transparent text-sm">Reset</button>
                </div>
              </div>

              <div className="w-1/2 min-w-[320px] flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground dark:text-slate-300">RRM Option</label>
                  <input value={option} onChange={(e) => setOption(e.target.value)} className={`w-full mt-1 px-3 py-2 rounded border ${formErrors.option ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400`} placeholder="Option (eg. Greater than $5,000,000)" />
                  {formErrors.option && <div className="text-rose-600 text-xs mt-1">{formErrors.option}</div>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground dark:text-slate-300">Exception By</label>
                  <input value={exceptionBy} onChange={(e) => setExceptionBy(e.target.value)} className={`w-full mt-1 px-3 py-2 rounded border ${formErrors.exception ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400`} placeholder="Person/committee to approve exception" />
                  {formErrors.exception && <div className="text-rose-600 text-xs mt-1">{formErrors.exception}</div>}
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1000px] table-auto">
            <thead className="bg-slate-50 text-slate-600 text-xs dark:bg-white dark:text-slate-900">
              <tr className="text-left">
                <th className="py-3 px-3 w-8">#</th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort("criteria")} className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                    <span className="flex-1 text-left">Criteria</span>
                    <span className="text-xs text-slate-400">{sortBy === "criteria" ? (sortDir === "asc" ? "▲" : "▼") : null}</span>
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort("option")} className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                    <span className="flex-1 text-left">RRM Option</span>
                    <span className="text-xs text-slate-400">{sortBy === "option" ? (sortDir === "asc" ? "▲" : "▼") : null}</span>
                  </button>
                </th>
                <th className="py-3 px-3 w-24">
                  <button onClick={() => handleSort("level")} className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                    <span className="flex-1 text-left">RRM Level</span>
                    <span className="text-xs text-slate-400">{sortBy === "level" ? (sortDir === "asc" ? "▲" : "▼") : null}</span>
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort("exception")} className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                    <span className="flex-1 text-left">RRM Exception</span>
                    <span className="text-xs text-slate-400">{sortBy === "exception" ? (sortDir === "asc" ? "▲" : "▼") : null}</span>
                  </button>
                </th>
                <th className="py-3 px-3 w-28 text-center">
                  <button onClick={() => handleSort("active")} className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                    <span className="flex-1 text-center">Status</span>
                    <span className="text-xs text-slate-400">{sortBy === "active" ? (sortDir === "asc" ? "▲" : "▼") : null}</span>
                  </button>
                </th>
                <th className="py-3 px-3 w-36 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayed.map((r, idx) => (
                <tr key={r.id} className={`text-sm border-t last:border-b-0 ${idx % 2 === 0 ? "bg-transparent" : "bg-muted/5"} hover:bg-muted/10`}>
                  <td className="py-3 px-3 align-top">{idx + 1}</td>
                  <td className="py-3 px-3 align-top max-w-xs">{r.criteria}</td>
                  <td className="py-3 px-3 align-top max-w-lg">{r.option}</td>
                  <td className="py-3 px-3 align-top">{r.level}</td>
                  <td className="py-3 px-3 align-top">{r.exception}</td>
                  <td className="py-3 px-3 align-top text-center">
                    <button onClick={() => toggleActive(r.id)} className={`px-3 py-1 rounded text-xs font-medium ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{r.active ? "Active" : "Inactive"}</button>
                  </td>
                  <td className="py-3 px-3 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(r.id)} title="Edit" className="inline-flex items-center gap-2 px-2 py-1 rounded border border-border text-sm bg-transparent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => requestDelete(r.id)} title="Delete" className="inline-flex items-center gap-2 px-2 py-1 rounded border border-border text-sm text-rose-600 bg-transparent"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {displayed.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No matching Risk Rating Matrix entries.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criteria modal */}
      {showAddCriteria && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rrm-criteria-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddCriteria(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded shadow-xl border border-border p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 id="rrm-criteria-title" className="text-lg font-semibold text-foreground">RRM Criteria</h3>
              <button aria-label="Close" onClick={() => setShowAddCriteria(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* top row: input + buttons (matches screenshot) */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-muted-foreground w-28 flex items-center">RRM Criteria: *</label>
              <input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="RRM Criteria"
                className="flex-1 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addCriteria(newCriteria)}
                  className="h-10 py-0 px-4 rounded bg-emerald-500 text-white flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5v14" /></svg>
                  Add RRM Criteria
                </button>

                <button
                  type="button"
                  onClick={() => setNewCriteria("")}
                  className="h-10 py-0 px-4 rounded border bg-transparent text-sm"
                >
                  Reset RRM Criteria
                </button>
              </div>
            </div>

            {/* divider */}
            <div className="border-t border-border mb-4" />

            {/* list table (matches screenshot: numbered list + action) */}
            <div className="overflow-auto max-h-60">
              <table className="w-full table-auto text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr className="text-left">
                    <th className="py-2 px-3 w-12">#</th>
                    <th className="py-2 px-3">RRM Criteria</th>
                    <th className="py-2 px-3 w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {criteriaOptions.map((c, i) => (
                    <tr key={c} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                      <td className="py-3 px-3 align-top">{i + 1}</td>
                      <td className="py-3 px-3 align-top">{c}</td>
                      <td className="py-3 px-3 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => { editCriteria(i); }}
                            title="Edit"
                            className="inline-flex items-center justify-center w-8 h-8 rounded border border-border bg-transparent text-sm"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCriteria(i)}
                            title="Delete"
                            className="inline-flex items-center justify-center w-8 h-8 rounded border border-border bg-transparent text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {criteriaOptions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-sm text-muted-foreground">No criteria defined.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* footer: close button (optional extra) */}
            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setShowAddCriteria(false)} className="h-10 px-4 rounded bg-rose-600 text-white">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className="w-80 bg-white dark:bg-slate-800 border shadow p-3 rounded">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-semibold text-sm">{t.message}</div>
              </div>
              <div className="ml-3 flex items-start gap-2">
                {t.type === "confirm" ? (
                  <>
                    <button onClick={() => confirmDelete(t.id, t.targetId)} className="px-3 py-1 text-sm bg-rose-600 text-white rounded">Delete</button>
                    <button onClick={() => cancelDelete(t.id)} className="px-3 py-1 text-sm border rounded">Cancel</button>
                  </>
                ) : (
                  <button onClick={() => removeToast(t.id)} className="px-2 py-1 text-sm border rounded">OK</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}