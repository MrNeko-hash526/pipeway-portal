"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FlashCardProps {
  title: string
  items: Array<{ label: string; value: string | number }>
  updateInterval?: number
}

export function FlashCard({ title, items, updateInterval = 4000 }: FlashCardProps) {
  const [index, setIndex] = useState(0)
  const [isOutgoing, setIsOutgoing] = useState(false)
  const [isIncoming, setIsIncoming] = useState(false)
  const ANIM_MS = 320
  const prefersReduce = useRef(false)

  useEffect(() => {
    if (items.length <= 1) return
    prefersReduce.current = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReduce.current) {
      const t = setInterval(() => setIndex((p) => (p + 1) % items.length), updateInterval)
      return () => clearInterval(t)
    }

    const interval = setInterval(() => {
      setIsOutgoing(true)
      const swap = window.setTimeout(() => {
        setIndex((p) => (p + 1) % items.length)
        setIsOutgoing(false)
        setIsIncoming(true)
        window.setTimeout(() => setIsIncoming(false), ANIM_MS)
      }, ANIM_MS)

      return () => clearTimeout(swap)
    }, updateInterval)

    return () => clearInterval(interval)
  }, [items.length, updateInterval])

  const current = items[index]

  return (
    <div className="min-w-[200px] max-w-xs">
      <Card className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>

        <div className={cn("transition-opacity duration-300", isOutgoing ? "opacity-0 out-down-rotate" : isIncoming ? "opacity-100 in-up-rotate" : "opacity-100") }>
          <div className="text-lg font-bold">{current?.value}</div>
          <div className="text-xs text-muted-foreground">{current?.label}</div>
        </div>
      </Card>
    </div>
  )
}
