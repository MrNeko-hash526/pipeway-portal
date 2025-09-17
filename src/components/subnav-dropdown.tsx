"use client"

import React from 'react'
import Link from './link'

type Item = { href: string; label: string }

export default function SubnavDropdown({
  label,
  href,
  items,
}: {
  label: string
  href: string
  items?: Item[]
}) {
  // simplified: no hover/dropdown, just render the parent link
  return (
    <div className="inline-block">
      <Link
        href={href}
        className="text-foreground font-bold text-sm px-2 py-0.5 rounded-sm hover:text-primary"
      >
        {label}
      </Link>
    </div>
  )
}
