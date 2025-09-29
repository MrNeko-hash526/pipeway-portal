"use client"


import Link from "@/components/link"
import React from "react"
import * as yup from "yup"

const schema = yup.object({
  questionSetName: yup.string().trim().required("Question Set Name is required"),
})

export default function CreateQuestionSetPage() {
  const [questionSetName, setQuestionSetName] = React.useState("")
  const [errors, setErrors] = React.useState<{ questionSetName?: string }>({})

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await schema.validate({ questionSetName }, { abortEarly: false })
      setErrors({})
      alert(`Created Question Set: ${questionSetName}`)
      // Add creation logic here
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const err: { questionSetName?: string } = {}
        validationError.inner.forEach(error => {
          if (error.path) err[error.path as keyof typeof err] = error.message
        })
        setErrors(err)
      }
    }
  }

  const handleReset = () => {
    setQuestionSetName("")
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#19191c] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-5xl border border-gray-200 dark:border-gray-800 rounded-lg shadow bg-white dark:bg-[#212124]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#19191c] rounded-t-lg px-6 py-3">
          <span className="text-sm font-semibold text-sky-700 dark:text-sky-200">
            Create Question Set
          </span>
          <Link
           className="px-5 py-1 bg-sky-400 hover:bg-sky-500 text-white font-medium rounded transition-colors"
            href="/training-and-test/question-setup/add-list"
            onClick={() => window.history.back()}
          >
            Back
          </Link>
        </div>
        {/* Form */}
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-2 px-10 py-10"
          noValidate
        >
          <div className="flex items-center gap-8">
            <label
              htmlFor="questionSetName"
              className="text-sm font-semibold text-gray-700 dark:text-gray-100 whitespace-nowrap"
            >
              Question Set Name<span className="text-red-500">*</span>
            </label>
            <input
              id="questionSetName"
              type="text"
              placeholder="Type Question Set Name"
              value={questionSetName}
              onChange={e => setQuestionSetName(e.target.value)}
              className={`border rounded px-3 h-10 bg-white dark:bg-[#232326] text-gray-900 dark:text-gray-100 text-sm flex-grow focus:outline-none ${
                errors.questionSetName
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-gray-300 focus:ring-sky-400"
              } focus:ring-2`}
            />
          </div>
          {errors.questionSetName && (
            <p className="text-rose-600 text-sm ml-[150px] mt-1 select-none">
              {errors.questionSetName}
            </p>
          )}
          <div className="flex items-center gap-4 mt-6 justify-start pl-[150px]">
            <button
              type="submit"
              className="px-7 py-2 bg-sky-400 hover:bg-sky-500 text-white rounded text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Create
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-7 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
