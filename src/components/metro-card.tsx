"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetroCardProps {
  title: ReactNode
  data: Array<{
    label: string
    value: string | number
    trend?: "up" | "down" | "neutral"
    color?: string
  }>
  subCards?: Array<{
    title: string
    data: Array<{ label: string; value: string | number }>
  }>
  updateInterval?: number
  className?: string
  size?: "small" | "medium" | "large"
}

export function MetroCard({ title, data, updateInterval = 8000, className, size = "medium", subCards = [] }: MetroCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isIncoming, setIsIncoming] = useState(false)
  const swapTimeout = useRef<number | null>(null)
  const incomingTimeout = useRef<number | null>(null)
  const prefersReduce = useRef(false)
  const ANIM_MS = 320

  useEffect(() => {
    if (data.length <= 1) return

    // detect reduced motion preference
    prefersReduce.current = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReduce.current) {
      // simple swap without animations
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % data.length)
      }, updateInterval)
      return () => clearInterval(interval)
    }

    const interval = setInterval(() => {
      // trigger exit animation
      setIsTransitioning(true)

      // after exit completes, swap data and trigger incoming animation
      swapTimeout.current = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % data.length)
        setIsTransitioning(false)
        setIsIncoming(true)

        // clear incoming state after its animation finishes
        incomingTimeout.current = window.setTimeout(() => setIsIncoming(false), ANIM_MS)
      }, ANIM_MS)
    }, updateInterval)

    return () => {
      clearInterval(interval)
      if (swapTimeout.current) clearTimeout(swapTimeout.current)
      if (incomingTimeout.current) clearTimeout(incomingTimeout.current)
    }
  }, [data.length, updateInterval])

  // animate in on mount unless reduced motion is preferred
  useEffect(() => {
    if (typeof window !== 'undefined') prefersReduce.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduce.current) {
      setIsIncoming(true)
      const t = window.setTimeout(() => setIsIncoming(false), ANIM_MS)
      return () => clearTimeout(t)
    }
    return
  }, [])

  const currentData = data[currentIndex]

  // prepare a small sparkline from numeric values in `data`
  const series = data.map((d) => {
    if (typeof d.value === 'number') return d.value as number
    const cleaned = String(d.value).replace(/[^0-9.-]/g, '')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  })

  const sparklinePoints = (() => {
    if (!series || series.length === 0) return ''
    const min = Math.min(...series)
    const max = Math.max(...series)
    const range = max - min || 1
    return series.map((v, i) => {
      const x = (i / Math.max(1, series.length - 1)) * 100
      // map value into 2..18 (invert because SVG y=0 at top)
      const y = 2 + (1 - (v - min) / range) * 16
      return `${x},${y}`
    }).join(' ')
  })()

  // sizes should only affect height; width should remain full to avoid shrinking columns
  const sizeClasses = {
    small: "h-32",
    medium: "h-40",
    large: "h-48",
  }

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-green-500"
      case "down":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      default:
        return "→"
    }
  }

  return (
    <div className={cn(sizeClasses[size], className)}>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 h-full transform-gpu",
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />

        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-grid-pattern animate-pulse" />
        </div>

        <div className="relative p-4 h-full flex flex-col justify-start">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1 uppercase tracking-wide">{title}</h3>

            <div
              className={cn(
                "transition-opacity duration-300",
                isTransitioning ? "opacity-0 out-down-rotate" : isIncoming ? "opacity-100 in-up-rotate" : "opacity-100",
              )}
            >
              <div className="text-2xl font-bold mb-0">{currentData?.value}</div>
              <div className="text-sm text-muted-foreground">{currentData?.label}</div>
              {/* sparkline removed from card; rendered separately on pages */}
            </div>
          </div>

          {currentData?.trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-opacity duration-300",
                isTransitioning ? "opacity-0 out-down-rotate" : isIncoming ? "opacity-100 in-up-rotate" : "opacity-100",
                getTrendColor(currentData.trend),
              )}
            >
              <span className="animate-pulse">{getTrendIcon(currentData.trend)}</span>
              <span className="capitalize">{currentData.trend}</span>
            </div>
          )}

          {/* optional sub-cards area (shows compact items for each subpage) */}
          {subCards && subCards.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-1">
              {subCards.map((sc, idx) => (
                <div key={sc.title} className="text-xs text-muted-foreground">
                  <div className="font-medium">{sc.title}</div>
                  <div className="flex gap-2 text-[0.8rem] mt-1">
                    {sc.data.slice(0,3).map((d, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="font-bold text-sm">{d.value}</span>
                        <span className="text-muted-foreground">{d.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
