"use client"

import { MetroCard } from "./metro-card"

type Props = { messages?: string[]; updateInterval?: number }

export default function NotificationCard({ messages = [], updateInterval = 3500 }: Props) {
  // Map messages into the MetroCard data shape. Each message will appear as the label
  // with a short index-based value to keep the visual hierarchy similar to other MetroCards.
  const data = messages.length
    ? messages.map((m, i) => ({ label: m, value: `#${i + 1}`, trend: undefined }))
    : [{ label: "No notifications", value: "—" }]

  return (
    <MetroCard title="Notifications" data={data} updateInterval={updateInterval} size="medium" className="h-full" />
  )
}
