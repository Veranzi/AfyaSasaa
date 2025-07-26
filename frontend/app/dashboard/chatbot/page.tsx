"use client";
import DashboardMedicalChatbot from "@/components/dashboard-medical-chatbot";
import RoleGuard from "@/components/RoleGuard";

export default function ChatbotPage() {
  return (
    <RoleGuard allowed={["patient", "admin"]}>
      <DashboardMedicalChatbot />
    </RoleGuard>
  );
} 