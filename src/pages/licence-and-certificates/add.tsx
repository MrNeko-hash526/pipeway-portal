"use client"

import React, { useState } from "react"
import * as yup from "yup"

type FormState = {
  forScope: "org" | "company"
  orgCode: string
  companyName: string
  certType: string
  file: File | null
  expDate: string
  frequency: string
  comment: string
}

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
    certType: yup.string().trim().required("Certificate type is required"),
    file: yup
      .mixed()
      .required("Please select a file")
      .test("fileSize", "File must be smaller than 5MB", (f: any) => !f || (f.size && f.size <= 5 * 1024 * 1024))
      .test("fileType", "Unsupported file type", (f: any) => {
        if (!f) return true
        const allowed = ["application/pdf", "image/png", "image/jpeg"]
        return allowed.includes(f.type)
      }),
    expDate: yup
      .date()
      .typeError("Expiry date is required")
      .required("Expiry date is required")
      .min(new Date(1900, 0, 1), "Expiry date is invalid"),
    frequency: yup.string().required("Frequency is required"),
    comment: yup.string().max(2000, "Comment is too long"),
  })

export default function AddCertificatePage() {
  const [form, setForm] = useState<FormState>({
    forScope: "org",
    orgCode: "",
    companyName: "",
    certType: "",
    file: null,
    expDate: "",
    frequency: "",
    comment: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setForm({
      forScope: "org",
      orgCode: "",
      companyName: "",
      certType: "",
      file: null,
      expDate: "",
      frequency: "",
      comment: "",
    })
    setErrors({})
  }

  const handleFileChange = (f: File | null) => {
    setForm((s) => ({ ...s, file: f }))
    setErrors((e) => ({ ...e, file: undefined }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const values = { ...form }
      await schema.validate(values, { abortEarly: false })
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

          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">Certificate Type <span className="text-rose-500">*</span></label>
          <div className="col-span-12 md:col-span-9 flex gap-3 items-center">
            <select
              value={form.certType}
              onChange={(e) => setForm((s) => ({ ...s, certType: e.target.value }))}
              className={`flex-1 h-11 rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${errors.certType ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              aria-invalid={!!errors.certType}
            >
              <option value="">Select Certificate Type...</option>
              <option>Professional Liability</option>
              <option>Commercial General Liability</option>
              <option>Errors and Omission</option>
            </select>

            <button
              type="button"
              className="h-11 px-4 rounded-md bg-sky-600 text-white flex items-center gap-2 hover:bg-sky-700"
              onClick={() => {
                const name = prompt("New certificate type name")
                if (name) setForm((s) => ({ ...s, certType: name }))
              }}
            >
              Add Type
            </button>
          </div>

          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">Select File <span className="text-rose-500">*</span></label>
          <div className="col-span-12 md:col-span-9">
            <label className={`flex items-center justify-between h-11 rounded-md px-3 border cursor-pointer transition ${errors.file ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700`}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={`text-sm ${form.file ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"}`}>
                  {form.file ? form.file.name : "Choose file (PDF, PNG, JPG) - max 5MB"}
                </span>
              </div>

              <input
                type="file"
                className="sr-only"
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                accept=".pdf,image/*"
                aria-invalid={!!errors.file}
              />
            </label>
            {errors.file ? (
              <p className="mt-1 text-sm text-rose-600">{errors.file}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">We accept PDF and image formats.</p>
            )}
          </div>

          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">Expiry Date <span className="text-rose-500">*</span></label>
          <div className="col-span-12 md:col-span-9">
            <div className="relative">
              <input
                type="date"
                value={form.expDate}
                onChange={(e) => setForm((s) => ({ ...s, expDate: e.target.value }))}
                className={`h-11 w-full rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${errors.expDate ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
                aria-invalid={!!errors.expDate}
              />
            </div>
            {errors.expDate && <p className="mt-1 text-sm text-rose-600">{errors.expDate}</p>}
          </div>

          <label className="col-span-12 md:col-span-3 text-sm pt-2 text-slate-700 dark:text-slate-200">Frequency <span className="text-rose-500">*</span></label>
          <div className="col-span-12 md:col-span-9">
            <select
              value={form.frequency}
              onChange={(e) => setForm((s) => ({ ...s, frequency: e.target.value }))}
              className={`h-11 w-full rounded-md px-3 border focus:ring-2 focus:ring-sky-400 transition ${errors.frequency ? "border-rose-500" : "border-slate-200"} bg-white/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
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
    </div>
  )
}
