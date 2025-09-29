"use client"

import Link from "@/components/link"
import React from "react"

const TRAINING_TYPES = [
  { value: "", label: "Select Training Type" },
  { value: "HIPAA", label: "HIPAA" },
  { value: "Bankruptcy", label: "Bankruptcy" },
  { value: "UDAAP", label: "UDAAP" },
  { value: "Data Security", label: "Data Security" },
  { value: "GLBA", label: "GLBA" },
  { value: "FDCPA", label: "FDCPA" },
  { value: "FCRA", label: "FCRA" },
]

export default function CreateQuestionBankPage() {
  const [trainingType, setTrainingType] = React.useState("")
  const [questionBank, setQuestionBank] = React.useState("")

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#19191c] py-6 px-4">
      <div className="max-w-6xl mx-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#212124] shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 px-6 py-3">
          <h1 className="text-sm font-semibold text-sky-900 dark:text-sky-200">Create Questions Bank</h1>
          <Link 
           href="/training-and-test/question-setup"
          className="text-sm bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-1 rounded">
            Back
          </Link>
        </div>
        {/* Subtitle */}
        <div className="text-center text-xs italic text-gray-600 dark:text-gray-400 py-2 border-b border-gray-200 dark:border-gray-800">
          for Select Training Type
        </div>
        {/* Content */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center justify-between gap-6 px-8 py-6"
        >
          {/* Training Type and Add button */}
          <div className="flex flex-col justify-center gap-1 w-[320px]">
            <label className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              Training Type<span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 mt-1">
              <select
                value={trainingType}
                onChange={e => setTrainingType(e.target.value)}
                className="h-9 flex-grow rounded border border-yellow-300 focus:border-sky-500 bg-white dark:bg-[#212124] px-3 text-sm text-gray-900 dark:text-white"
              >
                {TRAINING_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Link
                href=" /training-and-test/question-setup/add-list"
                className="h-9 px-6 rounded bg-sky-400 hover:bg-sky-500 text-white font-semibold py-1"
              >
                Add
              </Link>
            </div>
          </div>

          {/* Question Bank input and Add Question Bank */}
          <div className="flex flex-col justify-center gap-1 w-[400px]">
            <label className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              Question Bank<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Type Question Bank Name"
              value={questionBank}
              onChange={e => setQuestionBank(e.target.value)}
              className="h-9 rounded border border-gray-300 focus:border-sky-500 bg-white dark:bg-[#232326] px-3 text-sm text-gray-900 dark:text-white"
            />
            <button
              type="button"
              disabled
              className="mt-3 w-full h-9 rounded bg-sky-300 text-sky-900 font-semibold cursor-not-allowed border border-sky-300"
            >
              Add Question Bank
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
