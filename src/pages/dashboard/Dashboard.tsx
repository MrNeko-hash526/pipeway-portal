"use client"

import React from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MetroCard } from "@/components/metro-card"
import Link from "@/components/link"
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import NotificationCard from "@/components/notification-card"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// add small SVG icon components for card headings
const IconPie = ({ className = "inline-block mr-2", size = 18 }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M11 2v11H2A10 10 0 0111 2z" fill="#FF8042" />
    <path d="M13 2a10 10 0 109.95 9H13V2z" fill="#0088FE" />
  </svg>
)

const IconBars = ({ className = "inline-block mr-2", size = 18 }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="10" width="4" height="10" rx="1" fill="#00C49F" />
    <rect x="10" y="6" width="4" height="14" rx="1" fill="#0088FE" />
    <rect x="17" y="2" width="4" height="18" rx="1" fill="#FFBB28" />
  </svg>
)

const IconList = ({ className = "inline-block mr-2", size = 18 }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="5" cy="6" r="2" fill="#7c3aed" />
    <rect x="9" y="5" width="12" height="2" rx="1" fill="#94a3b8" />
    <circle cx="5" cy="12" r="2" fill="#f59e0b" />
    <rect x="9" y="11" width="12" height="2" rx="1" fill="#94a3b8" />
    <circle cx="5" cy="18" r="2" fill="#10b981" />
    <rect x="9" y="17" width="12" height="2" rx="1" fill="#94a3b8" />
  </svg>
)

