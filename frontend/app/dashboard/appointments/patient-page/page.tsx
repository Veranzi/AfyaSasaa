"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import RoleGuard from "@/components/RoleGuard";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { Stethoscope, Hospital, Calendar as CalendarIcon, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Show all appointments for demo/testing
    const q = collection(db, "appointments");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Dashboard summary calculations
  const today = new Date();
  const total = appointments.length;
  const upcoming = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate >= today;
  }).length;
  const completed = appointments.filter(app => app.status === "completed").length;

  return (
    <RoleGuard allowed={["patient", "admin"]}>
      <div className="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-pink-700">My Appointments</h2>
        {/* Dashboard summary - card style */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center justify-center bg-pink-600 rounded-xl p-4 shadow text-white">
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-sm mt-1">Total</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-blue-100 rounded-xl p-4 shadow text-blue-700">
            <div className="text-3xl font-bold">{upcoming}</div>
            <div className="text-sm mt-1">Upcoming</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-4 shadow text-gray-700">
            <div className="text-3xl font-bold">{completed}</div>
            <div className="text-sm mt-1">Completed</div>
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-gray-500">No appointments found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map(app => (
              <div key={app.id} className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex flex-col items-center mr-4">
                    <div className="text-xs text-gray-400">{format(new Date(app.date), 'MMM dd, yyyy')}</div>
                    <div className="text-lg font-bold text-gray-700">{app.time}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <img src={app.doctorPhotoURL || "/placeholder-user.jpg"} alt={app.doctor || "Doctor"} className="w-10 h-10 rounded-full object-cover border-2 border-pink-200" />
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{app.doctor}</div>
                      <div className="text-xs text-gray-500">{app.facility}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 mt-2 md:mt-0">
                  <Badge variant={app.status === "Approved" ? "secondary" : app.status === "Pending" ? "outline" : "default"} className={
                    app.status === "Approved"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : app.status === "Pending"
                      ? "bg-red-100 text-red-600 border-red-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }>
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
} 