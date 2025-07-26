"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, Timestamp, updateDoc } from "firebase/firestore";
import RoleGuard from "@/components/RoleGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FACILITIES = [
  "Pumwani Maternity Hospital",
  "Kakamega County Referral Hospital",
  "Machakos Level 5 Hospital",
  "Embu Level 5 Hospital",
  "Mombasa County Hospital",
  "Kericho County Referral Hospital",
  "Loitoktok Sub-County Hospital",
  "Moi Teaching and Referral Hospital",
  "Garissa County Referral Hospital",
  "Kitale County Hospital",
  "Nairobi Women's Hospital",
  "Aga Khan University Hospital",
  "Mombasa Hospital",
  "Demo Clinic"
];

export default function ClinicianSlotsPage() {
  const [slots, setSlots] = useState<Array<{ id: string; facility: string; date: string; time: string }>>([]);
  const [facility, setFacility] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [clinicianId, setClinicianId] = useState<string | null>(null);
  const [facilityFilter, setFacilityFilter] = useState("");
  const [facilityInput, setFacilityInput] = useState("");
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setClinicianId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!clinicianId) return;
    const fetchSlots = async () => {
      const q = query(collection(db, "slots"), where("clinicianId", "==", clinicianId));
      const querySnapshot = await getDocs(q);
      setSlots(querySnapshot.docs.map(doc => ({
        id: doc.id,
        facility: doc.data().facility,
        date: doc.data().date,
        time: doc.data().time
      })));
    };
    fetchSlots();
  }, [clinicianId]);

  const handleAddSlot = async () => {
    if (!facilityInput || !date || !time || !clinicianId) return alert("All fields required!");
    await addDoc(collection(db, "slots"), {
      clinicianId,
      facility: facilityInput,
      date,
      time,
      available: true,
      createdAt: Timestamp.now(),
    });
    setFacilityInput(""); setDate(""); setTime("");
    const q = query(collection(db, "slots"), where("clinicianId", "==", clinicianId));
    const querySnapshot = await getDocs(q);
    setSlots(querySnapshot.docs.map(doc => ({
      id: doc.id,
      facility: doc.data().facility,
      date: doc.data().date,
      time: doc.data().time
    })));
  };

  const handleDeleteSlot = async (id: string) => {
    await deleteDoc(doc(db, "slots", id));
    setSlots(slots.filter(slot => slot.id !== id));
  };

  const handleEditSlot = (slot: { id: string; date: string; time: string }) => {
    setEditingSlotId(slot.id);
    setEditDate(slot.date);
    setEditTime(slot.time);
  };

  const handleSaveEdit = async (id: string) => {
    await updateDoc(doc(db, "slots", id), {
      date: editDate,
      time: editTime,
    });
    setEditingSlotId(null);
    setEditDate("");
    setEditTime("");
    // Refresh slots
    if (!clinicianId) return;
    const q = query(collection(db, "slots"), where("clinicianId", "==", clinicianId));
    const querySnapshot = await getDocs(q);
    setSlots(querySnapshot.docs.map(doc => ({
      id: doc.id,
      facility: doc.data().facility,
      date: doc.data().date,
      time: doc.data().time
    })));
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setEditDate("");
    setEditTime("");
  };

  // Derive unique facilities from slots
  const facilities = Array.from(new Set(slots.map(slot => slot.facility)));

  // Filtered slots
  const filteredSlots = facilityFilter ? slots.filter(slot => slot.facility === facilityFilter) : slots;

  // Dashboard summary: count per facility
  const facilityCounts = FACILITIES.map(fac => ({
    name: fac,
    count: slots.filter(slot => slot.facility === fac).length
  })).filter(f => f.count > 0);

  return (
    <RoleGuard allowed={["clinician", "admin"]}>
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">My Available Slots</h2>
        {/* Dashboard summary */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Total Slots: {slots.length}</div>
          <div className="flex flex-wrap gap-2">
            {facilityCounts.map(f => (
              <span key={f.name} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs">
                {f.name}: {f.count}
              </span>
            ))}
          </div>
        </div>
        {/* Facility filter */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1">Filter by Facility</label>
          <select
            className="w-full p-2 border rounded-md"
            value={facilityFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFacilityFilter(e.target.value)}
          >
            <option value="">All Facilities</option>
            {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {/* Add slot form */}
        <div className="mb-6 flex flex-col gap-2">
          <label className="block text-xs font-semibold mb-1">Facility</label>
          <select
            className="w-full p-2 border rounded-md"
            value={facilityInput}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFacilityInput(e.target.value)}
          >
            <option value="">Select Facility</option>
            {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <Input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
          <Input type="time" value={time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)} />
          <Button onClick={handleAddSlot} disabled={!facilityInput}>Add Slot</Button>
        </div>
        {/* Table of slots */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-pink-100 text-pink-700">
                <th className="px-4 py-2 text-left">Facility</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4">No slots yet.</td></tr>
              )}
              {filteredSlots.map((slot: { id: string; facility: string; date: string; time: string }) => (
                <tr key={slot.id} className="border-b">
                  {editingSlotId === slot.id ? (
                    <>
                      <td className="px-4 py-2">{slot.facility}</td>
                      <td className="px-4 py-2">
                        <Input type="date" value={editDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDate(e.target.value)} className="w-32" />
                      </td>
                      <td className="px-4 py-2">
                        <Input type="time" value={editTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTime(e.target.value)} className="w-24" />
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(slot.id)}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">{slot.facility}</td>
                      <td className="px-4 py-2">{slot.date}</td>
                      <td className="px-4 py-2">{slot.time}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditSlot(slot)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSlot(slot.id)}>Delete</Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  );
} 