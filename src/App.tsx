import React from "react"
import { Header } from '@/components/header'
import Router from "./pages/Router"
import Breadcrumb from "@/components/breadcrumb"

export default function App() {
  return (
    <div className="app-root min-h-screen bg-background">
      <Header />
      <main className="px-6 py-8">
        {/* dynamic breadcrumb shown for all pages */}
        <Breadcrumb />

        {/* existing router / page outlet */}
        <Router />
      </main>
      {/* footer removed as requested */}
    </div>
  )
}
