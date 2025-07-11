'use client'

import { Header } from "@/components/header"
import { PredictionDemo } from "@/components/prediction-demo"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function DemoPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="pt-24">
        <PredictionDemo />
      </div>
    </div>
  )
} 