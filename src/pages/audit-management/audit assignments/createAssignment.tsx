"use client"

import React from "react"
import Link from "@/components/link"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

type FormValues = {
  questionGroup: string
  organization: string
  deadline: string
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

const schema = yup
  .object({
    questionGroup: yup.string().trim().required("Question group is required"),
    organization: yup.string().trim().required("Organization is required"),
    // accept ISO date string from <input type="date">, ensure valid and not in the past
    deadline: yup
      .string()
      .required("Deadline is required")
      .test("is-valid-date", "Invalid date", (val) => {
        if (!val) return false
        const d = new Date(val)
        return !isNaN(d.getTime())
      })
      .test("not-in-past", "Deadline cannot be in the past", (val) => {
        if (!val) return false
        const d = new Date(val)
        d.setHours(0, 0, 0, 0)
        return d >= TODAY
      }),
  })
  .required() as yup.ObjectSchema<FormValues>

export default function CreateAssignment() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      questionGroup: "",
      organization: "",
      deadline: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    // placeholder: send to API
    console.log("Create assignment", data)
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
            <input
              {...register("deadline")}
              type="date"
              className={`w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6] ${errors.deadline ? "border-rose-500" : ""}`}
            />
            {errors.deadline && <div className="text-rose-600 text-sm mt-1">{errors.deadline.message}</div>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700"
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
    </div>
  )
}