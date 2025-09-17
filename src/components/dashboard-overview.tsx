"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MetroCard } from "@/components/metro-card"

const inventoryData = [
  { month: "2024-01", placed: 120, suit: 45, served: 78, judg: 23 },
  { month: "2024-02", placed: 135, suit: 52, served: 89, judg: 31 },
  { month: "2024-03", placed: 148, suit: 61, served: 95, judg: 38 },
  { month: "2024-04", placed: 162, suit: 68, served: 102, judg: 42 },
  { month: "2024-05", placed: 178, suit: 75, served: 118, judg: 48 },
  { month: "2024-06", placed: 195, suit: 82, served: 134, judg: 55 },
]

const suitStatusData = [
  { name: "Suit", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Served", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Judg", value: 37, color: "hsl(var(--chart-3))" },
]

export function DashboardOverview() {
  const portfolioData = [
    { label: "Total Portfolio Value", value: "$2,847,392", trend: "up" as const },
    { label: "Monthly Growth", value: "+12.5%", trend: "up" as const },
    { label: "YTD Performance", value: "+24.8%", trend: "up" as const },
  ]

  const accountsData = [
    { label: "Active Accounts", value: "1,247", trend: "down" as const },
    { label: "New This Month", value: "89", trend: "up" as const },
    { label: "Resolved", value: "156", trend: "up" as const },
  ]

  const collectionsData = [
    { label: "Collections This Month", value: "$184,592", trend: "up" as const },
    { label: "Recovery Rate", value: "68.4%", trend: "up" as const },
    { label: "Avg Collection", value: "$1,482", trend: "neutral" as const },
  ]

  const resolutionData = [
    { label: "Avg Resolution Time", value: "42 days", trend: "down" as const },
    { label: "Fastest Resolution", value: "12 days", trend: "neutral" as const },
    { label: "Success Rate", value: "74.2%", trend: "up" as const },
  ]

  return (
    <section id="dashboard" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Welcome back, Sid</h1>
          <p className="text-muted-foreground mt-2">Here's an overview of your debt collection portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetroCard title="Portfolio" data={portfolioData} updateInterval={4000} size="medium" />

        <MetroCard title="Accounts" data={accountsData} updateInterval={3500} size="medium" />

        <MetroCard title="Collections" data={collectionsData} updateInterval={4500} size="medium" />

        <MetroCard title="Resolution" data={resolutionData} updateInterval={3000} size="medium" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory Snapshot</CardTitle>
            <Badge variant="secondary">Last 6 months</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                placed: { label: "Placed", color: "hsl(var(--chart-1))" },
                suit: { label: "Suit", color: "hsl(var(--chart-2))" },
                served: { label: "Served", color: "hsl(var(--chart-3))" },
                judg: { label: "Judg", color: "hsl(var(--chart-4))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="placed" stackId="a" fill="var(--color-placed)" />
                  <Bar dataKey="suit" stackId="a" fill="var(--color-suit)" />
                  <Bar dataKey="served" stackId="a" fill="var(--color-served)" />
                  <Bar dataKey="judg" stackId="a" fill="var(--color-judg)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Suit Status Distribution</CardTitle>
            <Badge variant="secondary">Current</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                suit: { label: "Suit", color: "hsl(var(--chart-1))" },
                served: { label: "Served", color: "hsl(var(--chart-2))" },
                judg: { label: "Judg", color: "hsl(var(--chart-3))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={suitStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {suitStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {suitStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
