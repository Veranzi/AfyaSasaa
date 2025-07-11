"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Activity,
  Package,
  Settings,
  Bell,
  FileText,
  Syringe,
} from "lucide-react"

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Patients",
    icon: Users,
    href: "/dashboard/patients",
    color: "text-violet-500",
  },
  {
    label: "Analytics",
    icon: Activity,
    href: "/dashboard/analytics",
    color: "text-pink-700",
  },
  {
    label: "Inventory",
    icon: Package,
    href: "/dashboard/inventory",
    color: "text-orange-700",
  },
  {
    label: "Treatment",
    icon: Syringe,
    href: "/dashboard/treatment",
    color: "text-indigo-600",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/dashboard/reports",
    color: "text-emerald-500",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/dashboard/notifications",
    color: "text-red-500",
  },
  {
    label: "Blogs",
    icon: FileText,
    href: "/blogs",
    color: "text-rose-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white text-gray-900">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-pink-500/10 rounded-lg transition",
                pathname === route.href ? "text-pink-700 bg-pink-500/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 