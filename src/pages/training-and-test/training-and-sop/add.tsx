"use client"

import React from "react"
import * as yup from "yup"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type SelectOption = { value: string; label: string }

const INITIAL_DOC_TYPES: SelectOption[] = [
  { value: "", label: "Select Document Type" },
  { value: "policy", label: "Policy" },
  { value: "procedure", label: "Procedure" },
  { value: "training", label: "Training Manual" },
]

const CATEGORIES: SelectOption[] = [
  { value: "", label: "Select a category..." },
  { value: "customer-comms", label: "Customer Communications" },
  { value: "compliance", label: "Governance & Compliance" },
  { value: "security", label: "Information Security" },
]

const TITLES: SelectOption[] = [
  { value: "", label: "Select a title..." },
  { value: "compliance-training", label: "Compliance and Training" },
  { value: "audit-programs", label: "Audit and Compliance Programs" },
  { value: "employee-training", label: "Employee Training & Testing" },
]

const CITATIONS: SelectOption[] = [
  { value: "", label: "Select a citation..." },
  { value: "fdcpa", label: "FDCPA" },
  { value: "hipaa", label: "HIPAA" },
  { value: "glba", label: "GLBA" },
]

const APPROVERS: SelectOption[] = [
  { value: "", label: "Select training approver name..." },
  { value: "tonia", label: "Tonia Blake" },
  { value: "tami", label: "Tami Ruiz" },
  { value: "carl", label: "Carl Evans" },
]

type FormState = {
  documentType: string
  trainingName: string
  category: string
  title: string
  citation: string
  approver: string
  expiryDate: Date | null
  file?: File | null
}

const INITIAL_FORM: FormState = {
  documentType: "",
  trainingName: "",
  category: "",
  title: "",
  citation: "",
  approver: "",
  expiryDate: new Date(Date.now() + 31536000000), // 1 year from now
  file: null,
}

const trainingSchema = yup.object({
  documentType: yup.string().required("Document type is required."),
  trainingName: yup.string().trim().required("Training name is required."),
  category: yup.string().required("Category is required."),
  title: yup.string().required("Title is required."),
  citation: yup.string().required("Citation is required."),
  approver: yup.string().required("Approver is required."),
  expiryDate: yup
    .date()
    .typeError("Expiry date is required.")
    .required("Expiry date is required.")
    .min(new Date(), "Expiry date must be in the future."),
  file: yup
    .mixed<File>()
    .required("A PDF file is required.")
    .test("fileType", "Only PDF files are allowed.", (file) =>
      file ? file.type === "application/pdf" : false
    ),
})

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

// DOC TYPE MODAL COMPONENT
type DocTypeListModalProps = {
  open: boolean
  onClose: () => void
  docTypeOptions: SelectOption[]
  onAdd: (label: string) => void
  addForm: { label: string }
  setAddForm: (form: { label: string }) => void
  addError: string | null
  setAddError: (err: string | null) => void
}

