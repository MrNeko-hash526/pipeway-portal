import React, { useEffect, useState } from "react"
import Dashboard from "./dashboard/Dashboard"
import WritePolicy from "./write-a-policy/WritePolicy"

// setup-area pages
import SetupIndex from "./setup/index"
import VendorSetup from "./setup/vendor-setup/index"
import AddOrganizationPage from "./setup/vendor-setup/add"
import UserSetup from "./setup/user-setup/index"
import AddUserPage from "./setup/user-setup/add"
import UserGroupsSetup from "./setup/user-groups-setup/index"
import RiskManagement from "./setup/risk-management/RiskManagement"
import StandardsAndCitationManagement from "./setup/standards-and-citation-management/index"

// root-level pages
import AuditManagement from "./audit-management/audit-management"
import LicenceAndCertificates from "./licence-and-certificates/index"

// other sub-pages
import TrainingQuizzes from "./training/quizzes"

const ROUTES: { [path: string]: React.ReactElement } = {
  "/": <Dashboard />,
  "/dashboard": <Dashboard />,

  // setup area (only the five canonical pages)
  "/setup": <SetupIndex />,
  "/setup/vendor-setup": <VendorSetup />,
  "/setup/vendor-setup/add": <AddOrganizationPage />,
  "/setup/user-setup": <UserSetup />,
  "/setup/user-setup/add": <AddUserPage />,
  "/setup/user-groups-setup": <UserGroupsSetup />,
  "/setup/risk-management": <RiskManagement />,
  "/setup/standards-and-citation-management": <StandardsAndCitationManagement />,

  // root-level mappings (use root modules)
  "/audit-management": <AuditManagement />,
  "/training-and-test": <TrainingQuizzes />,

  "/licence-and-certificates": <LicenceAndCertificates />,

  // other sub-pages
  "/training/quizzes": <TrainingQuizzes />,
}

export default function Router() {
  const [path, setPath] = useState<string>(typeof window !== "undefined" ? window.location.pathname : "/")

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener("popstate", onPop)

    // also handle programmatic navigation (pushState/replaceState) if app uses them
    const win = typeof window !== "undefined" ? (window as any) : null
    if (win && !win.__routePatched) {
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
      win.__routePatched = true
    }
    const onLocationChange = () => setPath(window.location.pathname)
    window.addEventListener("locationchange", onLocationChange)

    return () => {
      window.removeEventListener("popstate", onPop)
      window.removeEventListener("locationchange", onLocationChange)
    }
  }, [])

  // normalize path: strip trailing slash (except for root) so '/foo/' matches '/foo'
  const normalizedPath = path !== "/" && path.endsWith("/") ? path.replace(/\/+$/, "") : path

  // if there's an exact match return it, otherwise render a small 404
  if (ROUTES[normalizedPath]) return ROUTES[normalizedPath]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">No route for {path}</p>
    </div>
  )
}
