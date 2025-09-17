"use client"

import React from "react"
import Link from "@/components/link"

export default function AddGroupPage() {
  const [groupName, setGroupName] = React.useState("")
  const [valueInput, setValueInput] = React.useState("")
  const [values, setValues] = React.useState<string[]>([])
  const [errors, setErrors] = React.useState<{ groupName?: string; valueInput?: string; values?: string }>({})
  const [isSaving, setIsSaving] = React.useState(false)

  // load for edit if id present (optional)
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) return
    try {
      const raw = localStorage.getItem("userGroups")
      const groups = raw ? JSON.parse(raw) : []
      const found = groups.find((g: any) => String(g.id) === String(id))
      if (found) {
        setGroupName(found.name ?? "")
        setValues(found.values ? (Array.isArray(found.values) ? found.values : String(found.values).split(",").map((s:string)=>s.trim())) : [])
      }
    } catch {
      // ignore
    }
  }, [])

  const resetErrors = () => setErrors({})

  const addValue = () => {
    const v = String(valueInput ?? "").trim()
    if (!v) {
      setErrors(prev => ({ ...prev, valueInput: "Enter a value" }))
      return
    }
    if (v.length < 2) {
      setErrors(prev => ({ ...prev, valueInput: "Min 2 characters" }))
      return
    }
    if (v.length > 20) {
      setErrors(prev => ({ ...prev, valueInput: "Max 20 characters" }))
      return
    }
    if (values.includes(v)) {
      setErrors(prev => ({ ...prev, valueInput: "Duplicate value" }))
      return
    }
    setValues(prev => [...prev, v])
    setValueInput("")
    setErrors(prev => ({ ...prev, valueInput: undefined, values: undefined }))
  }

  const removeValue = (idx: number) => {
    setValues(prev => prev.filter((_, i) => i !== idx))
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addValue()
    }
  }

  const canSave = React.useMemo(() => {
    return groupName.trim().length >= 2 && values.length > 0 && !errors.valueInput
  }, [groupName, values, errors.valueInput])

  const handleSave = async () => {
    resetErrors()
    const name = String(groupName ?? "").trim()
    if (!name) {
      setErrors(prev => ({ ...prev, groupName: "Group name is required" }))
      return
    }
    if (name.length < 2) {
      setErrors(prev => ({ ...prev, groupName: "Min 2 characters" }))
      return
    }

    if (values.length === 0) {
      setErrors(prev => ({ ...prev, values: "Add at least one group value" }))
      return
    }

    setIsSaving(true)
    try {
      const raw = localStorage.getItem("userGroups")
      const groups = raw ? JSON.parse(raw) : []
      const params = new URLSearchParams(window.location.search)
      const idParam = params.get("id")

      if (idParam) {
        // edit existing
        const updated = groups.map((g: any) =>
          String(g.id) === String(idParam) ? { ...g, name, values } : g
        )
        localStorage.setItem("userGroups", JSON.stringify(updated))
      } else {
        const newGroup = { id: Date.now(), name, values }
        groups.unshift(newGroup)
        localStorage.setItem("userGroups", JSON.stringify(groups))
      }
      // navigate back to list
      window.location.href = "/setup/user-groups-setup"
    } catch (err) {
      console.error(err)
      setErrors(prev => ({ ...prev, values: "Save failed" }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Add Group</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create a group and its allowed values (shown as tags).</p>
        </div>
        <Link href="/setup/user-groups-setup" className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md">Back</Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
        <div className="mb-6 grid grid-cols-1 gap-4 items-start">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Group Name <span className="text-rose-600">*</span>
            </label>
            <input
              value={groupName}
              onChange={e => { setGroupName(e.target.value); setErrors(prev => ({ ...prev, groupName: undefined })) }}
              className={`w-full border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${errors.groupName ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-600"}`}
              placeholder="Class Type"
              aria-invalid={!!errors.groupName}
            />
            {errors.groupName ? (
              <div className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.groupName}</div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">Example: Class Type, Department</div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Group Values <span className="text-xs text-slate-500 ml-1">(Min 2, Max 20 chars each)</span>
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {values.map((v, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-1 rounded shadow-sm transform transition-transform hover:scale-105"
              >
                <span className="text-sm">{v}</span>
                <button
                  type="button"
                  onClick={() => removeValue(i)}
                  className="text-sm text-red-600 dark:text-red-400 bg-white/40 dark:bg-black/20 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Remove value"
                  aria-label={`Remove ${v}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              value={valueInput}
              onChange={e => { setValueInput(e.target.value); setErrors(prev => ({ ...prev, valueInput: undefined })) }}
              onKeyDown={handleKey}
              className={`flex-1 border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors ${errors.valueInput ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-600"}`}
              placeholder="Enter value"
              aria-label="Enter group value"
            />
            <button
              type="button"
              onClick={addValue}
              className="w-10 h-10 inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white rounded transition-shadow shadow"
              aria-label="Add value"
            >
              +
            </button>
          </div>

          {errors.valueInput && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.valueInput}</div>}
          {errors.values && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.values}</div>}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Tip: Press Enter to add a value. Click the + button to add.
          </div>

          <div className="flex items-center gap-3">
            <Link href="/setup/user-groups-setup" className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200">Cancel</Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className={`px-4 py-2 rounded-md text-white transition-colors ${canSave && !isSaving ? "bg-sky-600 hover:bg-sky-700" : "bg-slate-300 dark:bg-slate-600 cursor-not-allowed"}`}
              aria-disabled={!canSave || isSaving}
            >
              {isSaving ? "Saving…" : "Save Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}