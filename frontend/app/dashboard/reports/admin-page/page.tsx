'use client';
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import RoleGuard from "@/components/RoleGuard";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editReport, setEditReport] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

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

  function openEditModal(report: any) {
    setEditReport(report);
    setEditForm({
      type: report.type || "",
      status: report.status || "",
      fileUrl: report.fileUrl || "",
    });
  }

  function closeEditModal() {
    setEditReport(null);
    setEditForm({});
  }

  async function handleEditSave() {
    if (!editReport) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "reports", editReport.id), {
        type: editForm.type,
        status: editForm.status,
        fileUrl: editForm.fileUrl,
      });
      closeEditModal();
      fetchReports();
    } catch (e) {
      setError("Failed to update report.");
      console.error("Error updating report:", e);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <RoleGuard allowed={["admin"]}>
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-pink-700">Manage Reports</h2>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-gray-500 text-center">No reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg bg-white shadow">
              <thead className="bg-pink-100">
                <tr>
                  <th className="px-4 py-2 border">Patient</th>
                  <th className="px-4 py-2 border">Clinician</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">File</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-pink-50 transition">
                    <td className="px-4 py-2 border">{rep.patientName}</td>
                    <td className="px-4 py-2 border">{rep.clinicianName}</td>
                    <td className="px-4 py-2 border">{rep.type}</td>
                    <td className="px-4 py-2 border">{rep.status}</td>
                    <td className="px-4 py-2 border">{rep.date ? new Date(rep.date).toLocaleString() : "-"}</td>
                    <td className="px-4 py-2 border">
                      {rep.fileUrl ? (
                        <a href={rep.fileUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border flex gap-2">
                      <button
                        onClick={() => openEditModal(rep)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow"
                      >Edit</button>
                      <button
                        onClick={() => handleDeleteReport(rep.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editReport && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                onClick={closeEditModal}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                aria-label="Close"
              >&times;</button>
              <h3 className="text-xl font-bold mb-4 text-pink-700">Edit Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">Type</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Status</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">File URL</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={editForm.fileUrl}
                    onChange={e => setEditForm({ ...editForm, fileUrl: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleEditSave}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded shadow font-bold"
                    disabled={saving}
                  >{saving ? "Saving..." : "Save"}</button>
                  <button
                    onClick={closeEditModal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded shadow"
                  >Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
} 