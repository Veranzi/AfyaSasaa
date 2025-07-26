"use client";
import { useRouter } from "next/navigation";

const DEFAULT_APPOINTMENT = {
  doctor: "Dr. Achieng Onyango (Gynecologist)",
  clinic: "Nairobi Women’s Hospital, Adams Arcade",
  date: "2025-07-17",
  time: "10:30 AM",
  mode: "In-person Consultation",
};

export default function AppointmentConfirmation({ summary }: { summary?: any }) {
  const router = useRouter();
  const appointment = summary || DEFAULT_APPOINTMENT;
  const formattedDate = appointment.date ? new Date(appointment.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "-";

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow text-center">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
        <span role="img" aria-label="location">📍</span> Appointment Confirmed!
      </h2>
      <div className="text-4xl mb-2">🎉 SUCCESS!</div>
      <div className="text-green-700 text-lg font-semibold mb-4">✅ Your appointment has been confirmed.</div>
      <div className="mb-4">
        <div className="font-bold text-lg mb-1">{appointment.doctor}</div>
        <div className="mb-1">📍 Location: {appointment.clinic}</div>
        <div className="mb-1">📅 Date: {formattedDate}</div>
        <div className="mb-1">🕒 Time: {appointment.time}</div>
        <div className="mb-1">💬 Mode: {appointment.mode}</div>
      </div>
      <div className="mb-6 text-gray-600">📩 A reminder will be sent 24 hours before your appointment.</div>
      <div className="flex flex-col md:flex-row gap-3 justify-center">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => router.push("/dashboard/reminders")}>VIEW REMINDERS →</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => alert("Add to Google Calendar coming soon!")}>ADD TO GOOGLE CALENDAR</button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={() => router.push("/dashboard")}>GO TO DASHBOARD</button>
      </div>
    </div>
  );
} 