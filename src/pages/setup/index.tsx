"use client"

import React, { useEffect, useState, useCallback } from "react"
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
import { RefreshCw, AlertTriangle, TrendingUp, Users, Building2, Shield, FileText } from "lucide-react"

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
  categories: { total: number; active: number }
  titles: { total: number; active: number }
  citations: { total: number; active: number }
}

export default function SetupIndex() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadDashboardStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const res = await fetch(`${API_BASE}/api/setup/dashboard/stats`)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      
      if (data.success) {
        setStats(data.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(data.error || 'Failed to load dashboard stats')
      }
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        loadDashboardStats(true)
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [loadDashboardStats, loading, refreshing])

  const handleRefresh = () => {
    loadDashboardStats(true)
  }

  if (loading && !stats) {
    return (
      <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 dark:text-slate-300 text-lg">Loading dashboard...</div>
          <div className="text-sm text-slate-500 mt-2">Fetching latest statistics</div>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-4 text-lg font-medium">Dashboard Error</div>
          <div className="text-slate-600 mb-6">{error}</div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Retrying...' : 'Retry'}
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
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Data
          </button>
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
    { label: "Citations", value: stats.citations.total },
  ]

  // Only show items with data for charts
  const summaryData = [
    { name: "Vendors", value: stats.vendors.total },
    { name: "Users", value: stats.users.total },
    { name: "Groups", value: stats.userGroups.total },
    { name: "Standards", value: stats.standards.total },
    { name: "Risks", value: stats.risks.total },
    { name: "Citations", value: stats.citations.total },
  ].filter(item => item.value > 0)

  const barData = summaryData.map((d) => ({ name: d.name, value: d.value }))
  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  // Calculate totals for overview
  const totalRecords = stats.vendors.total + stats.users.total + stats.userGroups.total + stats.risks.total + stats.standards.total + stats.citations.total
  const totalActive = stats.vendors.active + stats.users.active + stats.userGroups.active + stats.risks.active + stats.standards.active + stats.citations.active

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header with improved styling */}
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Setup Dashboard</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Core configuration and user management overview
            {lastUpdated && (
              <span className="ml-2 text-xs text-slate-500">
                • Last updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {/* Error banner if there's an error but we have cached data */}
      {error && stats && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-red-800 font-medium">Warning</div>
              <div className="text-red-700 text-sm">{error}. Showing cached data.</div>
            </div>
            <button 
              onClick={handleRefresh}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Metro Cards Section with enhanced styling */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Link href="/setup/vendor-setup" className="block h-full group">
            <div className="relative overflow-hidden rounded-lg transition-transform group-hover:scale-105">
              <MetroCard title="Vendors" data={vendorSnapshot as any} updateInterval={7000} size="medium" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Building2 className="w-5 h-5 text-white/80" />
              </div>
            </div>
          </Link>

          <Link href="/setup/user-setup" className="block h-full group">
            <div className="relative overflow-hidden rounded-lg transition-transform group-hover:scale-105">
              <MetroCard title="User Setup" data={userSnapshot as any} updateInterval={7000} size="medium" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Users className="w-5 h-5 text-white/80" />
              </div>
            </div>
          </Link>

          <Link href="/setup/user-groups-setup" className="block h-full group">
            <div className="relative overflow-hidden rounded-lg transition-transform group-hover:scale-105">
              <MetroCard title="User Groups" data={userGroupsSnapshot as any} updateInterval={7000} size="medium" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Users className="w-5 h-5 text-white/80" />
              </div>
            </div>
          </Link>

          <Link href="/setup/risk-management" className="block h-full group">
            <div className="relative overflow-hidden rounded-lg transition-transform group-hover:scale-105">
              <MetroCard title="Risk Management" data={riskSnapshot as any} updateInterval={7000} size="medium" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Shield className="w-5 h-5 text-white/80" />
              </div>
            </div>
          </Link>

          <Link href="/setup/standards-and-citation-management" className="block h-full group">
            <div className="relative overflow-hidden rounded-lg transition-transform group-hover:scale-105">
              <MetroCard title="Standards" data={standardsSnapshot as any} updateInterval={7000} size="medium" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <FileText className="w-5 h-5 text-white/80" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Charts Section - only show if we have data */}
      {summaryData.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Overview Distribution
            </h3>
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
                  labelLine={false}
                >
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Module Counts
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#4F46E5" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Enhanced Setup Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Risk Management</h4>
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Active Risk Entries</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.risks.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Active Criteria</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.criteria.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Risk Levels</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.levels.active}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">User Management</h4>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Active Users</span>
                <span className="font-semibold text-green-600">{stats.users.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">User Groups</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.userGroups.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Pending Users</span>
                <span className={`font-semibold ${stats.users.pending > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {stats.users.pending}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Standards & Content</h4>
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Total Standards</span>
                <span className="font-semibold text-green-600">{stats.standards.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Active Citations</span>
                <span className="font-semibold text-green-600">{stats.citations.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Total Citations</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.citations.total}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty state message if no data */}
      {summaryData.length === 0 && (
        <section className="text-center py-12">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 border-2 border-dashed border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-600 dark:text-slate-300 mb-2 text-lg font-medium">No Setup Data Found</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Start by adding vendors, users, or other setup items to see dashboard statistics and insights.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
