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

export default function SetupIndex() {
  const vendorSnapshot = [
    { label: "Vendors", value: 42 },
    { label: "Active", value: 38 },
    { label: "Pending", value: 4 },
  ]

  const userSnapshot = [
    { label: "Total Users", value: 1247 },
    { label: "Active", value: 1180 },
    { label: "Pending", value: 67 },
  ]

  const userGroupsSnapshot = [
    { label: "Groups", value: 87 },
    { label: "With Policies", value: 54 },
    { label: "No Owners", value: 3 },
  ]

  const riskSnapshot = [
    { label: "Open Risks", value: 12 },
    { label: "Mitigated", value: 5 },
    { label: "Accepted", value: 2 },
  ]

  const standardsSnapshot = [
    { label: "Standards", value: 29 },
    { label: "Citations", value: 112 },
    { label: "Reviews", value: 7 },
  ]

  const summaryData = [
    { name: "Vendors", value: vendorSnapshot[0].value },
    { name: "Users", value: userSnapshot[0].value },
    { name: "Groups", value: userGroupsSnapshot[0].value },
    { name: "Standards", value: standardsSnapshot[0].value },
    { name: "Open Risks", value: riskSnapshot[0].value },
  ]

  const barData = summaryData.map((d) => ({ name: d.name, value: d.value }))
  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">Core configuration and user management.</p>
        </div>
      </header>

      {/* Top row: single responsive row without horizontal scroller */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Link href="/setup/vendor-setup" className="block h-full">
            <MetroCard title="Vendors" data={vendorSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/setup/user-setup" className="block h-full">
            <MetroCard title="User Setup" data={userSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/setup/user-groups-setup" className="block h-full">
            <MetroCard title="User Groups" data={userGroupsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/setup/risk-management" className="block h-full">
            <MetroCard title="Risks" data={riskSnapshot as any} updateInterval={7000} size="medium" />
          </Link>

          <Link href="/setup/standards-and-citation-management" className="block h-full">
            <MetroCard title="Standards" data={standardsSnapshot as any} updateInterval={7000} size="medium" />
          </Link>
        </div>
      </section>

      {/* Charts at bottom */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-bg border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Overview Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {summaryData.map((entry, index) => (
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
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Setup Overview */}
      <section className="mt-6">
        
      </section>
    </div>
  )
}
