"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDoc, Timestamp } from "firebase/firestore";
import RoleGuard from "@/components/RoleGuard";

export default function AdminRemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editSendAt, setEditSendAt] = useState("");
  const [editSent, setEditSent] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = collection(db, "reminders");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (rem: any) => {
    setEditId(rem.id);
    setEditMessage(rem.message);
    setEditSendAt(rem.sendAt ? new Date(rem.sendAt.seconds ? rem.sendAt.seconds * 1000 : rem.sendAt).toISOString().slice(0, 16) : "");
    setEditSent(rem.sent);
  };

  const handleSave = async () => {
    if (!editId) return;
    await updateDoc(doc(db, "reminders", editId), {
      message: editMessage,
      sendAt: editSendAt ? Timestamp.fromDate(new Date(editSendAt)) : null,
      sent: editSent,
    });
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      await deleteDoc(doc(db, "reminders", id));
    }
  };

  // Send SMS reminder
  const handleSendReminder = async (rem: any) => {
    setSendingId(rem.id);
    setFeedback("");
    let phone = rem.phone;
    if (!phone) {
      // Try to fetch from users collection
      try {
        const userDoc = await getDoc(doc(db, "users", rem.recipient));
        phone = userDoc.exists() ? userDoc.data().phone : null;
      } catch (e) {
        setFeedback("Failed to fetch user phone number.");
        setSendingId(null);
        return;
      }
    }
    if (!phone) {
      setFeedback("No phone number found for this recipient.");
      setSendingId(null);
      return;
    }
    try {
      // Use the Next.js API route instead of FastAPI
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderId: rem.id,
          to: phone,
          message: rem.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback("SMS sent successfully!");
        // Update the reminder's sent status in Firestore
        await updateDoc(doc(db, "reminders", rem.id), {
          sent: true
        });
      } else {
        setFeedback("Failed to send SMS: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      setFeedback("Failed to send SMS: " + (e instanceof Error ? e.message : "Unknown error"));
    }
    setSendingId(null);
  };

  // Copy phone to clipboard handler
  const handleCopyPhone = (phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  };

  const filteredReminders = reminders.filter(rem =>
    !search ||
    (rem.message && rem.message.toLowerCase().includes(search.toLowerCase())) ||
    (rem.recipient && rem.recipient.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <RoleGuard allowed={["admin"]}>
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6">Manage Reminders</h2>
        <input
          className="border rounded px-3 py-2 mb-6 w-full text-lg"
          placeholder="Search reminders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {feedback && <div className="mb-4 text-blue-700 font-semibold text-lg">{feedback}</div>}
        {loading ? (
          <div className="text-lg">Loading...</div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-gray-500 text-lg">No reminders found.</div>
        ) : (
          <ul className="space-y-4">
            {filteredReminders.map(rem => (
              <li key={rem.id} className="border rounded-lg p-4 bg-white flex flex-col gap-2">
                <div><b>Recipient:</b> {rem.patient || rem.recipient}</div>
                <div><b>Reminder Set For:</b> {rem.sendAt ? new Date(rem.sendAt.seconds ? rem.sendAt.seconds * 1000 : rem.sendAt).toLocaleString() : "-"}</div>
                <div><b>SMS:</b> {rem.sent ? "Yes" : "No"} | <b>Email:</b> {rem.reminderEmail ? "Yes" : "No"}</div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-mono select-all text-base">{rem.phone ? rem.phone : <span className="text-gray-400">No phone</span>}</span>
                  {rem.phone && (
                    <button
                      className="ml-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                      onClick={() => handleCopyPhone(rem.phone)}
                      title="Copy phone number"
                    >
                      {copiedPhone === rem.phone ? "Copied!" : "Copy"}
                    </button>
                  )}
                  {editId === rem.id ? (
                    <>
                      <button className="bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={handleSave}>Save</button>
                      <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded mr-2" onClick={() => handleEdit(rem)}>Edit</button>
                  )}
                  <button className="bg-red-600 text-white px-4 py-2 rounded mr-2" onClick={() => handleDelete(rem.id)}>Delete</button>
                  {rem.sent ? null : (
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      disabled={sendingId === rem.id}
                      onClick={() => handleSendReminder(rem)}
                    >
                      {sendingId === rem.id ? "Sending..." : "Send Reminder"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RoleGuard>
  );
} 