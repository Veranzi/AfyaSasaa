"use client";
import { useState } from "react";
import AppointmentBookingForm from "./booking-form";
import { Button } from "@/components/ui/button";
import RoleGuard from "@/components/RoleGuard";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PatientAppointmentsPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentSummary, setAppointmentSummary] = useState<any>(null);
  const router = useRouter();

  const handleBook = async (summary: any) => {
    try {
      // Save to Firebase
      const appointmentRef = await addDoc(collection(db, "appointments"), {
        ...summary,
        status: "pending",
        createdAt: new Date(),
        patientId: auth.currentUser?.uid
      });

      // Create upcoming reminder for 24 hours before appointment
      const appointmentDate = new Date(summary.date + 'T' + summary.time);
      const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
      await addDoc(collection(db, "reminders"), {
        recipient: auth.currentUser?.uid,
        message: `Reminder: You have an appointment on ${summary.date} at ${summary.time} at ${summary.facility}.`,
        sendAt: Timestamp.fromDate(reminderTime),
        sent: false,
        type: "upcoming",
        appointmentId: appointmentRef.id,
        createdAt: Timestamp.now(),
        phone: summary.phone || null,
      });

      setAppointmentSummary(summary);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  if (showConfirmation) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Appointment Booked!</h2>
          <div className="mb-4">
            <div className="text-lg mb-2"><b>Facility:</b> {appointmentSummary?.facility}</div>
            <div className="text-lg mb-2"><b>Doctor:</b> {appointmentSummary?.doctor}</div>
            <div className="text-lg mb-2"><b>Date:</b> {appointmentSummary?.date}</div>
            <div className="text-lg mb-2"><b>Time:</b> {appointmentSummary?.time}</div>
            <div className="text-lg mb-2"><b>Mode:</b> {appointmentSummary?.mode}</div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button onClick={() => { setShowConfirmation(false); setAppointmentSummary(null); }}>
              Book Another Appointment
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/appointments/patient-page")}>View My Appointments</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowed={["patient", "admin"]}>
      <AppointmentBookingForm onBook={handleBook} />
    </RoleGuard>
  );
} 