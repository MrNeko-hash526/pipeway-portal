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

const INITIAL_TRAINING_DATA = [
  { id: 1, type: "HIPAA" },
  { id: 2, type: "Bankruptcy" },
  { id: 3, type: "UDAAP" },
  { id: 4, type: "Data Security" },
  { id: 5, type: "GLBA" },
  { id: 6, type: "FDCPA" },
  { id: 7, type: "FCRA" },
]

export default function AddQuestionBankPage() {
  const [trainingType, setTrainingType] = React.useState("")
  const [questionBank, setQuestionBank] = React.useState("")
  const [showModal, setShowModal] = React.useState(false)
  const [newTrainingType, setNewTrainingType] = React.useState("")
  const [trainingData, setTrainingData] = React.useState(INITIAL_TRAINING_DATA)
  const [errorMessage, setErrorMessage] = React.useState("")

  const handleAddTrainingType = () => {
    if (!newTrainingType.trim()) {
      setErrorMessage("Training type cannot be empty")
      return
    }

    // Check if training type already exists (case-insensitive)
    const exists = trainingData.some(
      item => item.type.toLowerCase() === newTrainingType.trim().toLowerCase()
    )

    if (exists) {
      setErrorMessage("Training type already exists")
      return
    }

    // Clear error and add new training type
    setErrorMessage("")
    const newId = Math.max(...trainingData.map(item => item.id)) + 1
    setTrainingData(prev => [...prev, { id: newId, type: newTrainingType.trim() }])
    setNewTrainingType("")
  }

  const handleReset = () => {
    setNewTrainingType("")
    setErrorMessage("")
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setNewTrainingType("")
    setErrorMessage("")
  }

  // Clear error when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTrainingType(e.target.value)
    if (errorMessage) {
      setErrorMessage("")
    }
  }

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
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="h-9 px-6 rounded bg-sky-400 hover:bg-sky-500 text-white font-semibold py-1"
              >
                Add
              </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#212124] rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-sky-600 dark:text-sky-400">Add Training Type</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Add Training Type Form */}
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Training Type: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTrainingType}
                    onChange={handleInputChange}
                    placeholder="Training Type"
                    className={`w-full h-10 px-3 border rounded bg-white dark:bg-[#232326] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
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
                  onClick={handleAddTrainingType}
                  className="h-10 px-6 bg-sky-500 hover:bg-sky-600 text-white rounded font-medium flex items-center gap-2"
                >
                  <span>✓</span> Add
                </button>
                <button
                  onClick={handleReset}
                  className="h-10 px-6 bg-red-500 hover:bg-red-600 text-white rounded font-medium flex items-center gap-2"
                >
                  <span>↻</span> Reset
                </button>
              </div>

              {/* Training Types Table */}
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-[#19191c]">
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left w-12">#</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Training Type</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#232326]">
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
    </div>
  )
}
