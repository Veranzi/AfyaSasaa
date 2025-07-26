"use client";
import { useState } from "react";

const DEMO_PATIENT = {
  name: "Joan Atieno",
  id: "12345678",
  email: "joan.atieno@example.com",
};

export default function GenerateReportPage() {
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [delivery, setDelivery] = useState({ email: true, sms: false, portal: false, print: false });
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleDeliveryChange = (type: string) => {
    setDelivery(d => ({ ...d, [type]: !d[type] }));
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 2000);
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow text-center">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
          <span role="img" aria-label="location">📍</span> Report Sent!
        </h2>
        <div className="text-4xl mb-2">✅</div>
        <div className="text-green-700 text-lg font-semibold mb-4">The report has been securely sent to the patient.</div>
        <div className="mb-4 text-gray-600">🔐 Report is password-protected. Link valid for 72 hours.</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => window.location.reload()}>Generate Another Report</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span role="img" aria-label="location">📍</span> Generate & Send Report
      </h2>
      {/* Patient Info */}
      <div className="mb-6">
        <div className="font-bold mb-1">Patient Information</div>
        <div className="mb-1">👤 Name: {DEMO_PATIENT.name}</div>
        <div className="mb-1">🆔 Patient ID: {DEMO_PATIENT.id}</div>
        <div className="mb-1">📧 Email: {DEMO_PATIENT.email}</div>
      </div>
      {/* Visit Summary */}
      <div className="mb-6">
        <div className="font-bold mb-1">Visit Summary</div>
        <div className="mb-2">
          <label className="block font-medium mb-1">📝 Consultation Notes:</label>
          <textarea className="w-full border rounded px-3 py-2" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1">🧾 Diagnosis:</label>
          <textarea className="w-full border rounded px-3 py-2" rows={1} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1">💊 Prescriptions:</label>
          <textarea className="w-full border rounded px-3 py-2" rows={1} value={prescriptions} onChange={e => setPrescriptions(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1">📅 Follow-Up Instructions:</label>
          <textarea className="w-full border rounded px-3 py-2" rows={1} value={followUp} onChange={e => setFollowUp(e.target.value)} />
        </div>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded mb-2" onClick={() => setPreview(!preview)}>{preview ? "Hide Preview" : "Preview Report"}</button>
        {preview && (
          <div className="border rounded p-4 mt-2 bg-gray-50 text-left">
            <div className="font-bold mb-2">Report Preview</div>
            <div><b>Patient:</b> {DEMO_PATIENT.name} (ID: {DEMO_PATIENT.id})</div>
            <div><b>Email:</b> {DEMO_PATIENT.email}</div>
            <div className="mt-2"><b>Consultation Notes:</b> {notes}</div>
            <div><b>Diagnosis:</b> {diagnosis}</div>
            <div><b>Prescriptions:</b> {prescriptions}</div>
            <div><b>Follow-Up:</b> {followUp}</div>
          </div>
        )}
      </div>
      {/* Delivery Method */}
      <div className="mb-6">
        <div className="font-bold mb-1">Delivery Method</div>
        <div className="flex flex-wrap gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.email} onChange={() => handleDeliveryChange("email")} /> Email
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.sms} onChange={() => handleDeliveryChange("sms")} /> SMS
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.portal} onChange={() => handleDeliveryChange("portal")} /> Patient Portal
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.print} onChange={() => handleDeliveryChange("print")} /> Print
          </label>
        </div>
      </div>
      <button className="bg-pink-500 text-white px-4 py-2 rounded w-full font-bold mb-2" onClick={handleSend} disabled={sending}>
        {sending ? "Sending..." : "SEND SECURE REPORT →"}
      </button>
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
        <span role="img" aria-label="lock">🔒</span> Report will be password-protected &bull; Link valid for 72 hours
      </div>
    </div>
  );
} 