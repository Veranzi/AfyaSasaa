"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import RoleGuard from "@/components/RoleGuard";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchReports() {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReport(reportId: string) {
    try {
      await deleteDoc(doc(db, "reports", reportId));
      fetchReports();
    } catch (e) {
      setError("Failed to delete report.");
      console.error("Error deleting report:", e);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <RoleGuard allowed={["admin"]}>
      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6">Manage Reports</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-gray-500">No reports found.</div>
        ) : (
          <ul className="space-y-4">
            {reports.map((rep) => (
              <li key={rep.id} className="border rounded-lg p-4 bg-white flex flex-col gap-2">
                <div><b>Patient:</b> {rep.patientName}</div>
                <div><b>Clinician:</b> {rep.clinicianName}</div>
                <div><b>Type:</b> {rep.type}</div>
                <div><b>Status:</b> {rep.status}</div>
                <div><b>Date:</b> {rep.date ? new Date(rep.date).toLocaleString() : "-"}</div>
                <a href={rep.fileUrl} className="text-blue-600 underline">Download</a>
                <button onClick={() => handleDeleteReport(rep.id)} className="text-red-600 mt-2">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RoleGuard>
  );
} 