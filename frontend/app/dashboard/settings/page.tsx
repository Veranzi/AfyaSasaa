"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Sun, Moon, Bell, User } from "lucide-react";

export default function SettingsPage() {
  // Mock profile data
  const [profile, setProfile] = useState({
    name: "Dr. Jane Doe",
    email: "jane.doe@hospital.org",
    role: "Clinician",
  });
  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    patientAlerts: true,
    inventoryAlerts: true,
    treatmentAlerts: true,
    email: true,
    sms: false,
  });
  // Appearance
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center gap-2">
        <User className="h-7 w-7 text-pink-600" /> Settings
      </h2>
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
          <Button className="mt-2">Update Profile</Button>
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
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          {darkMode ? <Moon className="h-5 w-5 text-gray-800" /> : <Sun className="h-5 w-5 text-yellow-500" />}
        </CardContent>
      </Card>
    </div>
  );
} 