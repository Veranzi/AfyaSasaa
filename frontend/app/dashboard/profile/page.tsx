"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { User, Calendar, Bell, Facebook, Twitter, Linkedin, Instagram, Mail, Heart, Users, Edit, Info, Settings as SettingsIcon, MessageCircle, Clock, Phone, Smartphone } from "lucide-react";

export default function PatientProfilePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const { role } = useUserRole(auth.currentUser);
  const user = auth.currentUser;
  const [tab, setTab] = useState<'about'|'friends'|'mypost'|'timeline'|'settings'>('about');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (role === "patient" && user) {
      db && getDocs(query(collection(db, "users"), where("uid", "==", user.uid))).then(snapshot => {
        setUserInfo(snapshot.docs[0]?.data() || null);
        setEditForm(snapshot.docs[0]?.data() || {});
      });
      db && getDocs(query(collection(db, "appointments"), where("patientId", "==", user.uid))).then(snapshot => {
        setAppointments(snapshot.docs.map(doc => doc.data()));
      });
      db && getDocs(query(collection(db, "reminders"), where("recipient", "==", user.uid))).then(snapshot => {
        setReminders(snapshot.docs.map(doc => doc.data()));
      });
    }
  }, [role, user]);

  if (role !== "patient") {
    return <div className="p-8 text-center text-gray-500">Not authorized.</div>;
  }

  const nextAppointment = appointments
    .filter((a: any) => new Date(a.date) > new Date())
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const profileImg = userInfo?.photoURL || user?.photoURL || "/placeholder-user.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-pink-500 px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between rounded-b-3xl shadow">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Profile</h1>
          <div className="text-white text-sm mt-1">Welcome to AfyaSasa, your personal health dashboard!</div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button className="flex items-center gap-1 bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-100 transition" onClick={() => setEditOpen(true)}><Edit className="h-4 w-4" /> Edit Profile</button>
          <button className="flex items-center gap-1 bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-100 transition"><Heart className="h-4 w-4" /> Follow</button>
          <button className="flex items-center gap-1 bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-100 transition"><Mail className="h-4 w-4" /> Message</button>
        </div>
      </div>
      {/* Profile Card and Stats */}
      <div className="max-w-6xl mx-auto -mt-16 flex flex-col md:flex-row gap-8 p-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow p-6 w-full md:w-1/3 flex flex-col items-center">
          <img src={profileImg} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-pink-200 shadow mb-4" />
          <div className="text-xl font-bold text-gray-800">{userInfo?.name || user?.displayName || "USER NAME"}</div>
          <div className="text-sm text-pink-500 font-semibold mb-1">Patient</div>
          <div className="text-gray-500 text-center text-sm mb-2">{userInfo?.address || "No address on file"}</div>
          <div className="flex gap-3 mt-2">
            <a href="#" className="text-gray-400 hover:text-pink-500"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-pink-500"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-pink-500"><Linkedin className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-pink-500"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
        {/* Stats Row */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div className="bg-blue-100 text-blue-700 rounded-xl p-6 flex flex-col items-center justify-center shadow">
            <Calendar className="h-6 w-6 mb-1" />
            <div className="text-2xl font-bold">{appointments.length}</div>
            <div className="text-xs mt-1">Appointments</div>
          </div>
          <div className="bg-pink-100 text-pink-700 rounded-xl p-6 flex flex-col items-center justify-center shadow">
            <Bell className="h-6 w-6 mb-1" />
            <div className="text-2xl font-bold">{reminders.length}</div>
            <div className="text-xs mt-1">Reminders</div>
          </div>
          <div className="bg-green-100 text-green-700 rounded-xl p-6 flex flex-col items-center justify-center shadow">
            <Clock className="h-6 w-6 mb-1" />
            <div className="text-2xl font-bold">{nextAppointment ? new Date(nextAppointment.date).toLocaleDateString() : '-'}</div>
            <div className="text-xs mt-1">Next Appt</div>
          </div>
          <div className="bg-yellow-100 text-yellow-700 rounded-xl p-6 flex flex-col items-center justify-center shadow">
            <User className="h-6 w-6 mb-1" />
            <div className="text-2xl font-bold">{(appointments.length + reminders.length) ? ((appointments.length + reminders.length) / 2).toFixed(1) : '8.9'}</div>
            <div className="text-xs mt-1">Wellness Score</div>
          </div>
        </div>
      </div>
      {/* Tabs and Content */}
      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow p-6">
        <div className="flex gap-4 mb-6 border-b pb-2">
          <button onClick={() => setTab('about')} className={`flex items-center gap-1 px-3 py-1 rounded-t-lg font-semibold text-sm transition ${tab==='about' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' : 'text-gray-500 hover:text-pink-500'}`}><Info className="h-4 w-4" /> About</button>
          <button onClick={() => setTab('friends')} className={`flex items-center gap-1 px-3 py-1 rounded-t-lg font-semibold text-sm transition ${tab==='friends' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' : 'text-gray-500 hover:text-pink-500'}`}><Users className="h-4 w-4" /> Friends</button>
          <button onClick={() => setTab('mypost')} className={`flex items-center gap-1 px-3 py-1 rounded-t-lg font-semibold text-sm transition ${tab==='mypost' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' : 'text-gray-500 hover:text-pink-500'}`}><MessageCircle className="h-4 w-4" /> My Post</button>
          <button onClick={() => setTab('timeline')} className={`flex items-center gap-1 px-3 py-1 rounded-t-lg font-semibold text-sm transition ${tab==='timeline' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' : 'text-gray-500 hover:text-pink-500'}`}><Calendar className="h-4 w-4" /> Timeline</button>
          <button onClick={() => setTab('settings')} className={`flex items-center gap-1 px-3 py-1 rounded-t-lg font-semibold text-sm transition ${tab==='settings' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50' : 'text-gray-500 hover:text-pink-500'}`}><SettingsIcon className="h-4 w-4" /> Settings</button>
        </div>
        {tab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-2"><b>Email:</b> {userInfo?.email || user?.email || '-'}</div>
              <div className="mb-2"><b>Phone:</b> {userInfo?.phone || '-'}</div>
              <div className="mb-2"><b>Mobile:</b> {userInfo?.mobile || '-'}</div>
              <div className="mb-2"><b>Date of Birth:</b> {userInfo?.dob || '-'}</div>
            </div>
            <div>
              <div className="mb-2"><b>Address:</b> {userInfo?.address || '-'}</div>
              <div className="mb-2"><b>Gender:</b> {userInfo?.gender || '-'}</div>
            </div>
          </div>
        )}
        {tab === 'friends' && (
          <div className="text-gray-500">Your friends will appear here soon.</div>
        )}
        {tab === 'mypost' && (
          <div className="text-gray-500">Your posts will appear here soon.</div>
        )}
        {tab === 'timeline' && (
          <div className="text-gray-500">Your recent appointments and reminders will appear here soon.</div>
        )}
        {tab === 'settings' && (
          <div className="text-gray-500">Profile settings coming soon.</div>
        )}
      </div>
      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button onClick={() => setEditOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-pink-600 text-2xl">&times;</button>
            <h2 className="text-xl font-bold mb-4 text-pink-600">Edit Profile</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setFeedback("");
              try {
                if (!userInfo?.uid) throw new Error("User not found");
                await updateDoc(doc(db, "users", userInfo.uid), {
                  name: editForm.name || "",
                  email: editForm.email || "",
                  phone: editForm.phone || "",
                  mobile: editForm.mobile || "",
                  address: editForm.address || "",
                  gender: editForm.gender || "",
                  dob: editForm.dob || "",
                });
                setFeedback("Profile updated successfully!");
                setEditOpen(false);
                // Refresh user info
                db && getDocs(query(collection(db, "users"), where("uid", "==", user.uid))).then(snapshot => {
                  setUserInfo(snapshot.docs[0]?.data() || null);
                });
              } catch (err: any) {
                setFeedback("Failed to update profile: " + (err.message || err));
              } finally {
                setSaving(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Name</label>
                  <input className="border rounded px-3 py-2 w-full" value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input className="border rounded px-3 py-2 w-full" value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <input className="border rounded px-3 py-2 w-full" value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Mobile</label>
                  <input className="border rounded px-3 py-2 w-full" value={editForm.mobile || ""} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Address</label>
                  <input className="border rounded px-3 py-2 w-full" value={editForm.address || ""} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Gender</label>
                  <input className="border rounded px-3 py-2 w-full" value={editForm.gender || ""} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                  <input className="border rounded px-3 py-2 w-full" value={editForm.dob || ""} onChange={e => setEditForm({ ...editForm, dob: e.target.value })} />
                </div>
              </div>
              {feedback && <div className="mt-4 text-center text-pink-600 font-semibold">{feedback}</div>}
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 shadow">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 