"use client"

import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Award,
  Users,
  Zap,
  Shield,
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-500 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-rose-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-indigo-500 rounded-full blur-xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Top Section - Brand & Hackathon */}
        <div className="flex flex-col items-center justify-center mb-16">
          <img
            src="/AfyaSasa logo.png"
            alt="AfyaSasa Logo"
            width={160}
            height={160}
            className="object-contain rounded-full"
          />
          <p className="text-pink-200 text-lg mt-2 text-center w-full">AI-Powered Women's Health</p>
        </div>

        <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
          Revolutionizing women's healthcare with AI-powered ovarian cyst prediction and comprehensive care management
          designed for low-resource settings across Africa.
        </p>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Quick Links */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-600/20 rounded-lg">
                <Zap className="h-5 w-5 text-pink-400" />
              </div>
              <h4 className="text-lg font-semibold text-pink-300">Quick Access</h4>
            </div>
            <ul className="space-y-3 pl-10">
              <li>
                <a href="#home" className="text-gray-300 hover:text-pink-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-pink-400 rounded-full"></span>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                  Features
                </a>
              </li>
              <li>
                <a href="#demo" className="text-gray-300 hover:text-rose-300 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-rose-400 rounded-full"></span>
                  Live Demo
                </a>
              </li>
              <li>
                <a
                  href="#dashboard"
                  className="text-gray-300 hover:text-indigo-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* AI Services */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-purple-300">AI Solutions</h4>
            </div>
            <ul className="space-y-3 pl-10">
              <li className="text-gray-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-pink-400 rounded-full"></span>
                Risk Assessment AI
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                Growth Prediction
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-rose-400 rounded-full"></span>
                Treatment Planning
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                Smart Inventory
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-pink-400 rounded-full"></span>
                Cost Optimization
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-600/20 rounded-lg">
                <Mail className="h-5 w-5 text-rose-400" />
              </div>
              <h4 className="text-lg font-semibold text-rose-300">Get In Touch</h4>
            </div>
            <div className="space-y-4 pl-10">
              <div className="group">
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-pink-300 transition-colors">
                  <Mail className="h-4 w-4 text-pink-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                    <a href="mailto:afyasasa2025@gmail.com" className="font-medium">
                      afyasasa2025@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="group">
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-purple-300 transition-colors">
                  <Phone className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                    <a href="tel:+254740875071" className="font-medium">
                      +254 740 875 071
                    </a>
                  </div>
                </div>
              </div>
              <div className="group">
                <div className="flex items-center gap-3 text-gray-300 group-hover:text-rose-300 transition-colors">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Location</p>
                    <p className="font-medium">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Community */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <h4 className="text-lg font-semibold text-indigo-300">Connect</h4>
            </div>
            <div className="pl-10">
              <h3 className="text-xl font-semibold mb-2 text-pink-100">Join our journey</h3>
              <p className="text-pink-200 mb-4">Be part of the revolution in women's health.</p>
              <div className="flex justify-center gap-4 mt-2">
                <a href="https://github.com/afyacenter" className="flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl hover:bg-pink-600/30 transition-all duration-300 group">
                  <Github className="h-5 w-5 text-gray-400 group-hover:text-pink-300" />
                </a>
                <a href="https://instagram.com/afyacenter" className="flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl hover:bg-pink-500/30 transition-all duration-300 group">
                  <Instagram className="h-5 w-5 text-gray-400 group-hover:text-pink-300" />
                </a>
                <a href="https://x.com/afyasasa" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl hover:bg-blue-400/30 transition-all duration-300 group">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.53 2.47A12 12 0 0 0 2.47 17.53 12 12 0 0 0 17.53 2.47zm-1.06 1.06A10 10 0 1 1 3.53 18.47 10 10 0 0 1 16.47 3.53zm-6.36 2.83l4.24 4.24-4.24 4.24 1.41 1.41 4.24-4.24 4.24 4.24 1.41-1.41-4.24-4.24 4.24-4.24-1.41-1.41-4.24 4.24-4.24-4.24-1.41 1.41z"/></svg>
                </a>
                <a href="https://linkedin.com/company/afyasasa" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex items-center justify-center w-12 h-12 bg-gray-800/50 rounded-xl hover:bg-blue-600/30 transition-all duration-300 group">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.966 0-1.75-.79-1.75-1.76 0-.97.784-1.76 1.75-1.76s1.75.79 1.75 1.76c0 .97-.784 1.76-1.75 1.76zm15.5 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v5.61z"/></svg>
                </a>
                {/* WhatsApp icon moved to the end */}
                <a href="https://wa.me/254740875071" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex items-center justify-center w-12 h-12 bg-green-600/80 rounded-xl hover:bg-green-700/90 transition-all duration-300 group ml-2">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.205C13.416 27.168 15.615 28 18 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.021 0-3.938-.586-5.563-1.684l-.397-.263-4.656 1.312 1.25-4.531-.26-.404C5.586 18.938 5 17.021 5 15c0-6.065 4.935-11 11-11s11 4.935 11 11-4.935 11-11 11zm6.188-7.406c-.338-.169-2.006-.992-2.316-1.104-.31-.113-.537-.169-.763.17-.225.338-.87 1.104-1.067 1.33-.197.225-.394.254-.732.085-.338-.17-1.428-.526-2.72-1.678-1.006-.898-1.684-2.008-1.882-2.346-.197-.338-.021-.52.148-.688.152-.151.338-.394.507-.592.169-.197.225-.338.338-.563.113-.225.056-.423-.028-.592-.084-.169-.763-1.84-1.045-2.522-.276-.664-.557-.573-.763-.584-.197-.008-.423-.01-.648-.01-.225 0-.592.084-.902.394-.31.31-1.18 1.152-1.18 2.807 0 1.655 1.205 3.252 1.374 3.477.169.225 2.376 3.627 5.76 4.945.806.277 1.434.442 1.924.566.808.205 1.545.176 2.127.107.649-.077 2.006-.82 2.29-1.613.282-.793.282-1.473.197-1.613-.084-.141-.31-.225-.648-.394z" fill="#fff"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 p-8 bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-2xl border border-pink-500/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-300 mb-1">94%</div>
            <div className="text-sm text-gray-400">AI Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-300 mb-1">1.2M+</div>
            <div className="text-sm text-gray-400">Women Helped</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-300 mb-1">60%</div>
            <div className="text-sm text-gray-400">Faster Diagnosis</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-300 mb-1">40%</div>
            <div className="text-sm text-gray-400">Cost Reduction</div>
          </div>
        </div>

        {/* Footer Bottom - Social Left-Aligned */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-pink-900/30 pt-8 mt-12">
          <div className="w-full text-center text-sm text-pink-200 py-4 border-t border-pink-900/30 mt-12">
            © 2025 AfyaSasa. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
