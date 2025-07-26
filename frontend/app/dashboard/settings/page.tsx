"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Sun, Moon, Bell, User } from "lucide-react";
import { useTheme } from "next-themes";
import RoleGuard from "@/components/RoleGuard";
import { useUserContext } from "@/context/UserContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React from "react";

type NotifPrefs = {
  [key: string]: boolean;
};

export default function SettingsPage() {
  const { user } = useUserContext();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    patientAlerts: true,
    inventoryAlerts: true,
    treatmentAlerts: true,
    email: true,
    sms: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Load user preferences on login
  React.useEffect(() => {
    async function loadUserPrefs() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.theme) setTheme(data.theme);
          setProfile({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "",
          });
        }
      } catch (e) {
        setError("Failed to load user settings.");
      } finally {
        setLoading(false);
      }
    }
    loadUserPrefs();
  }, [user, setTheme]);

  // Save theme to Firestore when toggled
  const handleThemeChange = async (v: boolean) => {
    const newTheme = v ? "dark" : "light";
    setTheme(newTheme);
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { theme: newTheme });
      } catch (e) {
        setError("Failed to save theme preference.");
      }
    }
  };

  // Save profile to Firestore
  const handleProfileUpdate = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: profile.name,
        email: profile.email,
        role: profile.role,
      });
    } catch (e) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }
  if (!user) {
    return <div className="p-8 text-center text-red-600">You must be logged in to view settings.</div>;
  }

  return (
    <RoleGuard allowed={["clinician", "admin", "patient"]}>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <User className="h-7 w-7 text-pink-600" /> Settings
        </h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1">Name</label>
                <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1">Email</label>
                <Input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1">Role</label>
                <Input value={profile.role} disabled />
              </div>
            </div>
            <Button className="mt-2" onClick={handleProfileUpdate} disabled={saving}>{saving ? "Saving..." : "Update Profile"}</Button>
          </CardContent>
        </Card>
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-pink-500" /> Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Patient Alerts</span>
              <Switch checked={notifPrefs.patientAlerts} onCheckedChange={v => setNotifPrefs(p => ({ ...p, patientAlerts: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <span>Inventory Alerts</span>
              <Switch checked={notifPrefs.inventoryAlerts} onCheckedChange={v => setNotifPrefs(p => ({ ...p, inventoryAlerts: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <span>Treatment Alerts</span>
              <Switch checked={notifPrefs.treatmentAlerts} onCheckedChange={v => setNotifPrefs(p => ({ ...p, treatmentAlerts: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <Switch checked={notifPrefs.email} onCheckedChange={v => setNotifPrefs(p => ({ ...p, email: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Notifications</span>
              <Switch checked={notifPrefs.sms} onCheckedChange={v => setNotifPrefs(p => ({ ...p, sms: v }))} />
            </div>
          </CardContent>
        </Card>
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5 text-yellow-500" /> Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <span>Dark Mode</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={handleThemeChange}
            />
            {(theme === "dark") ? (
              <Moon className="h-5 w-5 text-gray-800" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
} 