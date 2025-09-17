"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Download, ArrowUpDown } from "lucide-react"

const accountsData = [
  {
    id: "ACC-001",
    clientName: "John Smith",
    balance: 2450.0,
    status: "Active",
    lastPayment: "2024-01-15",
    daysOverdue: 45,
    attorney: "Johnson & Associates",
  },
  {
    id: "ACC-002",
    clientName: "Sarah Johnson",
    balance: 1875.5,
    status: "In Suit",
    lastPayment: "2023-12-08",
    daysOverdue: 78,
    attorney: "Legal Partners LLC",
  },
  {
    id: "ACC-003",
    clientName: "Michael Brown",
    balance: 3200.75,
    status: "Served",
    lastPayment: "2024-02-01",
    daysOverdue: 32,
    attorney: "Smith Law Firm",
  },
  {
    id: "ACC-004",
    clientName: "Emily Davis",
    balance: 950.25,
    status: "Judgment",
    lastPayment: "2023-11-22",
    daysOverdue: 95,
    attorney: "Johnson & Associates",
  },
  {
    id: "ACC-005",
    clientName: "Robert Wilson",
    balance: 4100.0,
    status: "Active",
    lastPayment: "2024-01-28",
    daysOverdue: 28,
    attorney: "Legal Partners LLC",
  },
]

export function ClientAccountTracker() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "In Suit":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Served":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Judgment":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const filteredAccounts = accountsData.filter((account) => {
    const matchesSearch =
      account.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || account.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <section id="accounts" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Account Tracker</h2>
          <p className="text-muted-foreground">Monitor and manage client accounts efficiently</p>
        </div>
        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Accounts
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name or account ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="In Suit">In Suit</SelectItem>
                <SelectItem value="Served">Served</SelectItem>
                <SelectItem value="Judgment">Judgment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold">
                      Account ID
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold">
                      Client Name
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold">
                      Balance
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead className="text-right">Days Overdue</TableHead>
                  <TableHead>Attorney</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{account.id}</TableCell>
                    <TableCell>{account.clientName}</TableCell>
                    <TableCell className="text-right font-medium">${account.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                    </TableCell>
                    <TableCell>{account.lastPayment}</TableCell>
                    <TableCell className="text-right">
                      <span className={account.daysOverdue > 60 ? "text-destructive font-medium" : ""}>
                        {account.daysOverdue} days
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{account.attorney}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No accounts found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
