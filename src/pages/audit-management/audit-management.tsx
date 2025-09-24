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

export default function AuditManagement() {
  const auditsSnapshot = [
    { label: "Total Audits", value: 48 },
    { label: "Active", value: 12 },
    { label: "Scheduled", value: 8 },
  ]

  const findingsSnapshot = [
    { label: "Open Findings", value: 14 },
    { label: "Critical", value: 3 },
    { label: "Resolved", value: 27 },
  ]

  const scheduleSnapshot = [
    { label: "Upcoming", value: 8 },
    { label: "Overdue", value: 2 },
    { label: "Completed", value: 38 },
  ]

  const remediationSnapshot = [
    { label: "Pending Remediations", value: 6 },
    { label: "In Progress", value: 4 },
    { label: "Completed", value: 22 },
  ]

  const reportsSnapshot = [
    { label: "Monthly", value: 4 },
    { label: "Quarterly", value: 2 },
    { label: "Annual", value: 1 },
  ]

  const summaryData = [
    { name: "Audits", value: auditsSnapshot[0].value },
    { name: "Findings", value: findingsSnapshot[0].value },
    { name: "Schedules", value: scheduleSnapshot[0].value },
    { name: "Remediations", value: remediationSnapshot[0].value },
    { name: "Reports", value: reportsSnapshot[0].value },
  ]

  const barData = summaryData.map((d) => ({ name: d.name, value: d.value }))
  const COLORS = ["#0EA5A4", "#2563EB", "#F59E0B", "#EF4444", "#7C3AED"]

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage audits, schedules and findings.</p>
        </div>
      </header>

      {/* Top row: single responsive row with 5 cards (no horizontal scroller) */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Link href="/audit-management" className="block h-full">
            <MetroCard title="Audits" data={auditsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/audit/reports" className="block h-full">
            <MetroCard title="Findings" data={findingsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/audit/schedules" className="block h-full">
            <MetroCard title="Schedules" data={scheduleSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/audit/remediation" className="block h-full">
            <MetroCard title="Remediation" data={remediationSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/audit/reports" className="block h-full">
            <MetroCard title="Reports" data={reportsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>
        </div>
      </section>

      {/* Charts at bottom */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-bg border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Findings Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Open", value: findingsSnapshot[0].value },
                  { name: "Critical", value: findingsSnapshot[1].value },
                  { name: "Resolved", value: findingsSnapshot[2].value },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[
                  findingsSnapshot[0],
                  findingsSnapshot[1],
                  findingsSnapshot[2],
                ].map((entry, index) => (
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
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
