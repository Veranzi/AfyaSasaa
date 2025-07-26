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
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useUserRole } from "@/hooks/useUserRole";
import { User } from "firebase/auth";
import { MessageCircle, Calendar, AlarmClock } from "lucide-react";

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
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
]

export function DashboardNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser as User | null);
    });
    return () => unsubscribe();
  }, []);
  const { role, loading } = useUserRole(user);

  let navLinks: any[] = [];
  if (loading || !role) {
    navLinks = [];
  } else if (role === "patient") {
    navLinks = [
      {
        label: "Profile",
        icon: LayoutDashboard,
        href: "/dashboard/profile",
        color: "text-sky-500",
      },
      {
        label: "Medical Chatbot",
        icon: MessageCircle,
        href: "/dashboard/chatbot",
        color: "text-pink-600",
      },
      {
        label: "Book Appointment",
        icon: Calendar,
        href: "/dashboard/appointments",
        color: "text-blue-600",
      },
      {
        label: "View Appointments",
        icon: Calendar,
        href: "/dashboard/appointments/patient-page",
        color: "text-blue-700",
      },
      {
        label: "Reminders",
        icon: Bell,
        href: "/dashboard/appointments/patient-reminders",
        color: "text-amber-600",
      },
      {
        label: "Blogs",
        icon: FileText,
        href: "/blogs",
        color: "text-rose-500",
      },
    ];
  } else if (role === "clinician") {
    navLinks = [
      ...routes,
      {
        label: "Blogs",
        icon: FileText,
        href: "/blogs",
        color: "text-rose-500",
      },
      {
        label: "My Slots",
        icon: Calendar,
        href: "/dashboard/appointments/clinician-page",
        color: "text-blue-800",
      },
    ];
  } else if (role === "admin") {
    navLinks = [
      ...routes,
      {
        label: "Medical Chatbot",
        icon: MessageCircle,
        href: "/dashboard/chatbot",
        color: "text-pink-600",
      },
      {
        label: "Appointments",
        icon: Calendar,
        href: "/dashboard/appointments",
        color: "text-blue-600",
      },
      {
        label: "Blogs",
        icon: FileText,
        href: "/blogs",
        color: "text-rose-500",
      },
      {
        label: "Live Demo",
        icon: Activity,
        href: "/demo",
        color: "text-pink-700",
      },
      {
        label: "Manage Appointments",
        icon: Calendar,
        href: "/dashboard/appointments/admin-page",
        color: "text-blue-800",
      },
      {
        label: "Manage Reminders",
        icon: AlarmClock,
        href: "/dashboard/reminders/admin-page",
        color: "text-amber-800",
      },
      {
        label: "Manage Reports",
        icon: FileText,
        href: "/dashboard/reports/admin-page",
        color: "text-emerald-800",
      },
    ];
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full text-gray-900">
      <div className="px-3 py-2 flex-1 bg-white rounded-xl shadow-sm">
        <div className="space-y-1">
          {navLinks.map((route) => (
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
  );
} 