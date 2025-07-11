import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Dashboard } from "@/components/dashboard"
import { Stats } from "@/components/stats"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="pt-24">
        {" "}
        {/* Add padding to account for fixed header */}
        <Hero />
        <Stats />
        <Features />
      </div>
      <Footer />
    </div>
  )
}
