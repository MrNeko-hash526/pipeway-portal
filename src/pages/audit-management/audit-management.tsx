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

  // pseudo values for "Create Audit Summary" card
  const createSummarySnapshot = [
    { label: "Audits Reviewed", value: 12 },
    { label: "Findings", value: 29 },
    { label: "Recommendations", value: 7 },
  ]

  // desired action cards (in order). Will reuse existing snapshot data when available.
  const desiredCards = [
    { title: "Questions Setup", href: "/audit-management/questions-setup" },
    { title: "Question Groups Setup", href: "/audit-management/question-groups-setup" },
    { title: "Audit Assignments", href: "/audit-management/assignments" },
    { title: "View Vendor Response", href: "/audit-management/vendor-responses" },
    { title: "Respond to Vendor Response", href: "/audit-management/respond-vendor" },
    { title: "Create Audit Summary", href: "/audit-management/create-summary" },
  ]

  const dataSources = [
    auditsSnapshot,
    findingsSnapshot,
    scheduleSnapshot,
    remediationSnapshot,
    reportsSnapshot,
    createSummarySnapshot,
  ]

  // detect dark mode (uses html.dark class or prefers-color-scheme)
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) return true
    if (typeof window !== "undefined" && window.matchMedia) return window.matchMedia("(prefers-color-scheme: dark)").matches
    return false
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const mm = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const cur = (document.documentElement?.classList.contains("dark")) || mm.matches
      setIsDark(!!cur)
    }
    const obs = new MutationObserver(() => onChange())
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    if (mm.addEventListener) mm.addEventListener("change", onChange)
    else mm.addListener(onChange)
    return () => {
      obs.disconnect()
      if (mm.removeEventListener) mm.removeEventListener("change", onChange)
      else mm.removeListener(onChange)
    }
  }, [])

  // tooltip / legend styles depending on theme
  const tooltipContentStyle = isDark
    ? { backgroundColor: "rgba(0,0,0,0.92)", color: "#fff", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 8 }
    : { backgroundColor: "#fff", color: "#111827", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 8, padding: 8 }

  const tooltipItemStyle = isDark ? { color: "#fff" } : { color: "#111827" }
  const tooltipLabelStyle = isDark ? { color: "#fff", fontWeight: 600 } : { color: "#111827", fontWeight: 600 }
  const legendWrapperStyle = isDark ? { color: "#fff" } : { color: "#111827" }
  const gridStroke = isDark ? "#2b3036" : "#e6e6e6"

  return (
    <div className="min-h-[72vh] max-w-7xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage audits, schedules and findings.</p>
        </div>
      </header>

      {/* Top row: render desired action cards. reuse available snapshots, append empty data for extras */}
      <section className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {desiredCards.map((card, idx) => {
            const data = dataSources[idx] ?? []
            return (
              <Link key={card.title} href={card.href} className="block h-full">
                <MetroCard title={card.title} data={data as any} updateInterval={7000} size="medium" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* Charts at bottom */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-bg border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Findings Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
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
                {[findingsSnapshot[0], findingsSnapshot[1], findingsSnapshot[2]].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#0EA5A4", "#2563EB", "#F59E0B"][index % 3]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-bg border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Counts Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dataSources.map((d, i) => ({ name: ["Audits","Findings","Schedules","Remediation","Reports","Create Summary"][i], value: d[0]?.value ?? 0 }))}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Legend wrapperStyle={legendWrapperStyle} />
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
