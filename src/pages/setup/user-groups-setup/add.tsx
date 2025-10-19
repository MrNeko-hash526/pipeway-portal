"use client"

import React from "react"
import Link from "@/components/link"
import * as yup from "yup"

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

const groupSchema = yup
  .object()
  .strict(true)
  .shape({
    groupName: yup.string().trim().min(2, "Min 2 characters").required("Group name is required"),
    values: yup
      .array()
      .of(yup.string().trim().min(2, "Min 2 characters").max(20, "Max 20 characters"))
      .min(1, "Add at least one group value"),
  })

type Toast = {
  id: string
  type: "success" | "error" | "info"
  title: string
  message: string
}

export default function AddGroupPage() {
  const [groupName, setGroupName] = React.useState("")
  const [valueInput, setValueInput] = React.useState("")
  const [values, setValues] = React.useState<string[]>([])
  const [errors, setErrors] = React.useState<{ groupName?: string; valueInput?: string; values?: string }>({})
  const [isSaving, setIsSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [editId, setEditId] = React.useState<string | null>(null)
  const [isEdit, setIsEdit] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  // Toast system
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Check for edit mode and load data
  React.useEffect(() => {
    let isMounted = true
    
    const checkEditMode = () => {
      if (typeof window === 'undefined') return
      
      const params = new URLSearchParams(window.location.search)
      const idParam = params.get("id")
      
      if (idParam && isMounted) {
        setEditId(idParam)
        setIsEdit(true)
        loadGroupData(idParam)
      } else if (isMounted) {
        setLoading(false)
      }
    }
    
    checkEditMode()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Load group data for editing
  const loadGroupData = async (id: string) => {
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/setup/user-group/${id}`
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const response = await res.json()
      const groupData = response.data
      
      // Map backend fields to form state
      setGroupName(groupData.group_name || '')
      setValues(Array.isArray(groupData.group_values) ? groupData.group_values : [])
      
      addToast({
        type: "success",
        title: "Loaded",
        message: "Group data loaded for editing."
      })
    } catch (err: any) {
      console.error('Failed to load group:', err)
      addToast({
        type: "error",
        title: "Load failed",
        message: err.message || "Failed to load group data"
      })
    } finally {
      setLoading(false)
    }
  }

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
    
    // Check for duplicates (case-insensitive)
    const existingLower = values.map(val => val.toLowerCase())
    if (existingLower.includes(v.toLowerCase())) {
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
    if (isSaving) return
    resetErrors()
    
    // Validate form
    try {
      await groupSchema.validate({ groupName, values }, { abortEarly: false })
    } catch (err: any) {
      const next: { groupName?: string; values?: string } = {}
      if (err.inner && Array.isArray(err.inner)) {
        err.inner.forEach((violation: any) => {
          if (!violation.path) return
          if (violation.path.startsWith("values")) next.values = violation.message
          else if (violation.path === "groupName") next.groupName = violation.message
        })
      } else if (err.path) {
        if (err.path === "groupName") next.groupName = err.message
        else if (err.path.startsWith("values")) next.values = err.message
      }
      setErrors(next)
      return
    }

    setIsSaving(true)
    
    try {
      // Prepare payload for backend
      const payload = {
        groupName: groupName.trim(),
        groupValues: values,
        status: 'Active'
      }

      console.log('📤 Submitting payload:', payload)

      const url = isEdit 
        ? `${API_BASE.replace(/\/$/, '')}/api/setup/user-group/${editId}`
        : `${API_BASE.replace(/\/$/, '')}/api/setup/user-group`
      
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()

      if (!res.ok) {
        console.error('❌ API Error:', responseData)
        const errorMessage = responseData.errors 
          ? responseData.errors.map((e: any) => e.msg).join(', ')
          : responseData.error || responseData.message || `HTTP ${res.status}`
        throw new Error(errorMessage)
      }

      console.log('✅ API Success:', responseData)

      addToast({
        type: "success",
        title: "Success!",
        message: isEdit ? "Group updated successfully." : "Group created successfully."
      })
      
      setTimeout(() => {
        window.location.href = "/setup/user-groups-setup"
      }, 1500)
    } catch (err: any) {
      console.error("❌ Submit error:", err)
      addToast({
        type: "error",
        title: "Failed to save",
        message: err?.message || "An unknown error occurred"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-300">Loading group data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {isEdit ? "Edit Group" : "Add Group"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? "Update the group and its allowed values." : "Create a group and its allowed values (shown as tags)."}
          </p>
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
              className={`px-4 py-2 rounded-md text-white transition-colors ${!canSave || isSaving ? "bg-slate-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"}`}
            >
              {isSaving ? "Saving…" : (isEdit ? "Update Group" : "Save Group")}
            </button>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg border ${
                toast.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : toast.type === "error"
                  ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${
                      toast.type === "success"
                        ? "text-emerald-900 dark:text-emerald-100"
                        : toast.type === "error"
                        ? "text-rose-900 dark:text-rose-100"
                        : "text-blue-900 dark:text-blue-100"
                    }`}
                  >
                    {toast.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      toast.type === "success"
                        ? "text-emerald-700 dark:text-emerald-200"
                        : toast.type === "error"
                        ? "text-rose-700 dark:text-rose-200"
                        : "text-blue-700 dark:text-blue-200"
                    }`}
                  >
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}