"use client"

import React, { useEffect, useState } from "react"
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

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

type DashboardStats = {
  vendors: { total: number; active: number; pending: number; inactive: number }
  users: { total: number; active: number; pending: number; inactive: number }
  userGroups: { total: number; active: number; inactive: number }
  risks: { total: number; active: number; inactive: number }
  standards: { total: number; active: number; inactive: number }
  criteria: { total: number; active: number }
  levels: { total: number; active: number }
}

export default function SetupIndex() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/setup/dashboard/stats`)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success) {
        setStats(data.data)
      } else {
        throw new Error(data.error || 'Failed to load dashboard stats')
      }
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-300">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-red-600">Error: {error}</div>
          <button 
            onClick={loadDashboardStats}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-300">No data available</div>
        </div>
      </div>
    )
  }

  const vendorSnapshot = [
    { label: "Vendors", value: stats.vendors.total },
    { label: "Active", value: stats.vendors.active },
    { label: "Pending", value: stats.vendors.pending },
  ]

  const userSnapshot = [
    { label: "Total Users", value: stats.users.total },
    { label: "Active", value: stats.users.active },
    { label: "Pending", value: stats.users.pending },
  ]

  const userGroupsSnapshot = [
    { label: "Groups", value: stats.userGroups.total },
    { label: "Active", value: stats.userGroups.active },
    { label: "Inactive", value: stats.userGroups.inactive },
  ]

  const riskSnapshot = [
    { label: "Risk Entries", value: stats.risks.total },
    { label: "Active", value: stats.risks.active },
    { label: "Criteria", value: stats.criteria.active },
  ]

  const standardsSnapshot = [
    { label: "Standards", value: stats.standards.total },
    { label: "Active", value: stats.standards.active },
    { label: "Inactive", value: stats.standards.inactive },
  ]

  const summaryData = [
    { name: "Vendors", value: stats.vendors.total },
    { name: "Users", value: stats.users.total },
    { name: "Groups", value: stats.userGroups.total },
    { name: "Standards", value: stats.standards.total },
    { name: "Risks", value: stats.risks.total },
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
        <button 
          onClick={loadDashboardStats}
          className="px-3 py-1 text-sm border rounded hover:bg-muted/50"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
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
            <MetroCard title="Risk Management" data={riskSnapshot as any} updateInterval={7000} size="medium" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Risk Management Entries</span>
                <span className="font-medium">{stats.risks.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Criteria</span>
                <span className="font-medium">{stats.criteria.active}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Levels</span>
                <span className="font-medium">{stats.levels.active}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">User Management</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Users</span>
                <span className="font-medium">{stats.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span>User Groups</span>
                <span className="font-medium">{stats.userGroups.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Users</span>
                <span className="font-medium text-amber-600">{stats.users.pending}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">System Health</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Active Vendors</span>
                <span className="font-medium text-green-600">{stats.vendors.active}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Standards</span>
                <span className="font-medium text-green-600">{stats.standards.active}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Items</span>
                <span className="font-medium text-amber-600">{stats.vendors.pending + stats.users.pending}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
