"use client"

import React, { useEffect, useState } from "react"
import Link from "@/components/link"

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.21 4.21a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.12l-4.5 4.25a.75.75 0 11-1.04-1.08L11.23 10 7.23 5.29a.75.75 0 01-.02-1.06z"
    />
  </svg>
)

type Crumb = { href: string; label: string }

function toTitle(seg: string) {
  return seg
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function truncate(text: string, max = 28) {
  if (!text) return text
  return text.length > max ? text.slice(0, max - 1) + "…" : text
}

export default function Breadcrumb({
  hideHome = false,
  maxCrumbs = 6,
  separator = <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />,
}: {
  hideHome?: boolean
  maxCrumbs?: number
  separator?: React.ReactNode
}) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as any
      if (!win.__breadcrumbPatched) {
        const push = history.pushState
        const replace = history.replaceState
        history.pushState = function (...args) {
          const ret = push.apply(this, args as any)
          window.dispatchEvent(new Event("locationchange"))
          return ret
        }
        history.replaceState = function (...args) {
          const ret = replace.apply(this, args as any)
          window.dispatchEvent(new Event("locationchange"))
          return ret
        }
        win.__breadcrumbPatched = true
      }
    }

    // friendly route names
    const routeNameMap: Record<string, string> = {
      "/": "Home",
      "/setup": "Setup",
      "/setup/vendor-setup": "Vendor Setup",
      "/setup/vendor-setup/add": "Add Organization", // <-- added mapping
      "/setup/user-setup": "Users",
      "/setup/user-groups-setup": "User Groups",
      "/audit-management": "Audit",
      "/audit/reports": "Reports",
      "/audit/schedules": "Schedules",
      "/training-and-test": "Training",
      "/training-and-test/quizzes": "Quizzes",
      "/licence-and-certificates": "Certificates",
      // add more explicit mappings as needed
    }

    const build = () => {
      const path = (typeof window !== "undefined" && window.location.pathname) || "/"
      const parts = path.split("/").filter(Boolean)

      const list: Crumb[] = []
      if (!hideHome) list.push({ href: "/", label: routeNameMap["/"] ?? "Home" })

      parts.forEach((seg, idx) => {
        const href = "/" + parts.slice(0, idx + 1).join("/")
        let label = routeNameMap[href] ?? toTitle(seg)

        if (/^[0-9]+$/.test(seg) || /^[0-9a-fA-F-]{8,}$/.test(seg)) {
          label = `ID ${truncate(seg, 10)}`
        }

        list.push({ href, label })
      })

      if (list.length > maxCrumbs) {
        const first = list[0]
        const last = list[list.length - 1]
        const middle = list.slice(1, list.length - 1)
        const keep = Math.max(1, Math.floor((maxCrumbs - 2) / 2))
        const left = middle.slice(0, keep)
        const right = middle.slice(middle.length - keep)
        const collapsed = [first, ...left, { href: "#", label: "…" }, ...right, last]
        setCrumbs(collapsed)
        return
      }

      setCrumbs(list)
    }

    build()
    const onLoc = () => build()
    window.addEventListener("popstate", onLoc)
    window.addEventListener("locationchange", onLoc)
    return () => {
      window.removeEventListener("popstate", onLoc)
      window.removeEventListener("locationchange", onLoc)
    }
  }, [hideHome, maxCrumbs])

  if (!crumbs || crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <ol className="flex items-center gap-2 text-muted-foreground">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={c.href + i} className="flex items-center">
              {!isLast ? (
                <Link href={c.href} className="text-primary hover:underline" aria-label={`Go to ${c.label}`}>
                  <span title={c.label}>{truncate(c.label, 28)}</span>
                </Link>
              ) : (
                <span className="font-medium text-foreground" title={c.label}>
                  {truncate(c.label, 36)}
                </span>
              )}
              {!isLast && <span className="mx-2">{separator}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}