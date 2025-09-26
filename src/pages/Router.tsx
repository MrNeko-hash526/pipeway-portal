import React, { useEffect, useState, Suspense } from "react"

// Lazy load ALL components
const Dashboard = React.lazy(() => import("./dashboard/Dashboard"))
const ManagePolicies = React.lazy(() => import("./manage-polocies/index"))
const AddPolicyHistoryPage = React.lazy(() => import("./manage-polocies/Histroy"))
const ManagePoliciesAdd = React.lazy(() => import("./manage-polocies/add"))
const QuestionsSetupPage = React.lazy(() => import("./audit-management/questions setup/questionsSetup"))
const AddQuestionsPage = React.lazy(() => import("./audit-management/questions setup/addQuestions"))
const UploadQuestionsPage = React.lazy(() => import("./audit-management/questions setup/uploadQuestions"))
const CreateAssignment = React.lazy(() => import("./audit-management/audit assignments/createAssignment"))
const QuestionGroupsSetupPage = React.lazy(() => import("./audit-management/question groups setup/questionGroupsSetup"))
const AssignmentsListPage = React.lazy(() => import("./audit-management/audit assignments/auditAssignments"))
const ViewVendorResponsePage = React.lazy(() => import("./audit-management/view vender response/viewVendorResponse"))
const RespondToVendorResponsePage = React.lazy(() => import("./audit-management/responsed to vendor response/respondToVendorResponse"))
const CreateAuditSummaryPage = React.lazy(() => import("./audit-management/create audit summary/createAuditSummary"))
const CreateReportPage = React.lazy(() => import("./audit-management/create audit summary/createreport"))
const AuditManagement = React.lazy(() => import("./audit-management/audit-management"))
const LicenceAndCertificates = React.lazy(() => import("./licence-and-certificates/index"))
const TrainingAndTestManagement = React.lazy(() => import("./training-and-test/index"))

// Setup pages
const SetupIndex = React.lazy(() => import("./setup/index"))
const VendorSetup = React.lazy(() => import("./setup/vendor-setup/index"))
const AddOrganizationPage = React.lazy(() => import("./setup/vendor-setup/add"))
const UserSetup = React.lazy(() => import("./setup/user-setup/index"))
const AddUserPage = React.lazy(() => import("./setup/user-setup/add"))
const UserGroupsSetup = React.lazy(() => import("./setup/user-groups-setup/index"))
const AddGroupPage = React.lazy(() => import("./setup/user-groups-setup/add"))
const RiskManagement = React.lazy(() => import("./setup/risk-management/RiskManagement"))
const StandardsAndCitationManagement = React.lazy(() => import("./setup/standards-and-citation-management/index"))
const AddCertificatePage = React.lazy(() => import("./licence-and-certificates/add"))

// Enhanced loading component with better UX
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Loading...</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please wait while we load the page</p>
      </div>
    </div>
  </div>
)

// Suspense wrapper with enhanced loading
const S = (el: React.ReactElement) => (
  <Suspense fallback={<LoadingFallback />}>
    {el}
  </Suspense>
)

const ROUTES: { [path: string]: React.ReactElement } = {
  // Dashboard routes
  "/": S(<Dashboard />),
  "/dashboard": S(<Dashboard />),

  // Setup area routes
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

  // Audit management routes
  "/audit-management": S(<AuditManagement />),
  "/audit-management/questions-setup": S(<QuestionsSetupPage />),
  "/audit-management/questions-setup/add": S(<AddQuestionsPage />),
  "/audit-management/questions-setup/upload": S(<UploadQuestionsPage />),
  "/audit-management/create-assignments": S(<CreateAssignment />),
  "/audit-management/assignments": S(<AssignmentsListPage />),
  "/audit-management/question-groups-setup": S(<QuestionGroupsSetupPage />),
  "/audit-management/vendor-responses": S(<ViewVendorResponsePage />),
  "/audit-management/respond-vendor": S(<RespondToVendorResponsePage />),
  "/audit-management/create-summary": S(<CreateAuditSummaryPage />),
  "/audit-management/create-summary/create-report": S(<CreateReportPage />),

  // Training and test routes
  "/training-and-test": S(<TrainingAndTestManagement />),

  // Manage policies routes
  "/manage-policies": S(<ManagePolicies />),
  "/manage-policies/add": S(<ManagePoliciesAdd />),
  "/manage-policies/Policy-History": S(<AddPolicyHistoryPage />),

  // Licence and certificates routes
  "/licence-and-certificates": S(<LicenceAndCertificates />),
  "/licence-and-certificates/add": S(<AddCertificatePage />),
}

export default function Router() {
  const [path, setPath] = useState<string>(typeof window !== "undefined" ? window.location.pathname : "/")

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener("popstate", onPop)

    // Handle programmatic navigation (pushState/replaceState)
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

  // Normalize path: strip trailing slash (except for root) so '/foo/' matches '/foo'
  const normalizedPath = path !== "/" && path.endsWith("/") ? path.replace(/\/+$/, "") : path

  // Return matched route or 404
  if (ROUTES[normalizedPath]) {
    return ROUTES[normalizedPath]
  }

  // Enhanced 404 page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Requested path:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">{path}</code>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => history.back()}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
