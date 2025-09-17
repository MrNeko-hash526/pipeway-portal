"use client"

import { MetroCard } from "@/components/metro-card"
import { Card } from "@/components/ui/card"
import Link from "@/components/link"

export default function SetupCard() {
  const vendorSnapshot = [
    { label: 'Vendors', value: 42 },
    { label: 'Active', value: 38 },
    { label: 'Pending', value: 4 },
  ]

  const userSnapshot = [
    { label: 'Total Users', value: 1247 },
    { label: 'Active', value: 1180 },
    { label: 'Pending', value: 67 },
  ]

  const userGroupsSnapshot = [
    { label: 'Groups', value: 87 },
    { label: 'With Policies', value: 54 },
    { label: 'No Owners', value: 3 },
  ]

  const riskSnapshot = [
    { label: 'Open Risks', value: 12 },
    { label: 'Mitigated', value: 5 },
    { label: 'Accepted', value: 2 },
  ]

  const standardsSnapshot = [
    { label: 'Standards', value: 29 },
    { label: 'Citations', value: 112 },
    { label: 'Reviews', value: 7 },
  ]

  return (
    <Card className="p-4 min-h-[14rem] flex flex-col">
      <h3 className="text-lg font-semibold mb-1">Setup</h3>
      <p className="text-sm text-muted-foreground mb-3">Core configuration and user management</p>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="h-full overflow-hidden">
            <Link href="/setup/vendor-setup" className="h-full block">
              <MetroCard title="Vendor Setup" data={vendorSnapshot as any} updateInterval={7000} size="medium" />
            </Link>
          </div>
          <div className="h-full overflow-hidden">
            <Link href="/setup/user-setup" className="h-full block">
              <MetroCard title="User Setup" data={userSnapshot as any} updateInterval={7000} size="medium" />
            </Link>
          </div>
          <div className="h-full overflow-hidden">
            <Link href="/setup/user-groups-setup" className="h-full block">
              <MetroCard title="User Groups" data={userGroupsSnapshot as any} updateInterval={7000} size="medium" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-full overflow-hidden">
            <Link href="/setup/risk-management" className="h-full block">
              <MetroCard title="Risk Management" data={riskSnapshot as any} updateInterval={7000} size="medium" />
            </Link>
          </div>
          <div className="h-full overflow-hidden">
            <Link href="/setup/standards-and-citation-management" className="h-full block">
              <MetroCard title="Standards & Citation" data={standardsSnapshot as any} updateInterval={7000} size="medium" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
