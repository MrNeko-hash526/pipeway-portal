

import React from "react"
import * as yup from "yup"
import toast, { Toaster } from "react-hot-toast"
import Link from "@/components/link"

const SELECT_OPTIONS = [
  { value: "", label: "Please Select..." },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const

const schema = yup.object({
  questionSet: yup.string().required("Question Set is required"),
  shuffleQuestions: yup.string().required("Shuffle Questions is required"),
  numQuestions: yup.number().min(1, "At least 1 question required").required("Number of Questions is required"),
  numAttempts: yup.number().min(1, "At least 1 attempt required").required("Number of Attempts is required"),
  testName: yup.string().required("Test Name is required"),
  policyLink: yup.string().required("Training Policy Link is required"),
  allowPrevButton: yup.string().required("Allow Previous Button is required"),
  shuffleAnswers: yup.string().required("Shuffle Answers is required"),
  timeDay: yup.string().required("Day is required"),
  timeHour: yup.string().required("Hour is required"),
  timeMinute: yup.string().required("Minute is required"),
  duration: yup.number().positive("Duration must be positive").required("Test Duration is required"),
  materialLink: yup.string().required("Training Material Link is required"),
})

type FormData = {
  questionSet: string
  shuffleQuestions: string
  numQuestions: string
  numAttempts: string
  testName: string
  policyLink: string
  allowPrevButton: string
  shuffleAnswers: string
  timeDay: string
  timeHour: string
  timeMinute: string
  duration: string
  materialLink: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const leftFields: Array<{
  label: string
  name: keyof FormData
  type: "select" | "number" | "text"
  options?: ReadonlyArray<{ value: string; label: string }>
  placeholder?: string
  readOnly?: boolean
}> = [
  {
    label: "Question Set",
    name: "questionSet",
    type: "select",
    options: [
      { value: "", label: "Please Select..." },
      { value: "setA", label: "Set A" },
      { value: "setB", label: "Set B" },
    ],
  },
  { label: "Shuffle Questions", name: "shuffleQuestions", type: "select", options: SELECT_OPTIONS },
  { label: "# Questions", name: "numQuestions", type: "number", placeholder: "# Questions" },
  { label: "# Attempts", name: "numAttempts", type: "number", placeholder: "# Attempts" },
  { label: "Test Name", name: "testName", type: "text", placeholder: "Test Name" },
  { label: "Training Policy Link", name: "policyLink", type: "text", placeholder: "None selected", readOnly: true },
]

const rightFields: Array<{
  label: string
  name: keyof FormData
  options: ReadonlyArray<{ value: string; label: string }>
}> = [
  { label: "Allow Previous Button", name: "allowPrevButton", options: SELECT_OPTIONS },
  { label: "Shuffle Answers", name: "shuffleAnswers", options: SELECT_OPTIONS },
]

const timeFields: Array<keyof FormData> = ["timeDay", "timeHour", "timeMinute"]

export default function TestParametersPage(): JSX.Element {
  const [formData, setFormData] = React.useState<FormData>({
    questionSet: "",
    shuffleQuestions: "",
    numQuestions: "",
    numAttempts: "",
    testName: "",
    policyLink: "",
    allowPrevButton: "",
    shuffleAnswers: "",
    timeDay: "",
    timeHour: "",
    timeMinute: "",
    duration: "",
    materialLink: "",
  })

  const [errors, setErrors] = React.useState<FormErrors>({})

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = e.target
      setFormData((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      ...formData,
      numQuestions: Number(formData.numQuestions || 0),
      numAttempts: Number(formData.numAttempts || 0),
      duration: Number(formData.duration || 0),
    }

    try {
      await schema.validate(payload, { abortEarly: false })
      setErrors({})
      toast.success("Submitted successfully!")
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const fieldErrors: FormErrors = {}
        validationError.inner.forEach((err) => {
          if (err.path && !fieldErrors[err.path as keyof FormData]) {
            fieldErrors[err.path as keyof FormData] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      toast.error("Fill all required fields correctly!")
    }
  }

  const handleDraft = () => {
    toast.success("Draft saved!")
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100 dark:bg-[#19191c] flex flex-col items-center p-8 transition-colors">
        <div className="w-full max-w-6xl border border-gray-200 dark:border-gray-800 rounded-lg shadow bg-white dark:bg-[#212124]">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#19191c] rounded-t-lg px-6 py-3">
            <span className="text-sm font-semibold text-sky-700 dark:text-sky-200">Test Parameters</span>
            <Link
              href="/training-and-test/tests-setup"
              className="px-5 py-1 bg-sky-400 hover:bg-sky-500 text-white font-medium rounded"
            >
              Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-10 gap-y-4 px-12 py-10" autoComplete="off">
            <div className="flex flex-col gap-5">
              {leftFields.map(({ label, name, type, options, placeholder, readOnly }) => (
                <div key={name}>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-100">
                    {label}
                    <span className="text-red-500">*</span>
                  </label>
                  {type === "select" ? (
                    <select
                      className={`w-full h-9 rounded border px-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#232326] ${
                        errors[name] ? "border-rose-500" : "border-gray-300 dark:border-gray-700"
                      }`}
                      value={formData[name]}
                      onChange={handleChange(name)}
                    >
                      {(options ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type === "number" ? "number" : "text"}
                      placeholder={placeholder}
                      readOnly={Boolean(readOnly)}
                      className={`h-9 w-full rounded border px-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#232326] ${
                        errors[name] ? "border-rose-500" : "border-gray-300 dark:border-gray-700"
                      }`}
                      value={formData[name]}
                      onChange={handleChange(name)}
                    />
                  )}
                  {errors[name] && <p className="mt-1 text-xs text-rose-600 select-none">{errors[name]}</p>}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5">
              {rightFields.map(({ label, name, options }) => (
                <div key={name}>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-100">
                    {label}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full h-9 rounded border px-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#232326] ${
                      errors[name] ? "border-rose-500" : "border-gray-300 dark:border-gray-700"
                    }`}
                    value={formData[name]}
                    onChange={handleChange(name)}
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors[name] && <p className="mt-1 text-xs text-rose-600 select-none">{errors[name]}</p>}
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-100">
                  Time Between Attempts:<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {timeFields.map((field) => (
                    <select
                      key={field}
                      className={`h-9 rounded border px-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#232326] ${
                        errors[field] ? "border-rose-500" : "border-gray-300 dark:border-gray-700"
                      }`}
                      value={formData[field]}
                      onChange={handleChange(field)}
                    >
                      <option value="">
                        {field === "timeDay" ? "Day" : field === "timeHour" ? "Hour" : "Minute"}
                      </option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  ))}
                </div>
                {(errors.timeDay || errors.timeHour || errors.timeMinute) && (
                  <p className="mt-1 text-xs text-rose-600 select-none">
                    {errors.timeDay || errors.timeHour || errors.timeMinute}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-100">
                  Test Duration (min.)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  className={`h-9 w-full rounded border px-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#232326] ${
                    errors.duration ? "border-rose-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                  value={formData.duration}
                  onChange={handleChange("duration")}
                  placeholder="Test Duration"
                />
                {errors.duration && <p className="mt-1 text-xs text-rose-600 select-none">{errors.duration}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-100">
                  Training Material Link<span className="text-red-500">*</span>
                </label>
                <input
                  className={`h-9 w-full rounded border px-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#232326] ${
                    errors.materialLink ? "border-rose-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                  value={formData.materialLink}
                  onChange={handleChange("materialLink")}
                  placeholder="None selected"
                  readOnly
                />
                {errors.materialLink && <p className="mt-1 text-xs text-rose-600 select-none">{errors.materialLink}</p>}
              </div>
            </div>

            <div className="col-span-2 flex justify-center mt-8 gap-4">
              <button
                type="button"
                className="w-40 px-2 py-2 bg-sky-400 hover:bg-sky-500 text-white rounded text-base font-semibold flex items-center justify-center gap-2"
                onClick={handleDraft}
              >
                🗎 Save Draft
              </button>
              <button
                type="submit"
                className="w-40 px-2 py-2 bg-sky-400 hover:bg-sky-500 text-white rounded text-base font-semibold flex items-center justify-center gap-2"
              >
                ☑ Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
