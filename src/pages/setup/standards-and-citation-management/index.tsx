import React from "react"
import * as yup from "yup"

const initialCategories = ["Information Security", "Privacy", "Operations"]
const initialTitles = ["Policy", "Procedure", "Guideline"]
const initialCitations = ["ISO 27001:2013", "NIST SP 800-53", "HIPAA"]

// inline SVG caret used for custom select when a value is selected
const arrowSvg =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23343A40' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"

// local CSS to fully hide the native select caret across browsers
const noCaretCss = `
  .no-caret { appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: none; background-position: right 0.75rem center; background-repeat: no-repeat; padding-right: 0.75rem; }
  .no-caret::-ms-expand { display: none; }
  /* show custom caret only when focused or when element has a value (data-has-value="true") */
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
}: {
  type: "Category" | "Title" | "Citation" | null
  open: boolean
  onClose: () => void
  items: string[]
  setItems: React.Dispatch<React.SetStateAction<string[]>>
  setSelected: React.Dispatch<React.SetStateAction<string>>
}) {
  const [input, setInput] = React.useState("")
  const [active, setActive] = React.useState(true)

  React.useEffect(() => {
    if (open) {
      setInput("")
      setActive(true)
    }
  }, [open])

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (!items.includes(trimmed)) {
      setItems((s) => [trimmed, ...s])
    }
    setSelected(trimmed)
    onClose()
  }

  const handleReset = () => {
    setInput("")
    setActive(true)
  }

  if (!open || !type) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-slate-800 rounded shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Add {type}</h2>
        <div className="mb-4 grid grid-cols-3 items-center gap-4">
          <label className="text-sm font-medium col-span-1">{type}*</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="col-span-2 h-10 rounded border border-slate-300 px-3 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            placeholder={type}
          />
        </div>
        <div className="mb-6 grid grid-cols-3 items-center gap-4">
          <label className="text-sm font-medium col-span-1">Activation Status</label>
          <select
            className="col-span-2 h-10 rounded border border-slate-300 px-3 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            value={active ? "Active" : "Inactive"}
            onChange={(e) => setActive(e.target.value === "Active")}
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
                <tr key={idx} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700">
                  <td className="border border-slate-300 px-3 py-1">{idx + 1}</td>
                  <td className="border border-slate-300 px-3 py-1">{item}</td>
                  <td className="border border-slate-300 px-3 py-1 text-center cursor-pointer hover:text-blue-600">✎</td>
                  <td className="border border-slate-300 px-3 py-1 text-center">✅</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleAdd}
            className="px-5 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
          >
            Add {type}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
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
  const [categories, setCategories] = React.useState<string[]>(initialCategories)
  const [titles, setTitles] = React.useState<string[]>(initialTitles)
  const [citations, setCitations] = React.useState<string[]>(initialCitations)

  const [category, setCategory] = React.useState<string>("")
  const [title, setTitle] = React.useState<string>("")
  const [citation, setCitation] = React.useState<string>("")
  const [standardText, setStandardText] = React.useState<string>("")
  const maxChars = 1500

  const [modalType, setModalType] = React.useState<"Category" | "Title" | "Citation" | null>(null)

  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({})

  const resetForm = () => {
    setCategory("")
    setTitle("")
    setCitation("")
    setStandardText("")
    setErrors({})
  }

  const addStandard = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setErrors({})
    try {
      await schema.validate({ category, title, citation, standardText }, { abortEarly: false })
      console.log("Saved standard:", { category, title, citation, standardText })
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
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const addItemPrompt = (kind: "category" | "title" | "citation") => {
    if (kind === "category") setModalType("Category")
    if (kind === "title") setModalType("Title")
    if (kind === "citation") setModalType("Citation")
  }

  const remaining = Math.max(0, maxChars - standardText.length)

  return (
    <>
      <style>{noCaretCss}</style>
       <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Add Standard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Create or manage standards and citations in a simple, professional layout.
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

            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">Category*</label>
              <div className="flex items-center gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`flex-1 h-10 border rounded px-3 no-caret bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errors.category ? "border-rose-500" : ""}`}
                  data-has-value={category ? "true" : "false"}
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => addItemPrompt("category")}
                  className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white"
                >
                  Add Category
                </button>
              </div>
            </div>
            {errors.category && <div className="text-sm text-rose-600 mt-1">{errors.category}</div>}

            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">Title*</label>
              <div className="flex items-center gap-3">
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`flex-1 h-10 border rounded px-3 no-caret bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errors.title ? "border-rose-500" : ""}`}
                  data-has-value={title ? "true" : "false"}
                >
                  <option value="">Select a title...</option>
                  {titles.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => addItemPrompt("title")}
                  className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white"
                >
                  Add Title
                </button>
              </div>
            </div>
            {errors.title && <div className="text-sm text-rose-600 mt-1">{errors.title}</div>}

            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">Citation*</label>
              <div className="flex items-center gap-3">
                <select
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  className={`flex-1 h-10 border rounded px-3 no-caret bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errors.citation ? "border-rose-500" : ""}`}
                  data-has-value={citation ? "true" : "false"}
                >
                  <option value="">Select a citation...</option>
                  {citations.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => addItemPrompt("citation")}
                  className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white"
                >
                  Add Citation
                </button>
              </div>
            </div>
            {errors.citation && <div className="text-sm text-rose-600 mt-1">{errors.citation}</div>}

            <div className="grid grid-cols-2 gap-4 items-start">
              <label className="block text-sm text-slate-700 dark:text-slate-200 pt-2">Standard*</label>
              <div>
                <textarea
                  value={standardText}
                  onChange={(e) => setStandardText(e.target.value.slice(0, maxChars))}
                  rows={8}
                  className={`w-full border rounded px-3 py-3 min-h-[160px] bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errors.standardText ? "border-rose-500" : ""}`}
                  placeholder="Enter standard text..."
                />
                <div className="text-xs text-slate-500 dark:text-slate-300 mt-2">{remaining} Character(s) Remaining</div>
                {errors.standardText && <div className="text-sm text-rose-600 mt-2">{errors.standardText}</div>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="h-10 px-4 rounded bg-emerald-600 text-white shadow-sm"
              >
                Add Standard
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="h-10 px-4 rounded border bg-white dark:bg-transparent dark:border-slate-700 dark:text-slate-200"
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
      />

      <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        © 2025 CAM powered by Goolean Technologies NA LLC
      </footer>
    </div>
    </>
   )
}
