import React from "react"
import Link from "@/components/link"
import { useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type FormValues = {
  questionGroup: string
  organization: string
  deadline: Date | null
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

const schema = yup
  .object({
    questionGroup: yup.string().trim().required("Question group is required"),
    organization: yup.string().trim().required("Organization is required"),
    deadline: yup
      .date()
      .required("Deadline is required")
      .min(TODAY, "Deadline cannot be in the past"),
  })
  .required() as yup.ObjectSchema<FormValues>

export default function CreateAssignment() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      questionGroup: "",
      organization: "",
      deadline: null,
    },
  })

  const onSubmit = async (data: FormValues) => {
    // Convert date to American format for API or display
    const formattedData = {
      ...data,
      deadline: data.deadline ? data.deadline.toLocaleDateString('en-US') : null
    }
    console.log("Create assignment", formattedData)
    // simulate success and navigate back
    window.location.href = "/audit-management/assignments"
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Create Assignment</h1>
        <Link href="/audit-management/assignments" className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400">
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-[rgb(33,33,36)] border border-border rounded p-6">
        <div className="grid grid-cols-12 gap-4 items-center mb-4">
          <label className="col-span-2 text-sm">Question Group:*</label>
          <div className="col-span-10">
            <select
              {...register("questionGroup")}
              className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.questionGroup ? "border-rose-500" : ""}`}
            >
              <option value="">Select Question Group...</option>
              <option value="group-1">Governance - Group 1</option>
              <option value="group-2">Operations - Group 2</option>
              <option value="group-3">Security - Group 3</option>
            </select>
            {errors.questionGroup && <div className="text-rose-600 text-sm mt-1">{errors.questionGroup.message}</div>}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center mb-4">
          <label className="col-span-2 text-sm">Organization:*</label>
          <div className="col-span-10">
            <select
              {...register("organization")}
              className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.organization ? "border-rose-500" : ""}`}
            >
              <option value="">None selected</option>
              <option value="aacanet">AACANet (organization)</option>
              <option value="mendelson">Mendelson Law Offices</option>
              <option value="heavner">Heavner, Beyers & Mihlar, LLC</option>
            </select>
            {errors.organization && <div className="text-rose-600 text-sm mt-1">{errors.organization.message}</div>}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center mb-6">
          <label className="col-span-2 text-sm">Deadline:*</label>
          <div className="col-span-10">
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="MM/DD/YYYY"
                  minDate={new Date()}
                  className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.deadline ? "border-rose-500" : ""}`}
                  calendarClassName="bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg"
                  dayClassName={(date) => 
                    date < TODAY 
                      ? "text-gray-300 cursor-not-allowed" 
                      : "text-gray-900 dark:text-gray-100 hover:bg-blue-500 hover:text-white cursor-pointer"
                  }
                />
              )}
            />
            {errors.deadline && <div className="text-rose-600 text-sm mt-1">{errors.deadline.message}</div>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-rose-400 text-white hover:bg-rose-500"
          >
            Reset
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />
    </div>
  )
}