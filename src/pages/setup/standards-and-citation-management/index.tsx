import React from "react"

const initialCategories = ["Information Security", "Privacy", "Operations"]
const initialTitles = ["Policy", "Procedure", "Guideline"]
const initialCitations = ["ISO 27001:2013", "NIST SP 800-53", "HIPAA"]

export default function StandardsPage() {
  const [categories, setCategories] = React.useState<string[]>(initialCategories)
  const [titles, setTitles] = React.useState<string[]>(initialTitles)
  const [citations, setCitations] = React.useState<string[]>(initialCitations)

  const [category, setCategory] = React.useState<string>("")
  const [title, setTitle] = React.useState<string>("")
  const [citation, setCitation] = React.useState<string>("")
  const [standardText, setStandardText] = React.useState<string>("")
  const maxChars = 1500

  const resetForm = () => {
    setCategory("")
    setTitle("")
    setCitation("")
    setStandardText("")
  }

  const addStandard = (e?: React.FormEvent) => {
    e?.preventDefault()
    // save logic here
    // eslint-disable-next-line no-console
    console.log("Saved standard:", { category, title, citation, standardText })
    resetForm()
  }

  const addItemPrompt = (kind: "category" | "title" | "citation") => {
    const label = kind === "category" ? "Category" : kind === "title" ? "Title" : "Citation"
    const val = window.prompt(`Add new ${label}`)
    if (!val) return
    const trimmed = val.trim()
    if (!trimmed) return
    if (kind === "category") setCategories((s) => [trimmed, ...s])
    if (kind === "title") setTitles((s) => [trimmed, ...s])
    if (kind === "citation") setCitations((s) => [trimmed, ...s])
    if (kind === "category") setCategory(trimmed)
    if (kind === "title") setTitle(trimmed)
    if (kind === "citation") setCitation(trimmed)
  }

  const remaining = Math.max(0, maxChars - standardText.length)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Add Standard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Create or manage standards and citations in a simple, professional layout.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => history.back()} className="h-10 px-4 text-sm rounded border bg-white hover:bg-slate-50 dark:bg-transparent dark:border-slate-700 dark:text-slate-200">Back</button>
          <button onClick={() => { /* optionally open list view */ }} className="h-10 px-4 text-sm rounded bg-sky-600 text-white shadow">View Standards</button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Form merged with page background (no card) */}
        <section className="col-span-12 p-0">
          <form onSubmit={addStandard} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">Category*</label>
              <div className="flex items-center gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 h-10 border rounded px-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => addItemPrompt("category")} className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white">Add Category</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">Title*</label>
              <div className="flex items-center gap-3">
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 h-10 border rounded px-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                >
                  <option value="">Select a title...</option>
                  {titles.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button type="button" onClick={() => addItemPrompt("title")} className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white">Add Title</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="text-sm text-slate-700 dark:text-slate-200 h-10 flex items-center">Citation*</label>
              <div className="flex items-center gap-3">
                <select
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  className="flex-1 h-10 border rounded px-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                >
                  <option value="">Select a citation...</option>
                  {citations.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => addItemPrompt("citation")} className="h-10 px-4 min-w-[140px] text-sm rounded bg-sky-500 text-white">Add Citation</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-start">
              <label className="block text-sm text-slate-700 dark:text-slate-200 pt-2">Standard*</label>
              <div>
                <textarea
                  value={standardText}
                  onChange={(e) => setStandardText(e.target.value.slice(0, maxChars))}
                  rows={8}
                  className="w-full border rounded px-3 py-3 min-h-[160px] bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  placeholder="Enter standard text..."
                />
                <div className="text-xs text-slate-500 dark:text-slate-300 mt-2">{remaining} Character(s) Remaining</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button type="submit" className="h-10 px-4 rounded bg-emerald-600 text-white shadow-sm">Add Standard</button>
              <button type="button" onClick={resetForm} className="h-10 px-4 rounded border bg-white dark:bg-transparent dark:border-slate-700 dark:text-slate-200">Reset Standard</button>
            </div>
          </form>
        </section>
      </main>

      <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">© 2025 CAM powered by Goolean Technologies NA LLC</footer>
    </div>
  )
}
