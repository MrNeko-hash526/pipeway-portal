"use client"

import { MetroCard } from "@/components/metro-card"
import { Card } from "@/components/ui/card"
import Link from "@/components/link"

export default function FlashStrip() {
  // --- snapshot data ---
  const auditSnapshot = [
    { label: "Open Findings", value: 7 },
    { label: "In Progress", value: 2 },
    { label: "Closed", value: 45 },
  ]

  const trainingSnapshot = [
    { label: "Assigned", value: 320 },
    { label: "Completed", value: 287 },
    { label: "Overdue", value: 12 },
  ]

  const certificateSnapshot = [
    { label: "Active", value: 58 },
    { label: "Expiry Soon", value: 10 },
    { label: "Expired", value: 6 },
  ]

  const portfolioSnapshot = [
    { label: "Value", value: "$1,234" },
    { label: "Accounts", value: 1247 },
    { label: "Growth", value: "3.4%" },
  ]

  const policySnapshot = [
    { label: "Active Policies", value: 14 },
    { label: "Pending Reviews", value: 2 },
    { label: "Overdue", value: 1 },
  ]

  // --- setup subpage snapshots ---
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

  const notificationsSnapshot = [
    { label: "New findings assigned", value: 3 },
    { label: "Certs expiring", value: 2 },
    { label: "Training updated", value: "" },
  ]

  const coursesSnapshot = [
    { label: "Courses", value: 24 },
    { label: "Active", value: 20 },
    { label: "Archived", value: 4 },
  ]

  const assessmentsSnapshot = [
    { label: "Open", value: 6 },
    { label: "Completed", value: 198 },
    { label: "Failed", value: 3 },
  ]

  return (
    <div className="w-full py-3">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex flex-col gap-6 px-4 sm:px-8 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
            {/* ---------------- Setup ---------------- */}
            <div className="h-full">
              <Card className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-1">Setup</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Core configuration and user management
                </p>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="h-full overflow-hidden">
                      <Link href="/setup/vendor-setup" className="h-full block">
                        <MetroCard
                          title="Vendor Setup"
                          data={vendorSnapshot as any}
                          updateInterval={7000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/setup/user-setup" className="h-full block">
                        <MetroCard
                          title="User Setup"
                          data={userSnapshot as any}
                          updateInterval={7000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/setup/user-groups-setup" className="h-full block">
                        <MetroCard
                          title="User Groups"
                          data={userGroupsSnapshot as any}
                          updateInterval={7000}
                          size="medium"
                        />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="h-full overflow-hidden">
                      <Link href="/setup/risk-management" className="h-full block">
                        <MetroCard
                          title="Risk Management"
                          data={riskSnapshot as any}
                          updateInterval={7000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link
                        href="/setup/standards-and-citation-management"
                        className="h-full block"
                      >
                        <MetroCard
                          title="Standards & Citation"
                          data={standardsSnapshot as any}
                          updateInterval={7000}
                          size="medium"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ---------------- Audit ---------------- */}
            <div className="h-full">
              <Card className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-1">Audit</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Findings, schedules and compliance reports
                </p>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="h-full overflow-hidden">
                      <Link href="/audit/reports" className="h-full block">
                        <MetroCard
                          title="Findings"
                          data={auditSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/licence-and-certificates" className="h-full block">
                        <MetroCard
                          title="Certificates"
                          data={certificateSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/policy-and-procedures" className="h-full block">
                        <MetroCard
                          title="Policies"
                          data={policySnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="h-full overflow-hidden">
                      <Link href="/audit-management" className="h-full block">
                        <MetroCard
                          title="Schedules"
                          data={auditSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/audit/reports" className="h-full block">
                        <MetroCard
                          title="Reports"
                          data={auditSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ---------------- Training ---------------- */}
            <div className="h-full">
              <Card className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-1">Training</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Courses, assessments and learner progress
                </p>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="h-full overflow-hidden">
                      <Link href="/setup/training-and-test" className="h-full block">
                        <MetroCard
                          title="Assigned"
                          data={trainingSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/licence-and-certificates" className="h-full block">
                        <MetroCard
                          title="Certificates"
                          data={certificateSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/" className="h-full block">
                        <MetroCard
                          title="Portfolio"
                          data={portfolioSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="h-full overflow-hidden">
                      <Link href="/training/quizzes" className="h-full block">
                        <MetroCard
                          title="Courses"
                          data={coursesSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/training/quizzes" className="h-full block">
                        <MetroCard
                          title="Assessments"
                          data={assessmentsSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ---------------- Policy & Certificate (NEW) ---------------- */}
            <div className="h-full">
              <Card className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-1">Policy & Certificate</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Active policies and certification tracking
                </p>
                <div className="flex flex-col gap-3 h-full">
                  <div className="grid grid-cols-1 gap-3 h-full">
                    <div className="h-full overflow-hidden">
                      <Link href="/policy-and-procedures" className="h-full block">
                        <MetroCard
                          title="Policies"
                          data={policySnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Link href="/licence-and-certificates" className="h-full block">
                        <MetroCard
                          title="Certificates"
                          data={certificateSnapshot as any}
                          updateInterval={8000}
                          size="medium"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
