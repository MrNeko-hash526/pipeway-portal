"use client"

import React from 'react'

interface SparklineProps {
  data: Array<number>
  className?: string
  width?: number
  height?: number
  showGrid?: boolean
  yLabel?: string
}

export default function Sparkline({ data, className, width = 480, height = 180, showGrid = true, yLabel }: SparklineProps) {
  if (!data || data.length === 0) return null

  const padding = { top: 16, right: 16, bottom: 36, left: 44 }

  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * innerW
    const y = padding.top + (1 - (v - min) / range) * innerH
    return { x, y, v }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // y-axis ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map(t => min + (1 - t) * range)

  return (
    <div className={className}>
      <svg width={width} height={height} className="w-full">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />

        {/* gridlines */}
        {showGrid && yTicks.map((val, i) => {
          const y = padding.top + (1 - (val - min) / range) * innerH
          return (
            <line key={`g-${i}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e6eef6" strokeWidth={1} />
          )
        })}

        {/* axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#9ca3af" strokeWidth={1} />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#9ca3af" strokeWidth={1} />

        {/* y ticks and labels */}
        {yTicks.map((val, i) => {
          const y = padding.top + (1 - (val - min) / range) * innerH
          return (
            <g key={i}>
              <line x1={padding.left - 6} y1={y} x2={padding.left} y2={y} stroke="#9ca3af" strokeWidth={1} />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize={11} fill="#475569">{Math.round(val)}</text>
            </g>
          )
        })}

        {/* x ticks (indices) - show up to 6 labels evenly spaced */}
        {points.map((p, i) => {
          const step = Math.max(1, Math.ceil(points.length / 6))
          if (i % step !== 0 && i !== points.length - 1) return null
          return (
            <g key={`x-${i}`}>
              <line x1={p.x} y1={height - padding.bottom} x2={p.x} y2={height - padding.bottom + 6} stroke="#9ca3af" strokeWidth={1} />
              <text x={p.x} y={height - padding.bottom + 20} textAnchor="middle" fontSize={11} fill="#475569">{i + 1}</text>
            </g>
          )
        })}

        {/* line path */}
        <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

        {/* point circles */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#0ea5e9" stroke="#ffffff" strokeWidth={0.8} />
        ))}

        {/* y label */}
        {yLabel && (
          <text x={padding.left - 36} y={padding.top + 10} textAnchor="middle" fontSize={11} fill="#475569" transform={`rotate(-90 ${padding.left - 36} ${padding.top + 10})`}>{yLabel}</text>
        )}
      </svg>
    </div>
  )
}