export default function Dashboard() {
    // initial datasets (kept small and meaningful)
    const [auditSummary, setAuditSummary] = React.useState(() => [
        { label: "Open", value: 8 },
        { label: "In Progress", value: 4 },
        { label: "Closed", value: 14 },
    ])

    const [certificateSummary, setCertificateSummary] = React.useState(() => [
        { label: "Active", value: 78 },
        { label: "Renewal Need", value: 12 },
        { label: "Expired", value: 8 },
        { label: "Pending", value: 5 },
    ])

    const [notificationsSummary, setNotificationsSummary] = React.useState(() => [
        { label: "New Findings", value: 6 },
        { label: "Certs Expiring", value: 4 },
        { label: "Training Updated", value: 2 },
    ])

    const [monthlyTrend, setMonthlyTrend] = React.useState(() => [
        { month: "Jan", value: 40 },
        { month: "Feb", value: 55 },
        { month: "Mar", value: 50 },
        { month: "Apr", value: 70 },
        { month: "May", value: 65 },
        { month: "Jun", value: 85 },
    ])

    const [responseByTitle, setResponseByTitle] = React.useState(() => [
        { title: "Finance", Yes: 30, "In Progress": 8, No: 5, "N/A": 2, Unanswered: 1 },
        { title: "Operations", Yes: 45, "In Progress": 5, No: 6, "N/A": 3, Unanswered: 2 },
        { title: "IT", Yes: 25, "In Progress": 10, No: 4, "N/A": 5, Unanswered: 3 },
        { title: "HR", Yes: 20, "In Progress": 6, No: 2, "N/A": 1, Unanswered: 0 },
    ])

    // derived "Setup Highlights" state (keeps in sync with summaries)
    const computeSetupHighlights = React.useCallback(() => {
        return [
            { label: "Open Audits", value: auditSummary.find(x => x.label === "Open")?.value ?? 0 },
            { label: "Certs Renewal", value: certificateSummary.find(x => x.label === "Renewal Need")?.value ?? 0 },
            { label: "Pending Notifications", value: notificationsSummary.reduce((s, n) => s + n.value, 0) },
        ]
    }, [auditSummary, certificateSummary, notificationsSummary])

    const [setupHighlights, setSetupHighlights] = React.useState(() => computeSetupHighlights())

    // helper: jitter numeric values +-30% and keep ints
    const jitterValue = (v: number, min = 0) => {
        if (typeof v !== "number") return v
        const factor = 0.7 + Math.random() * 0.6 // 0.7..1.3
        return Math.max(min, Math.round(v * factor))
    }

    // every 8s randomize metro card data (and related charts) to simulate dynamic updates
    React.useEffect(() => {
        const id = setInterval(() => {
            setAuditSummary(prev => prev.map(p => ({ ...p, value: jitterValue(p.value) })))
            setCertificateSummary(prev => prev.map(p => ({ ...p, value: jitterValue(p.value) })))
            setNotificationsSummary(prev => prev.map(p => ({ ...p, value: jitterValue(p.value, 0) })))
            setMonthlyTrend(prev => prev.map(p => ({ ...p, value: jitterValue(p.value, 0) })))
            setResponseByTitle(prev =>
                prev.map(row => ({
                    ...row,
                    Yes: jitterValue(row.Yes, 0),
                    "In Progress": jitterValue(row["In Progress"], 0),
                    No: jitterValue(row.No, 0),
                    "N/A": jitterValue(row["N/A"], 0),
                    Unanswered: jitterValue(row.Unanswered, 0),
                }))
            )
            // recompute highlights based on newly-set summaries (use small timeout to read the latest states reliably)
            setTimeout(() => setSetupHighlights(computeSetupHighlights()), 50)
        }, 8000)

        return () => clearInterval(id)
    }, [computeSetupHighlights])

    // detect dark mode (respect page's .dark class and prefers-color-scheme)
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
      // observe class changes on <html> so toggling Tailwind dark class updates UI immediately
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

    const tooltipContentStyle = isDark
      ? { backgroundColor: "rgba(0,0,0,0.92)", color: "#fff", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 10 }
      : { backgroundColor: "#fff", color: "#111827", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 8, padding: 10 }

    const tooltipItemStyle = isDark ? { color: "#fff" } : { color: "#111827" }
    const tooltipLabelStyle = isDark ? { color: "#fff", fontWeight: 600 } : { color: "#111827", fontWeight: 600 }
    const legendWrapperStyle = isDark ? { color: "#fff" } : { color: "#111827" }

    return (
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-4">
            <div className="mb-4">
                <h1 className="text-2xl font-semibold">Dashboard — Key Summary</h1>
                <p className="text-sm text-muted-foreground">
                    Important information from Setup, Audit, Certificates, and Notifications.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                {/* Clickable Audit Card */}
                <Link href="/audit-management" className="block rounded transition-colors hover:bg-white hover:text-black dark:hover:bg-[rgb(33,33,36)] dark:hover:text-[#e6e6e6] group cursor-pointer">
                    <div className="relative">
                        <MetroCard
                            title={<div className="flex items-center"><IconPie /> <span>Audit</span></div>}
                            data={auditSummary as any}
                            updateInterval={8000}
                            size="medium"
                        />
                        <div className="absolute inset-0 bg-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="bg-white dark:bg-slate-800 px-3 py-1 rounded-md shadow-lg text-sm font-medium">
                                View Audit Management
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Clickable Certificate Card */}
                <Link href="/licence-and-certificates" className="block rounded transition-colors hover:bg-white hover:text-black dark:hover:bg-[rgb(33,33,36)] dark:hover:text-[#e6e6e6] group cursor-pointer">
                    <div className="relative">
                        <MetroCard
                            title={<div className="flex items-center"><IconBars /> <span>Certificate</span></div>}
                            data={certificateSummary as any}
                            updateInterval={8000}
                            size="medium"
                        />
                        <div className="absolute inset-0 bg-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="bg-white dark:bg-slate-800 px-3 py-1 rounded-md shadow-lg text-sm font-medium">
                                View Certificates
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Non-clickable Notifications Card */}
                <div className="rounded transition-colors hover:bg-white hover:text-black dark:hover:bg-[rgb(33,33,36)] dark:hover:text-[#e6e6e6]">
                    <MetroCard
                        title={<div className="flex items-center"><IconList /> <span>Notifications</span></div>}
                        data={notificationsSummary as any}
                        updateInterval={8000}
                        size="medium"
                    />
                </div>

                {/* Non-clickable Setup Highlights Card */}
                <div className="rounded transition-colors hover:bg-white hover:text-black dark:hover:bg-[rgb(33,33,36)] dark:hover:text-[#e6e6e6]">
                    <MetroCard
                        title={<div className="flex items-center"><IconBars /> <span>Setup Highlights</span></div>}
                        data={setupHighlights as any}
                        updateInterval={8000}
                        size="medium"
                    />
                </div>
             </div>
             
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="group rounded">
                    <Card className="bg-slate-50 dark:bg-slate-800 group-hover:bg-white group-hover:text-black dark:group-hover:bg-[rgb(33,33,36)] dark:group-hover:text-[#e6e6e6] transition-colors">
                      <CardHeader>
                          <CardTitle><IconPie /> Auditor Finding Summary</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Tooltip
                                  formatter={(v: any) => [v, "Count"]}
                                  contentStyle={tooltipContentStyle}
                                  itemStyle={tooltipItemStyle}
                                  labelStyle={tooltipLabelStyle}
                                  wrapperStyle={{ zIndex: 9999 }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={legendWrapperStyle} />
                                <Pie
                                    data={auditSummary}
                                    cx="50%"
                                    cy="45%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={90}
                                    innerRadius={35}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {auditSummary.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                     </CardContent>
                </Card>
                </div>

                <div className="group rounded">
                    <Card className="bg-slate-50 dark:bg-slate-800 group-hover:bg-white group-hover:text-black dark:group-hover:bg-[rgb(33,33,36)] dark:group-hover:text-[#e6e6e6] transition-colors">
                      <CardHeader>
                          <CardTitle><IconBars /> Organization Response Summary</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={notificationsSummary} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} wrapperStyle={{ zIndex: 9999 }} />
                                <Legend wrapperStyle={legendWrapperStyle} />
                                <Bar dataKey="value" fill="#8884d8" barSize={36} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                     </CardContent>
                </Card>
                </div>
             </div>

            {/* Response by Title Chart */}
            <div className="mt-6">
                <div className="group rounded">
                    <Card className="bg-slate-50 dark:bg-slate-800 group-hover:bg-white group-hover:text-black dark:group-hover:bg-[rgb(33,33,36)] dark:group-hover:text-[#e6e6e6] transition-colors">
                      <CardHeader>
                          <CardTitle><IconList /> Response by Title</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ResponsiveContainer width="100%" height={420}>
                            <BarChart data={responseByTitle} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="title" interval={0} angle={-20} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip contentStyle={tooltipContentStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} wrapperStyle={{ zIndex: 9999 }} />
                                <Legend wrapperStyle={legendWrapperStyle} />
                                <Bar dataKey="Yes" stackId="a" fill="#0088FE" />
                                <Bar dataKey="In Progress" stackId="a" fill="#00C49F" />
                                <Bar dataKey="No" stackId="a" fill="#FFBB28" />
                                <Bar dataKey="N/A" stackId="a" fill="#FF8042" />
                                <Bar dataKey="Unanswered" stackId="a" fill="#8884D8" />
                            </BarChart>
                        </ResponsiveContainer>
                     </CardContent>
                </Card>
                </div>
             </div>
        </div>
    )
}

