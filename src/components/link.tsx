"use client"
import React from "react"

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  onNavigate?: () => void
}

export default function Link({ href, onNavigate, children, target, ...rest }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // allow normal behavior for new tab / modifier keys / external targets
    if (target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }

    // internal navigation: prevent full page reload and notify router
    e.preventDefault()
    try {
      window.history.pushState({}, "", href)
      window.dispatchEvent(new PopStateEvent("popstate"))
    } catch {
      // fallback to normal navigation if pushState fails
      window.location.href = href
    }

    if (typeof onNavigate === "function") onNavigate()
  }

  return (
    <a {...rest} href={href} target={target} onClick={handleClick}>
      {children}
    </a>
  )
}
