"use client"

import React from "react"
import * as yup from "yup"

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

type Lookup = { id: number; name: string; status?: string }

type Toast = {
  id: string
  type: "success" | "error" | "info"
  title: string
  message: string
}

// inline SVG caret used for custom select when a value is selected
const arrowSvg =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23343A40' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"

const noCaretCss = `
  .no-caret { appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: none; background-position: right 0.75rem center; background-repeat: no-repeat; padding-right: 0.75rem; }
  .no-caret::-ms-expand { display: none; }
  .no-caret:focus, .no-caret[data-has-value="true"] {
    background-image: url("${arrowSvg}");
    padding-right: 2.25rem;
  }
`

const schema = yup
  .object()
  .strict(true)
  .shape({
    category: yup.string().trim().required("Category is required"),
    title: yup.string().trim().required("Title is required"),
    citation: yup.string().trim().required("Citation is required"),
    standardText: yup
      .string()
      .trim()
      .required("Standard text is required")
      .min(10, "Standard must be at least 10 characters")
      .max(1500, "Standard cannot exceed 1500 characters"),
  })

function AddItemModal({
  type,
  open,
  onClose,
  items,
  setItems,
  setSelected,
  addToast,
}: {
  type: "Category" | "Title" | "Citation" | null
  open: boolean
  onClose: () => void
  items: Lookup[]
  setItems: React.Dispatch<React.SetStateAction<Lookup[]>>
  setSelected: React.Dispatch<React.SetStateAction<string>>
  addToast: (toast: Omit<Toast, "id">) => void
}) {
  const [input, setInput] = React.useState("")
  const [active, setActive] = React.useState(true)
  const [warning, setWarning] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setInput("")
      setActive(true)
      setWarning(null)
      setSaving(false)
    }
  }, [open])

  const endpointMap: Record<string, string> = {
    Category: "/api/setup/standard-categories",
    Title: "/api/setup/standard-titles",
    Citation: "/api/setup/standards-citations",
  }

  const handleAdd = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const exists = items.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) {
      setWarning(`${type} "${trimmed}" already exists.`)
      return
    }

    const endpoint = endpointMap[type as string]
    if (!endpoint) {
      setWarning("Unknown type")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, "")}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: trimmed, 
          status: active ? "Active" : "Inactive" 
        }),
      })
      
      const body = await res.json()
      if (!res.ok) {
        const msg = body?.message || body?.error || 
          (body?.errors && body.errors.map((e:any) => e.msg).join(", ")) || 
          `HTTP ${res.status}`
        setWarning(`Failed to add ${type?.toLowerCase()}: ${msg}`)
        addToast({
          type: "error",
          title: "Failed to add",
          message: `Could not add ${type?.toLowerCase()}: ${msg}`
        })
        setSaving(false)
        return
      }
      
      const created = body?.data
      if (!created || typeof created.id === "undefined") {
        const synthetic = { id: Date.now(), name: trimmed }
        setItems((prev) => [synthetic, ...prev])
        setSelected(String(synthetic.id))
      } else {
        const item: Lookup = { 
          id: Number(created.id), 
          name: String(created.name ?? trimmed) 
        }
        setItems((prev) => [item, ...prev])
        setSelected(String(item.id))
      }
      
      addToast({
        type: "success",
        title: "Success!",
        message: `${type} "${trimmed}" has been added successfully.`
      })
      
      onClose()
    } catch (err: any) {
      const errorMsg = `Network error: ${err?.message || String(err)}`
      setWarning(errorMsg)
      addToast({
        type: "error",
        title: "Network Error",
        message: errorMsg
      })
      setSaving(false)
    }
  }

  const handleReset = () => {
    setInput("")
    setActive(true)
    setWarning(null)
  }

  if (!open || !type) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-slate-800 rounded shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Add {type}</h2>

        {warning && (
          <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">
            {warning}
          </div>
        )}

        <div className="mb-4 grid grid-cols-3 items-center gap-4">
          <label className="text-sm font-medium col-span-1">{type}*</label>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setWarning(null)
            }}
            className="col-span-2 h-10 rounded border border-slate-300 px-3 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            placeholder={type}
            disabled={saving}
          />
        </div>

        <div className="mb-6 grid grid-cols-3 items-center gap-4">
          <label className="text-sm font-medium col-span-1">Activation Status</label>
          <select
            className="col-span-2 h-10 rounded border border-slate-300 px-3 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            value={active ? "Active" : "Inactive"}
            onChange={(e) => setActive(e.target.value === "Active")}
            disabled={saving}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="mb-4 max-h-60 overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="border border-slate-300 px-3 py-1 text-left">#</th>
                <th className="border border-slate-300 px-3 py-1 text-left">{type}</th>
                <th className="border border-slate-300 px-3 py-1">Action</th>
                <th className="border border-slate-300 px-3 py-1">Activation</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700"
                >
                  <td className="border border-slate-300 px-3 py-1">{idx + 1}</td>
                  <td className="border border-slate-300 px-3 py-1">{item.name}</td>
                  <td className="border border-slate-300 px-3 py-1 text-center cursor-pointer hover:text-blue-600">
                    ✎
                  </td>
                  <td className="border border-slate-300 px-3 py-1 text-center">
                    {item.status === 'Active' ? '✅' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-5 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : `Add ${type}`}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:opacity-60"
          >
            Reset {type}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400 transition dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StandardsPage() {
  const [categories, setCategories] = React.useState<Lookup[]>([])
  const [titles, setTitles] = React.useState<Lookup[]>([])
  const [citations, setCitations] = React.useState<Lookup[]>([])

  const [category, setCategory] = React.useState<string>("")
  const [title, setTitle] = React.useState<string>("")
  const [citation, setCitation] = React.useState<string>("")
  const [standardText, setStandardText] = React.useState<string>("")
  const maxChars = 1500

  const [modalType, setModalType] = React.useState<
    "Category" | "Title" | "Citation" | null
  >(null)

  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const remaining = Math.max(0, maxChars - standardText.length)

  // Toast system
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Load lookups on mount
  React.useEffect(() => {
    let mounted = true
    async function loadLookups() {
      try {
        const urls = [
          `${API_BASE.replace(/\/$/, "")}/api/setup/standard-categories?limit=1000&status=Active`,
          `${API_BASE.replace(/\/$/, "")}/api/setup/standard-titles?limit=1000&status=Active`,
          `${API_BASE.replace(/\/$/, "")}/api/setup/standards-citations?limit=1000&status=Active`,
        ]
        
        const [catsRes, titlesRes, citesRes] = await Promise.all(
          urls.map((u) => fetch(u))
        )
        
        if (!mounted) return
        
        const [catsB, titlesB, citesB] = await Promise.all([
          catsRes.json(),
          titlesRes.json(),
          citesRes.json(),
        ])
        
        if (catsB?.data && Array.isArray(catsB.data) && mounted) {
          setCategories(
            catsB.data.map((r: any) => ({
              id: Number(r.id),
              name: String(r.name),
              status: r.status || 'Active'
            }))
          )
        }
        
        if (titlesB?.data && Array.isArray(titlesB.data) && mounted) {
          setTitles(
            titlesB.data.map((r: any) => ({
              id: Number(r.id),
              name: String(r.name),
              status: r.status || 'Active'
            }))
          )
        }
        
        if (citesB?.data && Array.isArray(citesB.data) && mounted) {
          setCitations(
            citesB.data.map((r: any) => ({
              id: Number(r.id),
              name: String(r.name),
              status: r.status || 'Active'
            }))
          )
        }

        addToast({
          type: "success",
          title: "Data Loaded",
          message: "Standards lookup data loaded successfully."
        })
      } catch (err) {
        console.warn("Failed to load lookups:", err)
        addToast({
          type: "error",
          title: "Loading Failed",
          message: "Failed to load standards lookup data. Please refresh the page."
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    loadLookups()
    return () => {
      mounted = false
    }
  }, [])

  const resetForm = () => {
    setCategory("")
    setTitle("")
    setCitation("")
    setStandardText("")
    setErrors({})
  }

  const addStandard = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (saving) return
    
    setErrors({})
    try {
      await schema.validate(
        { category, title, citation, standardText },
        { abortEarly: false }
      )

      setSaving(true)

      // Send IDs to backend
      const payload = {
        category_id: parseInt(category, 10),
        title_id: parseInt(title, 10),
        citation_id: parseInt(citation, 10),
        standard_text: standardText,
        status: "Active",
      }

      console.log('📤 Submitting standard:', payload)

      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/setup/standards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const body = await res.json()
      if (!res.ok) {
        const msg = body?.message || body?.error || 
          (body?.errors && body.errors.map((e:any) => e.msg).join(", ")) || 
          "Failed to save"
        setErrors({ standardText: msg })
        addToast({
          type: "error",
          title: "Failed to Save",
          message: `Could not save standard: ${msg}`
        })
        setSaving(false)
        return
      }

      console.log("✅ Standard saved:", body?.data ?? payload)
      
      addToast({
        type: "success",
        title: "Standard Created!",
        message: "Your standard has been saved successfully."
      })
      
      resetForm()
    } catch (err: any) {
      const next: Partial<Record<string, string>> = {}
      if (err.inner && Array.isArray(err.inner)) {
        err.inner.forEach((violation: any) => {
          if (!violation.path) return
          next[violation.path] = violation.message
        })
      } else if (err.path) {
        next[err.path] = err.message
      }
      setErrors(next)
      
      addToast({
        type: "error",
        title: "Validation Error",
        message: "Please fix the highlighted fields and try again."
      })
      
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSaving(false)
    }
  }

  const addItemPrompt = (kind: "category" | "title" | "citation") => {
    if (kind === "category") setModalType("Category")
    if (kind === "title") setModalType("Title")
    if (kind === "citation") setModalType("Citation")
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-300">Loading standards data...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{noCaretCss}</style>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Add Standard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              Create or manage standards and citations in a simple, professional
              layout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => history.back()}
              className="h-10 px-4 text-sm rounded border bg-white hover:bg-slate-50 dark:bg-transparent dark:border-slate-700 dark:text-slate-200"
            >
              Back
            </button>
          </div>
        </header>

        <main className="grid grid-cols-12 gap-6">
          <section className="col-span-12 p-0">
            <form onSubmit={addStandard} className="space-y-6">
              {Object.keys(errors).length > 0 && (
                <div className="rounded-md bg-rose-50 text-rose-700 px-4 py-2 text-sm border border-rose-100">
                  Please fix the highlighted fields below.
                </div>
              )}

              {/* Category */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">
                  Category*
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`flex-1 h-10 border rounded px-3 no-caret bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${
                      errors.category ? "border-rose-500" : ""
                    }`}
                    data-has-value={category ? "true" : "false"}
                    disabled={saving}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => addItemPrompt("category")}
                    className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white hover:bg-sky-600 transition"
                    disabled={saving}
                  >
                    Add Category
                  </button>
                </div>
              </div>
              {errors.category && (
                <div className="text-sm text-rose-600 mt-1">
                  {errors.category}
                </div>
              )}

              {/* Title */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">
                  Title*
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`flex-1 h-10 border rounded px-3 no-caret bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${
                      errors.title ? "border-rose-500" : ""
                    }`}
                    data-has-value={title ? "true" : "false"}
                    disabled={saving}
                  >
                    <option value="">Select a title...</option>
                    {titles.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => addItemPrompt("title")}
                    className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white hover:bg-sky-600 transition"
                    disabled={saving}
                  >
                    Add Title
                  </button>
                </div>
              </div>
              {errors.title && (
                <div className="text-sm text-rose-600 mt-1">
                  {errors.title}
                </div>
              )}

              {/* Citation */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">
                  Citation*
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    className={`flex-1 h-10 border rounded px-3 no-caret bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${
                      errors.citation ? "border-rose-500" : ""
                    }`}
                    data-has-value={citation ? "true" : "false"}
                    disabled={saving}
                  >
                    <option value="">Select a citation...</option>
                    {citations.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => addItemPrompt("citation")}
                    className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white hover:bg-sky-600 transition"
                    disabled={saving}
                  >
                    Add Citation
                  </button>
                </div>
              </div>
              {errors.citation && (
                <div className="text-sm text-rose-600 mt-1">
                  {errors.citation}
                </div>
              )}

              {/* Standard */}
              <div className="grid grid-cols-2 gap-4 items-start">
                <label className="block text-sm text-slate-700 dark:text-slate-200 pt-2">
                  Standard*
                </label>
                <div>
                  <textarea
                    value={standardText}
                    onChange={(e) =>
                      setStandardText(e.target.value.slice(0, maxChars))
                    }
                    rows={8}
                    className={`w-full border rounded px-3 py-3 min-h-[160px] bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${
                      errors.standardText ? "border-rose-500" : ""
                    }`}
                    placeholder="Enter standard text..."
                    disabled={saving}
                  />
                  <div className="text-xs text-slate-500 dark:text-slate-300 mt-2">
                    {remaining} Character(s) Remaining
                  </div>
                  {errors.standardText && (
                    <div className="text-sm text-rose-600 mt-2">
                      {errors.standardText}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-4 rounded bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Add Standard"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="h-10 px-4 rounded border bg-white dark:bg-transparent dark:border-slate-700 dark:text-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
                >
                  Reset Standard
                </button>
              </div>
            </form>
          </section>
        </main>

        <AddItemModal
          type={modalType}
          open={modalType !== null}
          onClose={() => setModalType(null)}
          items={
            modalType === "Category"
              ? categories
              : modalType === "Title"
              ? titles
              : modalType === "Citation"
              ? citations
              : []
          }
          setItems={
            modalType === "Category"
              ? setCategories
              : modalType === "Title"
              ? setTitles
              : modalType === "Citation"
              ? setCitations
              : () => {}
          }
          setSelected={
            modalType === "Category"
              ? setCategory
              : modalType === "Title"
              ? setTitle
              : modalType === "Citation"
              ? setCitation
              : () => {}
          }
          addToast={addToast}
        />

        {/* Toast notifications */}
        {toasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`p-4 rounded-lg shadow-lg border transition-all duration-300 ${
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
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          © 2025 CAM powered by Goolean Technologies NA LLC
        </footer>
      </div>
    </>
  )
}
