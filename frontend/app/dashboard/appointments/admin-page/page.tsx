"use client";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, Timestamp } from "firebase/firestore";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const q = collection(db, "appointments");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const normalizePhone = (phone: string) => {
    if (!phone) return null;
    if (phone.startsWith("0")) {
      return "+254" + phone.slice(1);
    } else if (phone.startsWith("254")) {
      return "+" + phone;
    } else if (!phone.startsWith("+254")) {
      return "+254" + phone;
    }
    return phone;
  };

  // Approve appointment and create reminders
  const approveAppointmentAndRemind = async (apt: any) => {
    const normalizedPhone = normalizePhone(apt.phone);
    await updateDoc(doc(db, "appointments", apt.id), { status: "approved" });
    await addDoc(collection(db, "reminders"), {
      recipient: apt.patientId,
      message: `Your appointment for ${apt.date} at ${apt.time} at ${apt.facility} has been approved.`,
      sendAt: Timestamp.now(),
      sent: false,
      type: "status",
      appointmentId: apt.id,
      createdAt: Timestamp.now(),
      phone: normalizedPhone,
    });
    const appointmentDate = new Date(apt.date + 'T' + apt.time);
    const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    await addDoc(collection(db, "reminders"), {
      recipient: apt.patientId,
      message: `Reminder: You have an appointment on ${apt.date} at ${apt.time} at ${apt.facility}.`,
      sendAt: Timestamp.fromDate(reminderTime),
      sent: false,
      type: "upcoming",
      appointmentId: apt.id,
      createdAt: Timestamp.now(),
      phone: normalizedPhone,
    });
    alert("Appointment approved and reminders sent!");
  };

  // Cancel appointment
  const cancelAppointment = async (apt: any) => {
    const normalizedPhone = normalizePhone(apt.phone);
    await updateDoc(doc(db, "appointments", apt.id), { status: "cancelled" });
    await addDoc(collection(db, "reminders"), {
      recipient: apt.patientId,
      message: `Your appointment for ${apt.date} at ${apt.time} at ${apt.facility} has been cancelled by admin.`,
      sendAt: Timestamp.now(),
      sent: false,
      type: "status",
      appointmentId: apt.id,
      createdAt: Timestamp.now(),
      phone: normalizedPhone,
    });
    alert("Appointment cancelled and patient notified.");
  };

  // Delete appointment
  const deleteAppointment = async (apt: any) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      await deleteDoc(doc(db, "appointments", apt.id));
      alert("Appointment deleted.");
    }
  };

  // Filter and search logic
  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter && apt.status !== statusFilter) return false;
    if (dateFilter && apt.date !== dateFilter) return false;
    if (patientFilter && !(apt.fullName?.toLowerCase().includes(patientFilter.toLowerCase()) || apt.patientName?.toLowerCase().includes(patientFilter.toLowerCase()) || apt.patientId?.toLowerCase().includes(patientFilter.toLowerCase()))) return false;
    if (search && !(
      (apt.fullName && apt.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (apt.patientName && apt.patientName.toLowerCase().includes(search.toLowerCase())) ||
      (apt.doctor && apt.doctor.toLowerCase().includes(search.toLowerCase())) ||
      (apt.facility && apt.facility.toLowerCase().includes(search.toLowerCase())) ||
      (apt.status && apt.status.toLowerCase().includes(search.toLowerCase()))
    )) return false;
    return true;
  });

  // Unique status and patient names for filter dropdowns
  const uniqueStatuses = Array.from(new Set(appointments.map(a => a.status))).filter(Boolean);
  const uniquePatients = Array.from(new Set(appointments.map(a => a.fullName || a.patientName || a.patientId))).filter(Boolean);

  return (
    <RoleGuard allowed={["admin"]}>
      <div className="max-w-full mx-4 p-4">
        <h2 className="text-2xl font-bold mb-4 text-pink-700 flex items-center gap-2">
          <span>Manage Appointments</span>
          <span className="text-sm font-normal bg-pink-100 text-pink-700 px-2 py-1 rounded">
            {filteredAppointments.length} appointments
          </span>
        </h2>
        
        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
          <input
            className="border rounded px-3 py-2"
            placeholder="Search appointments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            className="border rounded px-3 py-2" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <select 
            className="border rounded px-3 py-2" 
            value={patientFilter} 
            onChange={e => setPatientFilter(e.target.value)}
          >
            <option value="">All Patients</option>
            {uniquePatients.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="text-right text-sm text-gray-500">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No appointments found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-pink-50 to-pink-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Appointment Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Medical Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Contact Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Payment & Insurance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{apt.fullName || apt.patientName || apt.patientId}</div>
                        <div className="text-sm text-gray-500">ID: {apt.patientId || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(apt.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">{apt.time}</div>
                        <div className="text-sm text-gray-500">{apt.facility}</div>
                        <div className="text-sm text-gray-500">Dr. {apt.doctor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">{apt.serviceType || "Consultation"}</div>
                        <div className="text-sm text-gray-500">{apt.mode}</div>
                        {apt.symptoms && (
                          <div className="text-sm text-gray-500 truncate max-w-xs" title={apt.symptoms}>
                            Symptoms: {apt.symptoms}
                          </div>
                        )}
                        {apt.emergency && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Emergency
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm">
                          <span className="font-medium">📞</span> {apt.phone}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">✉️</span> {apt.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm">
                          <span className="font-medium">Fee:</span> KES {apt.fee || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Insurance:</span> {apt.insurance || 'None'}
                        </div>
                        {apt.policyNo && (
                          <div className="text-sm text-gray-500">
                            Policy: {apt.policyNo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${apt.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        ${apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-2">
                        {apt.status === "pending" && (
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center justify-center gap-1"
                            onClick={() => approveAppointmentAndRemind(apt)}
                          >
                            <span>✓</span> Approve
                          </button>
                        )}
                        {apt.status !== "cancelled" && (
                          <button
                            className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm flex items-center justify-center gap-1"
                            onClick={() => cancelAppointment(apt)}
                          >
                            <span>⨯</span> Cancel
                          </button>
                        )}
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm flex items-center justify-center gap-1"
                          onClick={() => deleteAppointment(apt)}
                        >
                          <span>🗑</span> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleGuard>
  );
} 