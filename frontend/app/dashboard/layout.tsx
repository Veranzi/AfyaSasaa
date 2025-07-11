"use client"
import { DashboardNav } from "@/components/dashboard-nav"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/signup")
      }
    })
    return () => unsubscribe()
  }, [router])

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white">
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <img src="/AfyaSasa logo.png" alt="AfyaSasa Logo" className="h-10 w-10 object-contain rounded-full" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">AfyaSasa</h1>
          </div>
          <p className="text-xs text-gray-500 -mt-1">Healthcare Dashboard</p>
          <DashboardNav />
        </div>
      </div>
      <main className="md:pl-72">
        {children}
      </main>
    </div>
  )
} 