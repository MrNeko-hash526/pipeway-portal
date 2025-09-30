"use client"

import React, { useState } from "react"
import * as yup from "yup"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type FormState = {
  forScope: "org" | "company"
  orgCode: string
  companyName: string
  certType: string
  file: File | null
  expDate: Date | null
  frequency: string
  comment: string
}

const INITIAL_CERT_TYPES = [
  { id: 1, type: "Professional Liability" },
  { id: 2, type: "Commercial General Liability" },
  { id: 3, type: "Client Information Request" },
  { id: 4, type: "Physical Security Audit" },
  { id: 5, type: "Bar Card Proof of Good Standing" },
  { id: 6, type: "Errors and Omission" },
  { id: 7, type: "Directors and Officers" },
]

const schema = yup
  .object()
  .strict(true)
  .shape({
    forScope: yup.string().oneOf(["org", "company"]).required(),
    orgCode: yup.string().trim().when("forScope", {
      is: "org",
      then: (s) => s.required("Organisation code is required"),
      otherwise: (s) => s.optional(),
    }),
    companyName: yup.string().trim().when("forScope", {
      is: "company",
      then: (s) => s.required("Company is required"),
      otherwise: (s) => s.optional(),
    }),
    certType: yup.string().trim().when("forScope", {
      is: "company",
      then: (s) => s.required("Certificate type is required"),
      otherwise: (s) => s.optional(),
    }),
    file: yup
      .mixed()
      .when("forScope", {
        is: "company",
        then: (s) => s.required("Please select a file")
          .test("fileSize", "File must be smaller than 5MB", (f: any) => !f || (f.size && f.size <= 5 * 1024 * 1024))
          .test("fileType", "Unsupported file type", (f: any) => {
            if (!f) return true
            const allowed = ["application/pdf", "image/png", "image/jpeg"]
            return allowed.includes(f.type)
          }),
        otherwise: (s) => s.optional(),
      }),
    expDate: yup
      .date()
      .when("forScope", {
        is: "company",
        then: (s) => s.typeError("Expiry date is required")
          .required("Expiry date is required")
          .min(new Date(1900, 0, 1), "Expiry date is invalid"),
        otherwise: (s) => s.optional(),
      }),
    frequency: yup.string().when("forScope", {
      is: "company",
      then: (s) => s.required("Frequency is required"),
      otherwise: (s) => s.optional(),
    }),
    comment: yup.string().max(2000, "Comment is too long"),
  })

