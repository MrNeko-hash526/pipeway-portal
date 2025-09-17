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

export default function TrainingQuizzes() {
  const coursesSnapshot = [
    { label: "Courses", value: 24 },
    { label: "Active", value: 18 },
    { label: "Pending", value: 6 },
  ]

  const quizzesSnapshot = [
    { label: "Total Quizzes", value: 72 },
    { label: "Due", value: 8 },
    { label: "Overdue", value: 2 },
  ]

  const assignmentsSnapshot = [
    { label: "Assigned", value: 32 },
    { label: "Completed", value: 20 },
    { label: "Overdue", value: 4 },
  ]

  const sessionsSnapshot = [
    { label: "Upcoming Sessions", value: 5 },
    { label: "Ongoing", value: 2 },
    { label: "Completed", value: 40 },
  ]

  const resultsSnapshot = [
    { label: "Pass", value: 180 },
    { label: "Fail", value: 15 },
    { label: "Pending", value: 12 },
  ]

  const summaryData = [
    { name: "Courses", value: coursesSnapshot[0].value },
    { name: "Quizzes", value: quizzesSnapshot[0].value },
    { name: "Assignments", value: assignmentsSnapshot[0].value },
    { name: "Sessions", value: sessionsSnapshot[0].value },
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

      {/* Top row: single responsive row without horizontal scroller */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Link href="/training-and-test" className="block h-full">
            <MetroCard title="Courses" data={coursesSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/training-and-test/quizzes" className="block h-full">
            <MetroCard title="Quizzes" data={quizzesSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/training-and-test/assignments" className="block h-full">
            <MetroCard title="Assignments" data={assignmentsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/training-and-test/sessions" className="block h-full">
            <MetroCard title="Training Sessions" data={sessionsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/training-and-test/results" className="block h-full">
            <MetroCard title="Results" data={resultsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>
        </div>
      </section>

      {/* Charts at bottom */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Training Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Courses", value: coursesSnapshot[0].value },
                  { name: "Quizzes", value: quizzesSnapshot[0].value },
                  { name: "Assignments", value: assignmentsSnapshot[0].value },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[coursesSnapshot[0], quizzesSnapshot[0], assignmentsSnapshot[0]].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-lg p-4">
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
