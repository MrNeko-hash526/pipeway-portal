

import React from "react"
import Link from "@/components/link"

export default function UploadQuestionsPage() {
  const [auditName, setAuditName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const maxChars = 1700
  const remaining = Math.max(0, maxChars - description.length)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0]
    setFile(f ?? null)
  }

  const reset = () => {
    setAuditName("")
    setDescription("")
    setFile(null)
    setErrors({})
    ;(document.querySelector<HTMLInputElement>("#upload-file")!).value = ""
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!auditName.trim()) next.auditName = "Audit name is required"
    if (!description.trim()) next.description = "Description is required"
    if (!file) next.file = "Please choose an Excel file"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!validate()) return
    // placeholder: you can parse the Excel file here (ExcelJS) or upload to server
    console.log("Uploading", { auditName, description, file })
    // simple success flow: navigate back to questions list
    window.location.href = "/audit-management/questions-setup"
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Upload Question</h1>
        <Link href="/audit-management/questions-setup" className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400">
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[rgb(33,33,36)] border border-border rounded p-6">
        <div className="grid grid-cols-12 gap-4 items-center mb-3">
          <label className="col-span-2 text-sm">Audit Name:*</label>
          <div className="col-span-10">
            <input
              value={auditName}
              onChange={(e) => setAuditName(e.target.value.slice(0, 200))}
              placeholder="Audit Name - (Citation) - Max - 200 characters"
              className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.auditName ? "border-rose-500" : ""}`}
            />
            {errors.auditName && <div className="text-rose-600 text-sm mt-1">{errors.auditName}</div>}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start mb-3">
          <label className="col-span-2 text-sm pt-2">Description:*</label>
          <div className="col-span-10">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, maxChars))}
              placeholder="Description-(Standard)"
              rows={6}
              className={`w-full border rounded px-3 py-2 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.description ? "border-rose-500" : ""}`}
            />
            <div className="flex items-center justify-between mt-2 text-sm">
              <div className="text-rose-600">{errors.description}</div>
              <div className="text-slate-500 dark:text-[#e6e6e6]">{remaining} Character(s) Remaining</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <label className="col-span-2 text-sm">File (In Excel):*</label>
          <div className="col-span-10">
            <input id="upload-file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} className={`w-full ${errors.file ? "border border-rose-500" : ""}`} />
            {errors.file && <div className="text-rose-600 text-sm mt-1">{errors.file}</div>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700">
            Submit
          </button>
          <button type="button" onClick={reset} className="px-4 py-2 rounded bg-rose-400 text-white hover:bg-rose-500">
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
