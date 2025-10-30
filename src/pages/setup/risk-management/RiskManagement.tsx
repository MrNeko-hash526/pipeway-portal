import React, { useEffect, useMemo, useState } from "react"
import { Pencil, Trash2, PlusCircle, XCircle, DownloadCloud, RotateCcw, RefreshCw } from "lucide-react"
import * as yup from "yup"

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

type Row = {
  id: string
  criteria_id: number
  criteria: string
  option: string
  level: number
  exception: string
  active: boolean
  deleted?: boolean
}

type Criteria = {
  id: number
  name: string
  status: string
  deleted?: boolean
}

type LevelOption = {
  id: number
  value: number
  label: string
  range?: { min: number; max: number }
  deleted?: boolean
}

type Toast = {
  id: string
  message: string
  type?: "info" | "confirm" | "success" | "error"
  targetId?: string
}

const rrmSchema = yup.object().strict(true).shape({
  criteria_id: yup.number().min(1, "Criteria is required").required("Criteria is required"),
  rrm_option: yup.string().required("RRM Option is required"),
  rrm_level: yup.number().min(1, "Invalid level").max(99, "Invalid level").required("RRM Level is required"),
  rrm_exception: yup.string().required("Exception By is required"),
})

export default function RiskManagement() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  // form
  const [criteriaId, setCriteriaId] = useState<number>(0)
  const [option, setOption] = useState<string>("")
  const [level, setLevel] = useState<number>(1)
  const [exceptionBy, setExceptionBy] = useState<string>("")
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // search / filter
  const [search, setSearch] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "deleted">("all")
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false)

  // criteria / level option stores
  const [criteriaOptions, setCriteriaOptions] = useState<Criteria[]>([])
  const [showAddCriteria, setShowAddCriteria] = useState(false)
  const [newCriteria, setNewCriteria] = useState("")
  const [criteriaLoading, setCriteriaLoading] = useState(false)

  const [levelOptions, setLevelOptions] = useState<LevelOption[]>([])
  const [showAddLevel, setShowAddLevel] = useState(false)
  const [newLevelValue, setNewLevelValue] = useState<number | "">("")
  const [newLevelLabel, setNewLevelLabel] = useState("")
  const [levelsLoading, setLevelsLoading] = useState(false)

  // range inputs for Low/Medium/High
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

  // 🔥 NEW: Loading states for individual operations
  const [restoring, setRestoring] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<Set<string>>(new Set())

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

  // Load data from backend
  useEffect(() => {
    loadData()
  }, [includeDeleted, statusFilter]) // <-- reload when status filter changes

  // 🔥 UPDATED: Better error handling and loading states
  const loadData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        loadRiskManagement(),
        loadCriteria(),
        loadLevels()
      ])
      
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        console.error('Some data failed to load:', failures)
        pushToast(`${failures.length} data source(s) failed to load`, { type: "error" })
      } else {
        pushToast("Data loaded successfully", { type: "success" })
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      pushToast("Failed to load data", { type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const buildApiStatus = () => {
    // map UI statusFilter to API "status" param and includeDeleted flag
    // when user selects "deleted" we ask for includeDeleted=true and status=All
    if (statusFilter === "all") return { status: 'All', includeDeletedFlag: includeDeleted }
    if (statusFilter === "active") return { status: 'Active', includeDeletedFlag: includeDeleted }
    if (statusFilter === "inactive") return { status: 'Inactive', includeDeletedFlag: includeDeleted }
    if (statusFilter === "deleted") return { status: 'All', includeDeletedFlag: true }
    return { status: 'Active', includeDeletedFlag: includeDeleted }
  }

  const loadRiskManagement = async () => {
    try {
      const { status, includeDeletedFlag } = buildApiStatus()
      const url = `${API_BASE}/api/setup/risk-management?limit=1000&status=${encodeURIComponent(status)}${includeDeletedFlag ? '&includeDeleted=true' : ''}`
      console.log('🔍 Loading risk management from:', url) // Debug log
      
      const res = await fetch(url)
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Risk management API error:', res.status, errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      console.log('📋 Risk management response:', data)
      
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((item: any) => ({
          id: String(item.id),
          criteria_id: item.criteria_id,
          criteria: item.criteria || 'Unknown Criteria',
          option: item.option || item.rrm_option || '',
          level: item.level || item.rrm_level || 0,
          exception: item.exception || item.rrm_exception || '',
          active: item.status === 'Active',
          deleted: item.deleted === 1 || item.deleted === true
        }))
        console.log('✅ Mapped rows:', mapped)
        setRows(mapped)
      } else {
        console.warn('⚠️ Unexpected response format:', data)
        setRows([])
      }
    } catch (err) {
      console.error('❌ Failed to load risk management:', err)
      throw err
    }
  }

  const loadCriteria = async () => {
    try {
      const { status, includeDeletedFlag } = buildApiStatus()
      const url = `${API_BASE}/api/setup/rrm-criteria?limit=1000&status=${encodeURIComponent(status)}${includeDeletedFlag ? '&includeDeleted=true' : ''}`
      console.log('🔍 Loading criteria from:', url)
      
      const res = await fetch(url)
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Criteria API error:', res.status, errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      console.log('📋 Criteria response:', data)
      
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((item: any) => ({
          ...item,
          deleted: item.deleted === 1 || item.deleted === true
        }))
        
        // 🔥 UPDATED: Show all criteria in modal but only active ones in dropdown
        setCriteriaOptions(mapped)
      } else {
        console.warn('⚠️ Unexpected criteria response format:', data)
        setCriteriaOptions([])
      }
    } catch (err) {
      console.error('❌ Failed to load criteria:', err)
      throw err
    }
  }

  const loadLevels = async () => {
    try {
      const { status, includeDeletedFlag } = buildApiStatus()
      const url = `${API_BASE}/api/setup/rrm-levels?limit=1000&status=${encodeURIComponent(status)}${includeDeletedFlag ? '&includeDeleted=true' : ''}`
      console.log('🔍 Loading levels from:', url)
      
      const res = await fetch(url)
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Levels API error:', res.status, errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      console.log('📋 Levels response:', data)
      
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((item: any) => ({
          id: item.id,
          value: item.level_value,
          label: item.level_label || `${item.level_value}`,
          range: item.range_min && item.range_max ? { min: item.range_min, max: item.range_max } : undefined,
          deleted: item.deleted === 1 || item.deleted === true
        }))
        console.log('✅ Mapped levels:', mapped)
        
        // 🔥 UPDATED: Show all levels in modal but only active ones in dropdown
        setLevelOptions(mapped)
      } else {
        console.warn('⚠️ Unexpected levels response format:', data)
        setLevelOptions([])
      }
    } catch (err) {
      console.error('❌ Failed to load levels:', err)
      throw err
    }
  }

  // filtering + sorting - Updated to handle deleted items
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      // Filter by status
      if (statusFilter === "active" && (!r.active || r.deleted)) return false
      if (statusFilter === "inactive" && (r.active || r.deleted)) return false
      if (statusFilter === "deleted" && !r.deleted) return false
      if (statusFilter === "all" && r.deleted && !includeDeleted) return false
      
      // Filter by search term
      if (!q) return true
      return r.criteria.toLowerCase().includes(q) || r.option.toLowerCase().includes(q) || r.exception.toLowerCase().includes(q)
    })
  }, [rows, search, statusFilter, includeDeleted])

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
    setCriteriaId(0)
    setOption("")
    setLevel(1)
    setExceptionBy("")
    setEditingId(null)
    setFormErrors({})
  }

  async function onAddOrSave(e?: React.FormEvent) {
    e?.preventDefault()
    if (saving) return
    
    setFormErrors({})
    try {
      const payload = { 
        criteria_id: criteriaId, 
        rrm_option: option,
        rrm_level: level,
        rrm_exception: exceptionBy 
      }
      await rrmSchema.validate(payload, { abortEarly: false })
      
      setSaving(true)
      
      if (editingId) {
        // Update existing entry
        const res = await fetch(`${API_BASE}/api/setup/risk-management/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, status: 'Active' })
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errs: Record<string, string> = {}
            errorData.errors.forEach((err: any) => {
              if (err.path || err.param) errs[err.path || err.param] = err.msg || err.message
            })
            setFormErrors(errs)
            return
          }
          throw new Error(errorData.error || `HTTP ${res.status}`)
        }
        
        await loadRiskManagement()
        pushToast("RRM entry updated successfully", { type: "success" })
      } else {
        // Create new entry
        const res = await fetch(`${API_BASE}/api/setup/risk-management`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, status: 'Active' })
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errs: Record<string, string> = {}
            errorData.errors.forEach((err: any) => {
              if (err.path || err.param) errs[err.path || err.param] = err.msg || err.message
            })
            setFormErrors(errs)
            return
          }
          throw new Error(errorData.error || `HTTP ${res.status}`)
        }
        
        await loadRiskManagement()
        pushToast("RRM entry created successfully", { type: "success" })
      }
      
      resetForm()
      setShowForm(false)
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const errs: Record<string, string> = {}
        err.inner.forEach((e) => {
          if (e.path) errs[e.path] = e.message
        })
        setFormErrors(errs)
      } else {
        pushToast(err?.message || "Failed to save", { type: "error" })
      }
    } finally {
      setSaving(false)
    }
  }

  function onEdit(id: string) {
    const r = rows.find((x) => x.id === id)
    if (!r || r.deleted) return
    setEditingId(id)
    setCriteriaId(r.criteria_id)
    setOption(r.option)
    setLevel(r.level)
    setExceptionBy(r.exception)
    setShowForm(true)
    setFormErrors({})
  }

  // 🔥 UPDATED: Better delete flow with loading states
  function requestDelete(id: string) {
    const r = rows.find((x) => x.id === id)
    if (!r || r.deleted) {
      console.log('🎯 Frontend requesting delete for ID:', id)
      console.log('📋 Found record:', r)
      pushToast("Record not found or already deleted", { type: "error" })
      return
    }
    
    pushToast(`Soft delete "${r.criteria}"? (Can be restored later)`, { type: "confirm", targetId: id })
  }
  
  async function confirmDelete(toastId: string, rowId?: string) {
    if (!rowId) {
      removeToast(toastId)
      return
    }
    
    // Add to deleting set to show loading state
    setDeleting(prev => new Set(prev).add(rowId))
    
    try {
      console.log('🗑️ Deleting item with ID:', rowId)
      const res = await fetch(`${API_BASE}/api/setup/risk-management/${rowId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Delete API error:', errorData)
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      const responseData = await res.json()
      console.log('✅ Delete response:', responseData)
      
      await loadRiskManagement()
      pushToast("RRM entry soft deleted successfully", { type: "success" })
      if (editingId === rowId) resetForm()
    } catch (err: any) {
      console.error('❌ Delete error:', err)
      pushToast(err?.message || "Failed to delete", { type: "error" })
    } finally {
      // Remove from deleting set
      setDeleting(prev => {
        const newSet = new Set(prev)
        newSet.delete(rowId)
        return newSet
      })
    }
    
    removeToast(toastId)
  }
  
  function cancelDelete(toastId: string) {
    removeToast(toastId)
  }

  // 🔥 UPDATED: Better restore flow with loading states
  async function restoreItem(id: string) {
    setRestoring(prev => new Set(prev).add(id))
    
    try {
      console.log('🔄 Restoring item with ID:', id)
      const res = await fetch(`${API_BASE}/api/setup/risk-management/${id}/restore`, {
        method: 'PATCH'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Restore API error:', errorData)
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      const responseData = await res.json()
      console.log('✅ Restore response:', responseData)
      
      await loadRiskManagement()
      pushToast("RRM entry restored successfully", { type: "success" })
    } catch (err: any) {
      console.error('❌ Restore error:', err)
      pushToast(err?.message || "Failed to restore item", { type: "error" })
    } finally {
      setRestoring(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  async function toggleActive(id: string) {
    try {
      const row = rows.find(r => r.id === id)
      if (!row || row.deleted) return
      
      const res = await fetch(`${API_BASE}/api/setup/risk-management/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria_id: row.criteria_id,
          rrm_option: row.option,
          rrm_level: row.level,
          rrm_exception: row.exception,
          status: row.active ? 'Inactive' : 'Active'
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      await loadRiskManagement()
      pushToast(`Entry ${row.active ? 'deactivated' : 'activated'} successfully`, { type: "success" })
    } catch (err: any) {
      pushToast(err?.message || "Failed to update status", { type: "error" })
    }
  }

  function handleSort(col: keyof Row) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortBy(col)
      setSortDir("asc")
    }
  }

  // Add criteria
  const addCriteria = async (v: string) => {
    const trimmed = v.trim()
    if (!trimmed) return pushToast("Enter criteria", { type: "error" })
    
    setCriteriaLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/setup/rrm-criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, status: 'Active' })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      await loadCriteria()
      const newCriteriaObj = criteriaOptions.find(c => c.name === trimmed && !c.deleted)
      if (newCriteriaObj) setCriteriaId(newCriteriaObj.id)
      
      pushToast("Criteria added successfully", { type: "success" })
      setShowAddCriteria(false)
      setNewCriteria("")
    } catch (err: any) {
      pushToast(err?.message || "Failed to add criteria", { type: "error" })
    } finally {
      setCriteriaLoading(false)
    }
  }

  const editCriteria = (idx: number) => {
    const c = criteriaOptions[idx]
    if (!c) return
    setNewCriteria(c.name)
  }

  const removeCriteria = async (idx: number) => {
    const criteria = criteriaOptions[idx]
    if (!criteria) return
    
    pushToast("Criteria deletion not implemented yet", { type: "error" })
  }

  // Add level
  const addLevel = async (value: number, label: string) => {
    if (!value || !label.trim()) return pushToast("Enter level and label", { type: "error" })
    
    setLevelsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/setup/rrm-levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level_value: value,
          level_label: `${value} (${label.trim()})`,
          status: 'Active'
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }
      
      await loadLevels()
      setLevel(value)
      pushToast("Level added successfully", { type: "success" })
      setShowAddLevel(false)
      setNewLevelValue("")
      setNewLevelLabel("")
    } catch (err: any) {
      pushToast(err?.message || "Failed to add level", { type: "error" })
    } finally {
      setLevelsLoading(false)
    }
  }

  const saveLevelRanges = async () => {
    const { lowMin, lowMax, medMin, medMax, highMin, highMax } = rangeInputs

    if ([lowMin, lowMax, medMin, medMax, highMin, highMax].some((n) => typeof n !== "number" || Number.isNaN(n))) {
      return pushToast("Enter valid numeric ranges", { type: "error" })
    }
    if (lowMin > lowMax || medMin > medMax || highMin > highMax) {
      return pushToast("Range min must be <= max", { type: "error" })
    }
    if (lowMax >= medMin || medMax >= highMin) pushToast("Warning: ranges overlap or are contiguous", { type: "info" })

    try {
      const updates = [
        { value: 1, label: `1 (Low ${lowMin}-${lowMax})`, range: { min: lowMin, max: lowMax } },
        { value: 2, label: `2 (Medium ${medMin}-${medMax})`, range: { min: medMin, max: medMax } },
        { value: 3, label: `3 (High ${highMin}-${highMax})`, range: { min: highMin, max: highMax } },
      ]
      
      const others = levelOptions.filter((lo) => ![1, 2, 3].includes(lo.value))
      const newOnes: LevelOption[] = updates.map(u => ({
        id: levelOptions.find(lo => lo.value === u.value)?.id || 0,
        value: u.value,
        label: u.label,
        range: u.range,
        deleted: false
      }))
      setLevelOptions([...newOnes, ...others])
      setLevel(1)
      setShowAddLevel(false)
      pushToast("RRM level ranges saved successfully", { type: "success" })
    } catch (err: any) {
      pushToast(err?.message || "Failed to save ranges", { type: "error" })
    }
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

  // Export CSV - Updated to include deleted status
  const exportCSV = () => {
    if (!rows || rows.length === 0) {
      pushToast("No rows to export", { type: "error" })
      return
    }
    const headers = ["Criteria", "RRM Option", "RRM Level", "RRM Exception", "Status", "Deleted"]
    const lines = [
      headers.join(","),
      ...displayed.map((r) =>
        [
          `"${String(r.criteria).replace(/"/g, '""')}"`,
          `"${String(r.option).replace(/"/g, '""')}"`,
          r.level,
          `"${String(r.exception).replace(/"/g, '""')}"`,
          r.active ? "Active" : "Inactive",
          r.deleted ? "Yes" : "No",
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
    pushToast(`Exported ${displayed.length} row(s)`, { type: "success" })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full mb-4"></div>
          <div className="text-slate-600 dark:text-slate-300">Loading risk management data...</div>
        </div>
      </div>
    )
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
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Toggle for showing deleted items */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="rounded"
            />
            Show Deleted
          </label>

          <div className="flex items-center gap-2 ml-auto">
            {/* 🔥 NEW: Refresh button */}
            <button onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded border border-border bg-transparent hover:bg-muted/5 disabled:opacity-50" title="Refresh Data">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={() => { setShowForm((s) => !s); resetForm() }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-primary text-primary-foreground shadow-sm hover:shadow focus:outline-none">
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
                        value={criteriaId}
                        onChange={(e) => setCriteriaId(Number(e.target.value))}
                        className={`flex-1 h-10 px-3 rounded border ${formErrors.criteria_id ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100`}
                        disabled={saving}
                      >
                        <option value={0}>Select a Criteria</option>
                        {/* 🔥 UPDATED: Only show non-deleted criteria in dropdown */}
                        {criteriaOptions.filter(c => !c.deleted).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setNewCriteria("")
                          setShowAddCriteria(true)
                        }}
                        className="h-10 px-4 min-w-[150px] whitespace-nowrap rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                        disabled={saving}
                      >
                        Add RRM Criteria
                      </button>
                    </div>
                    {formErrors.criteria_id && <div className="text-rose-600 text-xs mt-1">{formErrors.criteria_id}</div>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-3/4 min-w-[560px]">
                    <label className="text-xs text-muted-foreground dark:text-slate-300 block mb-1">RRM Level</label>
                    <div className="flex items-center gap-3">
                      <select
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className={`flex-1 h-10 px-3 rounded border ${formErrors.rrm_level ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100`}
                        disabled={saving}
                      >
                        {/* 🔥 UPDATED: Only show non-deleted levels in dropdown */}
                        {levelOptions.filter(lo => !lo.deleted).map((lo) => <option key={lo.id} value={lo.value}>{lo.label}</option>)}
                      </select>

                      <button
                        type="button"
                        onClick={toggleAddLevelPanel}
                        className="h-10 px-4 min-w-[150px] whitespace-nowrap rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                        disabled={saving}
                      >
                        {showAddLevel ? "Close" : "Add RRM Level"}
                      </button>
                    </div>
                    {formErrors.rrm_level && <div className="text-rose-600 text-xs mt-1">{formErrors.rrm_level}</div>}
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
                      <button type="button" onClick={saveLevelRanges} className="h-10 px-4 rounded bg-primary text-primary-foreground" disabled={saving}>Save Ranges</button>
                      <button type="button" onClick={() => setShowAddLevel(false)} className="h-10 px-4 rounded border">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 h-10 py-0 px-4 rounded bg-primary text-primary-foreground disabled:opacity-60">
                    {saving ? "Saving..." : (editingId ? "Save" : "Add")}
                  </button>
                  <button type="button" onClick={resetForm} disabled={saving} className="inline-flex items-center justify-center gap-2 h-10 py-0 px-4 rounded border border-border bg-transparent text-sm disabled:opacity-60">Reset</button>
                </div>
              </div>

              <div className="w-1/2 min-w-[320px] flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground dark:text-slate-300">RRM Option</label>
                  <input value={option} onChange={(e) => setOption(e.target.value)} className={`w-full mt-1 px-3 py-2 rounded border ${formErrors.rrm_option ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400`} placeholder="Option (eg. Greater than $5,000,000)" disabled={saving} />
                  {formErrors.rrm_option && <div className="text-rose-600 text-xs mt-1">{formErrors.rrm_option}</div>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground dark:text-slate-300">Exception By</label>
                  <input value={exceptionBy} onChange={(e) => setExceptionBy(e.target.value)} className={`w-full mt-1 px-3 py-2 rounded border ${formErrors.rrm_exception ? "border-rose-400 dark:border-rose-400" : "border-border dark:border-slate-700"} bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400`} placeholder="Person/committee to approve exception" disabled={saving} />
                  {formErrors.rrm_exception && <div className="text-rose-600 text-xs mt-1">{formErrors.rrm_exception}</div>}
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
                <tr key={r.id} className={`text-sm border-t last:border-b-0 ${
                  r.deleted ? "bg-red-50 dark:bg-red-900/20" : 
                  idx % 2 === 0 ? "bg-transparent" : "bg-muted/5"
                } hover:bg-muted/10`}>
                  <td className="py-3 px-3 align-top">{idx + 1}</td>
                  <td className="py-3 px-3 align-top max-w-xs">
                    <div className={r.deleted ? "line-through text-gray-500" : ""}>
                      {r.criteria}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top max-w-lg">
                    <div className={r.deleted ? "line-through text-gray-500" : ""}>
                      {r.option}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className={r.deleted ? "line-through text-gray-500" : ""}>
                      {r.level}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className={r.deleted ? "line-through text-gray-500" : ""}>
                      {r.exception}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-center">
                    {r.deleted ? (
                      <span className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Deleted</span>
                    ) : (
                      <button onClick={() => toggleActive(r.id)} className={`px-3 py-1 rounded text-xs font-medium ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {r.active ? "Active" : "Inactive"}
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-3 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.deleted ? (
                        <button 
                          onClick={() => restoreItem(r.id)} 
                          disabled={restoring.has(r.id)}
                          title="Restore" 
                          className="inline-flex items-center gap-2 px-2 py-1 rounded border border-green-500 text-sm text-green-600 bg-transparent disabled:opacity-50"
                        >
                          <RotateCcw className={`h-4 w-4 ${restoring.has(r.id) ? 'animate-spin' : ''}`} />
                          {restoring.has(r.id) ? 'Restoring...' : ''}
                        </button>
                      ) : (
                        <>
                          <button onClick={() => onEdit(r.id)} title="Edit" className="inline-flex items-center gap-2 px-2 py-1 rounded border border-border text-sm bg-transparent">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => requestDelete(r.id)} 
                            disabled={deleting.has(r.id)}
                            title="Delete" 
                            className="inline-flex items-center gap-2 px-2 py-1 rounded border border-border text-sm text-rose-600 bg-transparent disabled:opacity-50"
                          >
                            <Trash2 className={`h-4 w-4 ${deleting.has(r.id) ? 'animate-spin' : ''}`} />
                            {deleting.has(r.id) ? 'Deleting...' : ''}
                          </button>
                        </>
                      )}
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

      {/* Criteria modal - keeping existing implementation with all criteria visible */}
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

            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-muted-foreground w-28 flex items-center">RRM Criteria: *</label>
              <input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="RRM Criteria"
                className="flex-1 h-10 px-3 rounded border border-border bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                disabled={criteriaLoading}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addCriteria(newCriteria)}
                  disabled={criteriaLoading}
                  className="h-10 py-0 px-4 rounded bg-emerald-500 text-white flex items-center gap-2 disabled:opacity-60"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5v14" /></svg>
                  {criteriaLoading ? "Adding..." : "Add RRM Criteria"}
                </button>

                <button
                  type="button"
                  onClick={() => setNewCriteria("")}
                  disabled={criteriaLoading}
                  className="h-10 py-0 px-4 rounded border bg-transparent text-sm disabled:opacity-60"
                >
                  Reset RRM Criteria
                </button>
              </div>
            </div>

            <div className="border-t border-border mb-4" />

            <div className="overflow-auto max-h-60">
              <table className="w-full table-auto text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr className="text-left">
                    <th className="py-2 px-3 w-12">#</th>
                    <th className="py-2 px-3">RRM Criteria</th>
                    <th className="py-2 px-3 w-24">Status</th>
                    <th className="py-2 px-3 w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 🔥 UPDATED: Show all criteria including deleted ones in modal */}
                  {criteriaOptions.map((c, i) => (
                    <tr key={c.id} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/5"} ${c.deleted ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
                      <td className="py-3 px-3 align-top">{i + 1}</td>
                      <td className="py-3 px-3 align-top">
                        <div className={c.deleted ? "line-through text-gray-500" : ""}>
                          {c.name}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        {c.deleted ? (
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">Deleted</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">{c.status}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          {!c.deleted && (
                            <>
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {criteriaOptions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">No criteria defined.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setShowAddCriteria(false)} className="h-10 px-4 rounded bg-rose-600 text-white">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`w-80 border shadow p-3 rounded ${
            t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
            t.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
            "bg-white dark:bg-slate-800"
          }`}>
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