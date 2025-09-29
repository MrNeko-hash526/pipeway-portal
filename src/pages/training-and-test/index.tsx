"use client"

import React from "react"
import Link from "@/components/link"
import { MetroCard } from "@/components/metro-card"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"

export default function TrainingAndTestManagement() {
  const trainingSOP = [
    { label: "Courses", value: 24 },
    { label: "Active", value: 18 },
    { label: "Pending", value: 6 },
  ]

  const questionBankSetup = [
    { label: "Total Quizzes", value: 72 },
    { label: "Due", value: 8 },
    { label: "Overdue", value: 2 },
  ]

  const questionSetup = [
    { label: "Assigned", value: 32 },
    { label: "Completed", value: 20 },
    { label: "Overdue", value: 4 },
  ]

  const testsSetup= [
    { label: "Upcoming Sessions", value: 5 },
    { label: "Ongoing", value: 2 },
    { label: "Completed", value: 40 },
  ]

  const viewTestsSetup = [
    { label: "Pass", value: 180 },
    { label: "Fail", value: 15 },
    { label: "Pending", value: 12 },
  ]

  const summaryData = [
    { name: "Courses", value: trainingSOP[0].value },
    { name: "Quizzes", value: questionBankSetup[0].value },
    { name: "Assignments", value: questionSetup[0].value },
    { name: "Sessions", value: viewTestsSetup[0].value },
  ]

  const barData = summaryData.map((d) => ({ name: d.name, value: d.value }))
  const COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B"]

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Training & Test Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage courses, quizzes and training sessions.</p>
        </div>
      </header>

      {/* Top row: 3 cards */}
      <section className=" mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Link href="/training-and-test/training-sop" className="block h-full">
          <MetroCard title="Training and SOP" data={trainingSOP as any} updateInterval={7000} size="medium" />
        </Link>

        <Link href="/training-and-test/question-bank-setup" className="block h-full">
          <MetroCard title="Question Bank Setup" data={questionBankSetup as any} updateInterval={7000} size="medium" />
        </Link>

        <Link href="/training-and-test/question-setup" className="block h-full">
          <MetroCard title="Question setup" data={questionSetup as any} updateInterval={7000} size="medium" />
        </Link>
      

      {/* Bottom row: centered 2 cards */}
      
        <Link href="/training-and-test/tests-setup" className="block h-full">
          <MetroCard title="Tests Setup" data={viewTestsSetup as any} updateInterval={7000} size="medium" />
        </Link>

        <Link href="/training-and-test/view-tests-setup" className="block h-full">
          <MetroCard title="View Tests Setup" data={testsSetup as any} updateInterval={7000} size="medium" />
        </Link>
        </div>
      </section>

      {/* Charts at bottom */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-bg border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Training Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Courses", value: trainingSOP[0].value },
                  { name: "Quizzes", value: questionBankSetup[0].value },
                  { name: "Assignments", value: questionSetup[0].value },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[
                  { value: trainingSOP[0].value },
                  { value: questionBankSetup[0].value },
                  { value: questionSetup[0].value },
                ].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-bg border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Counts Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}