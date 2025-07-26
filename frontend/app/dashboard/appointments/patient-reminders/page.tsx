"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import RoleGuard from "@/components/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

export default function PatientRemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { role } = useUserRole(auth.currentUser);

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("Not logged in");
          setLoading(false);
          return;
        }
        const q = query(collection(db, "reminders"), where("recipient", "==", user.uid));
        const snapshot = await getDocs(q);
        setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        setError("Failed to fetch reminders");
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  return (
    <RoleGuard allowed={["patient", "admin"]}>
      <div className="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-4">My Reminders</h2>
        {role === "admin" ? (
          <div className="text-lg text-center text-gray-500 mt-12">Admins do not have a personal reminders page. Please use <b>Manage Reminders</b> from the sidebar.</div>
        ) : loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : reminders.length === 0 ? (
          <div>No reminders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg bg-white shadow">
              <thead className="bg-pink-100">
                <tr>
                  <th className="px-4 py-2 border">Message</th>
                  <th className="px-4 py-2 border">Scheduled</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map(rem => (
                  <tr key={rem.id} className="hover:bg-pink-50 transition">
                    <td className="px-4 py-2 border font-medium">{rem.message}</td>
                    <td className="px-4 py-2 border text-gray-500">{rem.sendAt?.toDate?.().toLocaleString?.() || String(rem.sendAt)}</td>
                    <td className="px-4 py-2 border text-xs">
                      <span className={rem.sent ? "text-green-600 font-semibold flex items-center gap-1" : "text-yellow-600 font-semibold flex items-center gap-1"}>
                        {rem.sent ? "✅ Sent" : "⏳ Pending"}
                      </span>
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