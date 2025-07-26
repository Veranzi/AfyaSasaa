"use client";
import { Dashboard } from "@/components/dashboard";
import RoleGuard from "@/components/RoleGuard";

export default function TreatmentPage() {
  return (
    <RoleGuard allowed={["clinician", "admin"]}>
      <Dashboard initialTab="treatment" />
    </RoleGuard>
  );
} 