export default function AddCertificatePage() {
  const [form, setForm] = useState<FormState>({
    forScope: "org",
    orgCode: "",
    companyName: "",
    certType: "",
    file: null,
    expDate: null,
    frequency: "",
    comment: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newCertType, setNewCertType] = useState("")
  const [certTypes, setCertTypes] = useState(INITIAL_CERT_TYPES)
  const [errorMessage, setErrorMessage] = useState("")

  const isOrgScope = form.forScope === "org"

  const resetForm = () => {
    setForm({
      forScope: "org",
      orgCode: "",
      companyName: "",
      certType: "",
      file: null,
      expDate: null,
      frequency: "",
      comment: "",
    })
    setErrors({})
  }

  const handleFileChange = (f: File | null) => {
    setForm((s) => ({ ...s, file: f }))
    setErrors((e) => ({ ...e, file: undefined }))
  }

  const handleAddCertType = () => {
    if (!newCertType.trim()) {
      setErrorMessage("Certificate type cannot be empty")
      return
    }

    // Check if certificate type already exists (case-insensitive)
    const exists = certTypes.some(
      item => item.type.toLowerCase() === newCertType.trim().toLowerCase()
    )

    if (exists) {
      setErrorMessage("Certificate type already exists")
      return
    }

    // Clear error and add new certificate type
    setErrorMessage("")
    const newId = Math.max(...certTypes.map(item => item.id)) + 1
    setCertTypes(prev => [...prev, { id: newId, type: newCertType.trim() }])
    setForm(s => ({ ...s, certType: newCertType.trim() }))
    setNewCertType("")
    setShowModal(false)
  }

  const handleResetModal = () => {
    setNewCertType("")
    setErrorMessage("")
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setNewCertType("")
    setErrorMessage("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCertType(e.target.value)
    if (errorMessage) {
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const values = { 
        ...form,
        expDate: form.expDate ? form.expDate.toLocaleDateString('en-US') : null
      }
      await schema.validate(form, { abortEarly: false })
      console.log("Validated payload:", values)
      // TODO: submit to API
    } catch (err: any) {
      const next: Partial<Record<keyof FormState, string>> = {}
      if (err.inner && Array.isArray(err.inner)) {
        err.inner.forEach((violation: any) => {
          if (violation.path) next[violation.path as keyof FormState] = violation.message
        })
      } else if (err.path) {
        next[err.path as keyof FormState] = err.message
      }
      setErrors(next)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Add Certificates</h1>
        <button
          type="button"
          onClick={() => history.back()}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-sky-600 text-white shadow-sm hover:bg-sky-700"
        >
          Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border p-6 shadow-sm"
        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
        noValidate
      >
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded-md bg-rose-50 text-rose-700 px-4 py-2 text-sm border border-rose-100">
            There are issues with your submission — please review highlighted fields.
          </div>
        )}

        <div className="mb-6 flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="scope"
              checked={form.forScope === "org"}
              onChange={() => setForm((s) => ({ ...s, forScope: "org" }))}
              className="h-4 w-4"
            />
            <span className="text-sm">For Org</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="scope"
              checked={form.forScope === "company"}
              onChange={() => setForm((s) => ({ ...s, forScope: "company" }))}
              className="h-4 w-4"
            />
            <span className="text-sm">For Company</span>
          </label>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">
            {form.forScope === "org" ? "Certificate / Insurance for:" : "Company:"} <span className="text-rose-500">*</span>
          </label>

          <div className="col-span-12 md:col-span-9">
            {form.forScope === "org" ? (
              <>
                <input
                  value={form.orgCode}
                  onChange={(e) => setForm((s) => ({ ...s, orgCode: e.target.value }))}
                  placeholder="Select Organisation Code"
                  className={`w-full h-11 rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${errors.orgCode ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
                  aria-invalid={!!errors.orgCode}
                />
                {errors.orgCode ? (
                  <p className="mt-1 text-sm text-rose-600">{errors.orgCode}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Start typing to search organisation codes.</p>
                )}
              </>
            ) : (
              <>
                <input
                  value={form.companyName}
                  onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
                  placeholder="Select Company"
                  className={`w-full h-11 rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${errors.companyName ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName ? (
                  <p className="mt-1 text-sm text-rose-600">{errors.companyName}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Start typing to search companies.</p>
                )}
              </>
            )}
          </div>

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Certificate Type {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9 flex gap-3 items-center">
            <select
              value={form.certType}
              onChange={(e) => !isOrgScope && setForm((s) => ({ ...s, certType: e.target.value }))}
              disabled={isOrgScope}
              className={`flex-1 h-11 rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${
                isOrgScope 
                  ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 text-slate-400 cursor-not-allowed' 
                  : errors.certType ? "border-rose-500" : "border-slate-200"
              } ${!isOrgScope && 'bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'}`}
              aria-invalid={!!errors.certType}
            >
              <option value="">Select Certificate Type...</option>
              {certTypes.map(cert => (
                <option key={cert.id} value={cert.type}>{cert.type}</option>
              ))}
            </select>

            <button
              type="button"
              className={`h-11 px-4 rounded-md flex items-center gap-2 ${
                isOrgScope 
                  ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed' 
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
              onClick={() => !isOrgScope && setShowModal(true)}
              disabled={isOrgScope}
            >
              Add Type
            </button>
          </div>
          {errors.certType && <p className="col-start-4 col-span-9 mt-1 text-sm text-rose-600">{errors.certType}</p>}

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Select File {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9">
            <label className={`flex items-center justify-between h-11 rounded-md px-3 border cursor-pointer transition ${
              isOrgScope 
                ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 cursor-not-allowed' 
                : errors.file ? "border-rose-500" : "border-slate-200"
            } ${!isOrgScope && 'bg-white/80 dark:bg-slate-800 dark:border-slate-700'}`}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={isOrgScope ? 'text-slate-400' : ''}>
                  <path d="M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={`text-sm ${
                  isOrgScope 
                    ? 'text-slate-400 dark:text-slate-500' 
                    : form.file ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"
                }`}>
                  {form.file ? form.file.name : "Choose file (PDF, PNG, JPG) - max 5MB"}
                </span>
              </div>

              <input
                type="file"
                className="sr-only"
                onChange={(e) => !isOrgScope && handleFileChange(e.target.files ? e.target.files[0] : null)}
                accept=".pdf,image/*"
                aria-invalid={!!errors.file}
                disabled={isOrgScope}
              />
            </label>
            {errors.file ? (
              <p className="mt-1 text-sm text-rose-600">{errors.file}</p>
            ) : (
              <p className={`mt-1 text-xs ${isOrgScope ? 'text-slate-400' : 'text-muted-foreground'}`}>
                We accept PDF and image formats.
              </p>
            )}
          </div>

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Expiry Date {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9">
            <DatePicker
              selected={form.expDate}
              onChange={(date) => !isOrgScope && setForm((s) => ({ ...s, expDate: date }))}
              dateFormat="MM/dd/yyyy"
              placeholderText="MM/DD/YYYY"
              disabled={isOrgScope}
              className={`h-11 w-full rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${
                isOrgScope 
                  ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 text-slate-400 cursor-not-allowed' 
                  : errors.expDate ? "border-rose-500" : "border-slate-200"
              } ${!isOrgScope && 'bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'}`}
              calendarClassName="bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg"
              dayClassName={(date) => 
                "text-gray-900 dark:text-gray-100 hover:bg-blue-500 hover:text-white cursor-pointer"
              }
            />
            {errors.expDate && <p className="mt-1 text-sm text-rose-600">{errors.expDate}</p>}
          </div>

          <label className={`col-span-12 md:col-span-3 text-sm pt-2 ${isOrgScope ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
            Frequency {!isOrgScope && <span className="text-rose-500">*</span>}
          </label>
          <div className="col-span-12 md:col-span-9">
            <select
              value={form.frequency}
              onChange={(e) => !isOrgScope && setForm((s) => ({ ...s, frequency: e.target.value }))}
              disabled={isOrgScope}
              className={`h-11 w-full rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${
                isOrgScope 
                  ? 'border-slate-200 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 text-slate-400 cursor-not-allowed' 
                  : errors.frequency ? "border-rose-500" : "border-slate-200"
              } ${!isOrgScope && 'bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'}`}
              aria-invalid={!!errors.frequency}
            >
              <option value="">Select Frequency</option>
              <option>Annually</option>
              <option>Quarterly</option>
              <option>Monthly</option>
            </select>
            {errors.frequency && <p className="mt-1 text-sm text-rose-600">{errors.frequency}</p>}
          </div>

          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">Comment</label>
          <div className="col-span-12 md:col-span-9">
            <textarea
              value={form.comment}
              onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))}
              rows={5}
              placeholder="Comment"
              className="w-full rounded-md border px-3 py-2 bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
            {errors.comment && <p className="mt-1 text-sm text-rose-600">{errors.comment}</p>}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-md bg-sky-600 text-white shadow hover:bg-sky-700 disabled:opacity-60"
          >
            Add Certificate
          </button>

          <button type="button" onClick={resetForm} className="h-11 px-4 rounded-md border border-slate-200 text-slate-800 bg-white/60 hover:bg-white dark:border-slate-700 dark:bg-transparent dark:text-slate-100">
            Reset Certificate
          </button>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-sky-600 dark:text-sky-400">Add Certificate Type</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Add Certificate Type Form */}
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate Type: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCertType}
                    onChange={handleInputChange}
                    placeholder="Certificate Type"
                    className={`w-full h-10 px-3 border rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errorMessage 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errorMessage && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errorMessage}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAddCertType}
                  className="h-10 px-6 bg-sky-500 hover:bg-sky-600 text-white rounded font-medium flex items-center gap-2"
                >
                  <span>✓</span> Add Type
                </button>
                <button
                  onClick={handleResetModal}
                  className="h-10 px-6 bg-red-500 hover:bg-red-600 text-white rounded font-medium flex items-center gap-2"
                >
                  <span>↻</span> Reset
                </button>
              </div>

              {/* Certificate Types Table */}
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-700">
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left w-12">#</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Certificate Type</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certTypes.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-600">
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-white">{item.type}</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                          <button
                            className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200"
                            disabled
                            title="Edit"
                          >
                            ✎
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded font-medium"
              >
                × Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
        }
        .react-datepicker {
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .dark .react-datepicker__header {
          background-color: #374151;
          border-bottom: 1px solid #4b5563;
          color: #e5e7eb;
        }
        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        .react-datepicker__day--today {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        .dark .react-datepicker__day--today {
          background-color: #1e3a8a;
          color: #93c5fd;
        }
      `}</style>
    </div>
  )
}
