"use client";
import RoleGuard from "@/components/RoleGuard";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, query, where, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserContext } from "@/context/UserContext";

export function CreateReportForm({ onReportCreated, filterPrintsByPrintedBy }: { onReportCreated: () => void, filterPrintsByPrintedBy?: string }) {
  const { user, role } = useUserContext();
  const [patients, setPatients] = useState<any[]>([]); // Will hold { patientId, patientName, printedBy, timestamp }
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    clinicianId: "",
    type: "",
    fileUrl: "",
    status: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPatientsFromPrints() {
      const printsSnap = await getDocs(collection(db, "prints"));
      const patientMap = {};
      printsSnap.forEach(doc => {
        const data = doc.data();
        if (data.patientId && data.printedBy) {
          if (role === "clinician" && filterPrintsByPrintedBy) {
            console.log("Comparing printedBy:", data.printedBy, "with user.email:", filterPrintsByPrintedBy);
            if (data.printedBy !== filterPrintsByPrintedBy) return;
          }
          const key = data.patientId;
          if (!patientMap[key] || (data.timestamp && (!patientMap[key].timestamp || new Date(data.timestamp) > new Date(patientMap[key].timestamp)))) {
            patientMap[key] = {
              patientId: data.patientId,
              patientName: data.patientName || data.patientId,
              printedBy: data.printedBy || "",
              timestamp: data.timestamp,
            };
          }
        }
      });
      const patientArr = Object.values(patientMap);
      setPatients(patientArr);
      console.log("Loaded patients for dropdown (role:", role, "):", patientArr);
    }
    fetchPatientsFromPrints();
    // ...fetch clinicians as before...
    async function fetchClinicians() {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClinicians(users.filter(u => u.role === "clinician"));
    }
    fetchClinicians();
  }, [role, filterPrintsByPrintedBy]);

  // Helper to get latest print for this patient/clinician
  async function getLatestPrintForPatientAndClinician(patientId, clinicianId) {
    const q = query(
      collection(db, "prints"),
      where("patientId", "==", patientId),
      where("clinicianId", "==", clinicianId),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    return null;
  }

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const patient = patients.find(p => p.patientId === form.patientId);
      let clinicianIdToUse = form.clinicianId;
      let clinicianNameToUse = clinicians.find(c => c.uid === form.clinicianId)?.name;
      if (role === "clinician") {
        clinicianIdToUse = user?.uid;
        clinicianNameToUse = user?.name;
      }
      // Fallback for clinicianName
      if (!clinicianNameToUse) {
        clinicianNameToUse = clinicianIdToUse || "";
      }
      // Validation
      if (!form.patientId || !clinicianIdToUse) {
        setError("Please select a patient and clinician.");
        setLoading(false);
        return;
      }
      // Query latest print for this patient/clinician
      const latestPrint = await getLatestPrintForPatientAndClinician(form.patientId, clinicianIdToUse);
      // Log the data to be sent
      console.log('Creating report with:', {
        patientId: form.patientId,
        patientName: latestPrint?.patientName || patient?.patientName,
        clinicianId: clinicianIdToUse,
        clinicianName: clinicianNameToUse,
        type: form.type,
        fileUrl: form.fileUrl,
        status: form.status,
        date: form.date || new Date().toISOString(),
      });
      await addDoc(collection(db, "reports"), {
        patientId: form.patientId,
        patientName: latestPrint?.patientName || patient?.patientName,
        clinicianId: clinicianIdToUse,
        clinicianName: clinicianNameToUse,
        type: form.type,
        fileUrl: form.fileUrl,
        status: form.status,
        date: form.date || new Date().toISOString(),
      });
      setSuccess("Report created successfully!");
      setForm({
        patientId: "",
        clinicianId: "",
        type: "",
        fileUrl: "",
        status: "",
        date: "",
      });
      if (onReportCreated) onReportCreated();
    } catch (e) {
      setError("Failed to create report.");
      console.error("Error creating report:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mb-8">
      <h2 className="text-2xl font-bold mb-4">Create Report</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Patient</label>
          <select
            name="patientId"
            value={form.patientId}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">Select patient</option>
            {role === "admin"
              ? Array.from(new Set(patients.map(p => p.patientId))).map(pid => (
                  <option key={pid} value={pid}>{pid}</option>
                ))
              : patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>{p.patientId}</option>
                ))}
          </select>
        </div>
        {role === "admin" && (
          <div>
            <label className="block mb-1 font-semibold">Clinician</label>
            <select
              name="clinicianId"
              value={form.clinicianId}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="">Select clinician</option>
              {Array.from(new Set(patients
                .filter(p => !form.patientId || p.patientId === form.patientId)
                .map(p => p.printedBy)))
                .filter(email => !!email)
                .map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
            </select>
          </div>
        )}
        {role === "clinician" && (
          <div className="mb-2"><b>Clinician:</b> {user?.email}</div>
        )}
        <div>
          <label className="block mb-1 font-semibold">Type</label>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g. Lab Result"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">File URL</label>
          <input
            name="fileUrl"
            value={form.fileUrl}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Status</label>
          <input
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g. Reviewed"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Date</label>
          <input
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Report"}
        </Button>
      </form>
    </div>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const { role, loading: roleLoading } = useUserRole(user);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!roleLoading && role === "clinician") {
      router.replace("/dashboard/reports/clinician-page");
    }
  }, [role, roleLoading, router]);

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
        <CreateReportForm onReportCreated={fetchReports} />
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