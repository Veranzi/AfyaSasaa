import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useUniquePatientCount(clinicianId: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!clinicianId) return;
    async function fetchCount() {
      const q = query(
        collection(db, "prints"),
        where("clinicianId", "==", clinicianId)
      );
      const querySnapshot = await getDocs(q);
      const uniquePatientIds = new Set<string>();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.patientId) {
          uniquePatientIds.add(data.patientId);
        }
      });
      setCount(uniquePatientIds.size);
    }
    fetchCount();
  }, [clinicianId]);

  return count;
}

export function ClinicianStats({ clinicianId }: { clinicianId: string | null }) {
  const uniquePatientCount = useUniquePatientCount(clinicianId);

  return (
    <div>
      Unique patients attended: <b>{uniquePatientCount}</b>
    </div>
  );
}

// Admin version: show stats for all clinicians
// Now includes: unique patients, total reports, last print date, date filtering, CSV export

type ClinicianInfo = {
  uid: string;
  name?: string;
  email?: string;
};

type ClinicianAnalytics = {
  clinician: ClinicianInfo;
  uniquePatients: number;
  totalReports: number;
  lastPrintDate: string | null;
};

function toISODateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function AllCliniciansStats() {
  const [stats, setStats] = useState<ClinicianAnalytics[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    async function fetchStats() {
      // Get all clinicians from users collection
      const usersSnap = await getDocs(query(collection(db, "users")));
      const clinicians: ClinicianInfo[] = usersSnap.docs
        .map(doc => doc.data())
        .filter(u => u.role === "clinician")
        .map(u => ({ uid: u.uid, name: u.name, email: u.email }));

      // Get all prints
      const printsSnap = await getDocs(collection(db, "prints"));
      // Map: clinicianId -> { uniquePatientIds, totalReports, lastPrintDate }
      const analyticsMap: Record<string, { uniquePatientIds: Set<string>, totalReports: number, lastPrintDate: string | null }> = {};
      printsSnap.forEach(doc => {
        const data = doc.data();
        if (data.clinicianId && data.timestamp) {
          // Date filtering
          const printDate = new Date(data.timestamp);
          if (startDate && printDate < new Date(startDate)) return;
          if (endDate && printDate > new Date(endDate + 'T23:59:59')) return;

          if (!analyticsMap[data.clinicianId]) {
            analyticsMap[data.clinicianId] = { uniquePatientIds: new Set(), totalReports: 0, lastPrintDate: null };
          }
          if (data.patientId) {
            analyticsMap[data.clinicianId].uniquePatientIds.add(data.patientId);
          }
          analyticsMap[data.clinicianId].totalReports += 1;
          // Track last print date
          const prev = analyticsMap[data.clinicianId].lastPrintDate;
          if (!prev || new Date(data.timestamp) > new Date(prev)) {
            analyticsMap[data.clinicianId].lastPrintDate = data.timestamp;
          }
        }
      });

      // Build stats array
      const statsArr: ClinicianAnalytics[] = clinicians.map(clinician => {
        const analytics = analyticsMap[clinician.uid] || { uniquePatientIds: new Set(), totalReports: 0, lastPrintDate: null };
        return {
          clinician,
          uniquePatients: analytics.uniquePatientIds.size,
          totalReports: analytics.totalReports,
          lastPrintDate: analytics.lastPrintDate ? new Date(analytics.lastPrintDate).toLocaleString() : "-"
        };
      });
      setStats(statsArr);
    }
    fetchStats();
  }, [startDate, endDate]);

  // CSV Export
  function exportToCSV() {
    const header = ["Clinician","Email","Unique Patients","Total Reports","Last Print Date"];
    const rows = stats.map(({ clinician, uniquePatients, totalReports, lastPrintDate }) => [
      clinician.name || clinician.uid,
      clinician.email || "-",
      uniquePatients,
      totalReports,
      lastPrintDate
    ]);
    const csvContent = [header, ...rows].map(r => r.map(x => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinician_stats_${toISODateString(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h3>Clinician Patient Stats</h3>
      <div style={{ marginBottom: 12 }}>
        <label>Start Date: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
        <label style={{ marginLeft: 16 }}>End Date: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        <button style={{ marginLeft: 16 }} onClick={exportToCSV}>Export to CSV</button>
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>Clinician</th>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>Unique Patients</th>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>Total Reports</th>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>Last Print Date</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(({ clinician, uniquePatients, totalReports, lastPrintDate }) => (
            <tr key={clinician.uid}>
              <td style={{ border: "1px solid #ccc", padding: 4 }}>{clinician.name || clinician.uid}</td>
              <td style={{ border: "1px solid #ccc", padding: 4 }}>{clinician.email || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: 4 }}>{uniquePatients}</td>
              <td style={{ border: "1px solid #ccc", padding: 4 }}>{totalReports}</td>
              <td style={{ border: "1px solid #ccc", padding: 4 }}>{lastPrintDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 