function DocTypeListModal({
  open,
  onClose,
  docTypeOptions,
  onAdd,
  addForm,
  setAddForm,
  addError,
  setAddError,
}: DocTypeListModalProps) {
  const handleAdd = async () => {
    if (!addForm.label.trim()) {
      setAddError("Document type name is required.")
      return
    }
    const duplicate = docTypeOptions.some(
      (option) => option.label.trim().toLowerCase() === addForm.label.trim().toLowerCase()
    )
    if (duplicate) {
      setAddError("Document type already exists.")
      return
    }
    onAdd(addForm.label.trim())
    setAddForm({ label: "" })
    setAddError(null)
  }

  const handleReset = () => {
    setAddForm({ label: "" })
    setAddError(null)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto border dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Add Training DocType
        </h2>
        <div className="mb-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Training Document Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addForm.label}
              onChange={(e) => setAddForm({ label: e.target.value })}
              placeholder="Doc Type"
              className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 px-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
            />
            {addError && (
              <p className="text-xs text-red-500 mt-1">{addError}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="px-5 h-10 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
          >
            Add
          </button>
          <button
            onClick={handleReset}
            className="px-5 h-10 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="mb-6 max-h-60 overflow-y-auto border rounded">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900">
                <th className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-left w-12">#</th>
                <th className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-left">Doc Type</th>
                <th className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {docTypeOptions
                .filter((item: SelectOption) => item.value !== "")
                .map((item: SelectOption, idx: number) => (
                <tr
                  key={item.value}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-900"
                >
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-1">{idx + 1}</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-1">{item.label}</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-center">
                    <button
                      className="text-sky-600 hover:underline"
                      type="button"
                      disabled
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
        >
          × Close
        </button>
      </div>
    </div>
  )
}

// MAIN PAGE
export default function AddTrainingPage() {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const [docTypeOptions, setDocTypeOptions] = React.useState<SelectOption[]>(INITIAL_DOC_TYPES)
  const [docTypeModalOpen, setDocTypeModalOpen] = React.useState(false)
  const [docTypeForm, setDocTypeForm] = React.useState<{ label: string }>({ label: "" })
  const [docTypeError, setDocTypeError] = React.useState<string | null>(null)

  const updateField = (key: keyof FormState, value: FormState[typeof key]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await trainingSchema.validate(form, { abortEarly: false })
      alert("Training created (demo only).")
      setSubmitting(false)
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const fieldErrors: Partial<Record<keyof FormState, string>> = {}
        validationError.inner.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path as keyof FormState] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setErrors({})
  }

  const handleDocTypeAdd = (newLabel: string) => {
    const value = slugify(newLabel)
    setDocTypeOptions((prev) => [...prev, { value, label: newLabel }])
    updateField("documentType", value)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-10 transition-colors">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Add Training</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Provide training details, upload supporting files, and assign an approver.
              </p>
            </div>
            <a
              href="/training-and-test/question-bank-setup"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ← Back
            </a>
          </header>

          <section className="rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>
                      Training Document Type<span className="text-red-500"> *</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDocTypeForm({ label: "" })
                        setDocTypeError(null)
                        setDocTypeModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-sky-600 px-2.5 py-1 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-50 dark:border-sky-400 dark:text-sky-300 dark:hover:bg-sky-900"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                      </svg>
                      Add
                    </button>
                  </label>
                  <select
                    value={form.documentType}
                    onChange={(e) => updateField("documentType", e.target.value)}
                    className={`h-11 w-full rounded-md border ${
                      errors.documentType ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  >
                    {docTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.documentType && <p className="text-xs text-red-500">{errors.documentType}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Training Name<span className="text-red-500"> *</span>
                  </label>
                  <input
                    value={form.trainingName}
                    onChange={(e) => updateField("trainingName", e.target.value)}
                    placeholder="Training Name"
                    className={`h-11 w-full rounded-md border ${
                      errors.trainingName ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  />
                  {errors.trainingName && <p className="text-xs text-red-500">{errors.trainingName}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category<span className="text-red-500"> *</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className={`h-11 w-full rounded-md border ${
                      errors.category ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  >
                    {CATEGORIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title<span className="text-red-500"> *</span>
                  </label>
                  <select
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className={`h-11 w-full rounded-md border ${
                      errors.title ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  >
                    {TITLES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Citation<span className="text-red-500"> *</span>
                  </label>
                  <select
                    value={form.citation}
                    onChange={(e) => updateField("citation", e.target.value)}
                    className={`h-11 w-full rounded-md border ${
                      errors.citation ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  >
                    {CITATIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.citation && <p className="text-xs text-red-500">{errors.citation}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Approver<span className="text-red-500"> *</span>
                  </label>
                  <select
                    value={form.approver}
                    onChange={(e) => updateField("approver", e.target.value)}
                    className={`h-11 w-full rounded-md border ${
                      errors.approver ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  >
                    {APPROVERS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.approver && <p className="text-xs text-red-500">{errors.approver}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expiry Date<span className="text-red-500"> *</span>
                  </label>
                  <DatePicker
                    selected={form.expiryDate}
                    onChange={(date) => updateField("expiryDate", date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="MM/DD/YYYY"
                    className={`h-11 w-full rounded-md border ${
                      errors.expiryDate ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500`}
                    calendarClassName="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg"
                    dayClassName={(date) => 
                      "text-gray-900 dark:text-gray-100 hover:bg-blue-500 hover:text-white cursor-pointer"
                    }
                  />
                  {errors.expiryDate && <p className="text-xs text-red-500">{errors.expiryDate}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select File (Only PDF)<span className="text-red-500"> *</span>
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => updateField("file", e.target.files?.[0] ?? null)}
                    className={`block w-full cursor-pointer rounded-md border ${
                      errors.file ? "border-red-400" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-800 dark:file:text-gray-100 hover:file:bg-gray-200 dark:hover:file:bg-gray-600`}
                  />
                  {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 dark:border-gray-600 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-300 transition-colors hover:bg-red-50 dark:hover:bg-red-900"
                >
                  ↺ Reset Training
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Saving..." : "➕ Add Training"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <DocTypeListModal
        open={docTypeModalOpen}
        onClose={() => setDocTypeModalOpen(false)}
        docTypeOptions={docTypeOptions}
        onAdd={handleDocTypeAdd}
        addForm={docTypeForm}
        setAddForm={setDocTypeForm}
        addError={docTypeError}
        setAddError={setDocTypeError}
      />
    </>
  )
}
