import React, { useEffect, useState, Suspense } from "react"
import Dashboard from "./dashboard/Dashboard"
import WritePolicy from "./write-a-policy/WritePolicy"

// lazy-load feature pages to avoid intermittent HMR/ESM race errors
const SetupIndex = React.lazy(() => import("./setup/index"))
const VendorSetup = React.lazy(() => import("./setup/vendor-setup/index"))
const AddOrganizationPage = React.lazy(() => import("./setup/vendor-setup/add"))
const UserSetup = React.lazy(() => import("./setup/user-setup/index"))
const AddUserPage = React.lazy(() => import("./setup/user-setup/add"))
const UserGroupsSetup = React.lazy(() => import("./setup/user-groups-setup/index"))
const AddGroupPage = React.lazy(() => import("./setup/user-groups-setup/add"))
const RiskManagement = React.lazy(() => import("./setup/risk-management/RiskManagement"))
const StandardsAndCitationManagement = React.lazy(() => import("./setup/standards-and-citation-management/index"))

// root-level pages (keep eager if stable)
import AuditManagement from "./audit-management/audit-management"
import LicenceAndCertificates from "./licence-and-certificates/index"

// other sub-pages (lazy or eager as you prefer)
const TrainingQuizzes = React.lazy(() => import("./training/quizzes"))

const S = (el: React.ReactElement) => <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>{el}</Suspense>

const ROUTES: { [path: string]: React.ReactElement } = {
  "/": <Dashboard />,
  "/dashboard": <Dashboard />,

  // setup area (render lazy components inside Suspense)
  "/setup": S(<SetupIndex />),
  "/setup/vendor-setup": S(<VendorSetup />),
  "/setup/vendor-setup/add": S(<AddOrganizationPage />),
  "/setup/vendor-setup/edit": S(<AddOrganizationPage />),
  "/setup/user-setup": S(<UserSetup />),
  "/setup/user-setup/add": S(<AddUserPage />),
  "/setup/user-setup/edit": S(<AddUserPage />),
  "/setup/user-groups-setup": S(<UserGroupsSetup />),
  "/setup/user-groups-setup/add": S(<AddGroupPage />),
  "/setup/user-groups-setup/edit": S(<AddGroupPage />),
  "/setup/risk-management": S(<RiskManagement />),
  "/setup/standards-and-citation-management": S(<StandardsAndCitationManagement />),

  // root-level mappings (eager)
  "/audit-management": <AuditManagement />,
  "/training-and-test": S(<TrainingQuizzes />),

  "/licence-and-certificates": <LicenceAndCertificates />,
  "/training/quizzes": S(<TrainingQuizzes />),
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
