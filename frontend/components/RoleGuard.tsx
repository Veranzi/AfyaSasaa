"use client";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

export default function RoleGuard({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const { role, loading } = useUserRole(user);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  if (loading || !user) return <div>Loading...</div>;
  if (!role || !allowed.includes(role)) {
    console.log("RoleGuard: Access Denied", { role, allowed });
    // Optionally, you can redirect:
    // router.replace("/dashboard");
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied</div>;
  }
  return <>{children}</>;
} 