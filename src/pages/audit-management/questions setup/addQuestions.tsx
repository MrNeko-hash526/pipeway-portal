

import React from "react"
import Link from "@/components/link"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

const SAMPLE_CATEGORIES = [
  "Governance and Consumer Compliance",
  "Operations",
  "Information Security",
]

// typed records to avoid implicit any when indexing by string
const SAMPLE_TITLES: Record<string, string[]> = {
  "Governance and Consumer Compliance": ["Provider Capability", "Consumer Rights"],
  Operations: ["Service Delivery", "Staffing"],
  "Information Security": ["Access Control", "Encryption"],
}

const SAMPLE_CITATIONS: Record<string, string[]> = {
  "Provider Capability": ["ALL", "ISO-9001"],
  "Consumer Rights": ["ALL"],
  "Service Delivery": ["SLA-1"],
  Staffing: ["HR-101"],
  "Access Control": ["ISO-27001"],
  Encryption: ["NIST-800-53"],
}

type FormValues = {
  category: string
  title: string
  citation: string
  question: string
}

const MAX_CHARS = 1700

const schema = yup
  .object({
    category: yup.string().trim().required("Category is required"),
    title: yup.string().trim().required("Title is required"),
    citation: yup.string().trim().required("Citation is required"),
    question: yup
      .string()
      .trim()
      .required("Question is required")
      .min(8, "Minimum 8 characters")
      .max(MAX_CHARS, `Maximum ${MAX_CHARS} characters`),
  })
  .strict(true)
  .required()

export default function AddQuestionsPage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      category: "",
      title: "",
      citation: "",
      question: "",
    },
  })

  const watchedCategory = watch("category")
  const watchedTitle = watch("title")
  const watchedQuestion = watch("question") ?? ""
  const remaining = Math.max(0, MAX_CHARS - watchedQuestion.length)

  // when category/title change clear dependent fields (keep consistent with previous behavior)
  React.useEffect(() => {
    setValue("title", "")
    setValue("citation", "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCategory])

  React.useEffect(() => {
    setValue("citation", "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedTitle])

  const titles = React.useMemo(() => (watchedCategory ? SAMPLE_TITLES[watchedCategory] ?? [] : []), [watchedCategory])
  const citations = React.useMemo(() => (watchedTitle ? SAMPLE_CITATIONS[watchedTitle] ?? [] : []), [watchedTitle])

  const derivedStandard = React.useMemo(() => {
    if (!watchedCategory && !watchedTitle && !watch("citation")) return "Select Category, Title and Citation"
    const parts: string[] = []
    if (watchedCategory) parts.push(watchedCategory)
    if (watchedTitle) parts.push(watchedTitle)
    if (watch("citation")) parts.push(watch("citation")!)
    return parts.join(" / ")
  }, [watchedCategory, watchedTitle, watch])

  const onSubmit = async (data: FormValues) => {
    try {
      const raw = localStorage.getItem("questions")
      const arr = raw ? JSON.parse(raw) : []
      const newItem = {
        id: Date.now(),
        category: data.category,
        title: data.title,
        citation: data.citation,
        standard: derivedStandard,
        question: data.question.trim(),
        status: "Active",
        logCount: 0,
      }
      arr.unshift(newItem)
      localStorage.setItem("questions", JSON.stringify(arr))
      window.location.href = "/audit-management/questions-setup"
    } catch (err) {
      console.error(err)
      // set a field-level error by using a simple alert here (keep UI minimal)
      alert("Save failed")
    }
  }

  const handleReset = () => {
    reset()
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Add Question</h1>
        <Link href="/audit-management/questions-setup" className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400">
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-[rgb(33,33,36)] border border-border rounded p-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          <label className="col-span-2 text-sm">Category:*</label>
          <div className="col-span-10">
            <select
              {...register("category")}
              className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.category ? "border-rose-500" : ""}`}
            >
              <option value="">Select a category...</option>
              {SAMPLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <div className="text-rose-600 text-sm mt-1">{errors.category.message}</div>}
          </div>

          <label className="col-span-2 text-sm">Title:*</label>
          <div className="col-span-10">
            <select
              {...register("title")}
              className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.title ? "border-rose-500" : ""}`}
              disabled={!watchedCategory}
            >
              <option value="">Select a title...</option>
              {titles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.title && <div className="text-rose-600 text-sm mt-1">{errors.title.message}</div>}
          </div>

          <label className="col-span-2 text-sm">Citation:*</label>
          <div className="col-span-10">
            <select
              {...register("citation")}
              className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.citation ? "border-rose-500" : ""}`}
              disabled={!watchedTitle}
            >
              <option value="">Select a citation...</option>
              {citations.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.citation && <div className="text-rose-600 text-sm mt-1">{errors.citation.message}</div>}
          </div>

          <label className="col-span-2 text-sm">Standard:*</label>
          <div className="col-span-10">
            <input readOnly value={derivedStandard} className="w-full h-10 border rounded px-3 bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] dark:text-[#e6e6e6]" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2">Question:*</label>
          <textarea
            {...register("question")}
            rows={6}
            className={`w-full border rounded px-3 py-2 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.question ? "border-rose-500" : ""}`}
            placeholder="Question"
          />
          <div className="flex items-center justify-between mt-2 text-sm">
            <div className="text-rose-600">{errors.question?.message}</div>
            <div className="text-slate-500 dark:text-[#e6e6e6]">{remaining} Character(s) Remaining</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700">
            Add Question
          </button>
          <button type="button" onClick={handleReset} className="px-4 py-2 rounded bg-rose-400 text-white hover:bg-rose-500">
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}