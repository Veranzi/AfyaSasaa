"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useUserContext } from "@/context/UserContext";
import RoleGuard from "@/components/RoleGuard";
import { CreateReportForm } from "../page";

export default function ClinicianReportsPage() {
  const { user } = useUserContext();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchReports() {
      setLoading(true);
      const q = query(collection(db, "reports"), where("clinicianId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchReports();
  }, [user]);

  return (
    <RoleGuard allowed={["clinician"]}>
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">My Reports</h2>
        <CreateReportForm
          onReportCreated={() => {
            // Refetch reports after creating a new one
            if (user) {
              const fetchReports = async () => {
                setLoading(true);
                const q = query(collection(db, "reports"), where("clinicianId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
              };
              fetchReports();
            }
          }}
          filterPrintsByPrintedBy={user?.email}
        />
        {loading ? (
          <div>Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-gray-500">No reports yet.</div>
        ) : (
          <ul className="space-y-4">
            {reports.map((rep) => (
              <li key={rep.id} className="border rounded-lg p-4 bg-white flex flex-col gap-2">
                <div><b>Patient:</b> {rep.patientName}</div>
                <div><b>Type:</b> {rep.type}</div>
                <div><b>Status:</b> {rep.status}</div>
                <div><b>Date:</b> {rep.date ? new Date(rep.date).toLocaleString() : "-"}</div>
                <a href={rep.fileUrl} className="text-blue-600 underline">Download</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RoleGuard>
  );
} 