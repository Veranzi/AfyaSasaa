"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Brain, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-rose-600 text-white"
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/AfyaSasa logo.png" alt="AfyaSasa Logo" className="h-24 w-24 object-contain rounded-full" />
            <span className="text-2xl md:text-4xl font-semibold text-pink-200">AfyaSasa</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            AI-Powered Ovarian Cyst
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300">
              Prediction & Care
            </span>
          </h1>

          <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Revolutionizing women's healthcare with predictive AI models for early diagnosis, smart treatment planning,
            and comprehensive care coordination in low-resource settings.
          </p>

          <div className="flex gap-4 justify-center mt-8">
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow"
              onClick={() => router.push('/demo')}
            >
              Live Demo
            </button>
            <a
              href="https://ayfasasa.blogspot.com/2025/06/ovarian-cyst-and-myth-surroundin-it.html"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-pink-500 text-pink-600 font-bold py-3 px-6 rounded-lg shadow hover:bg-pink-50 inline-block"
            >
              View Research
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Brain className="h-6 w-6 text-pink-300" />
              <span className="font-medium">AI Prediction Models</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp className="h-6 w-6 text-yellow-300" />
              <span className="font-medium">Growth Forecasting</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Heart className="h-6 w-6 text-pink-300" />
              <span className="font-medium">Care Coordination</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
