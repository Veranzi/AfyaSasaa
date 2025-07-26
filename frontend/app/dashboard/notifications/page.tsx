"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleGuard from "@/components/RoleGuard";

const mockNotifications = [
  {
    id: 1,
    type: "info",
    message: "New patient registered: Jane Doe.",
    date: "2024-04-20 09:15",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    message: "Inventory low: FBC (Full Blood Count) at Machakos Level 5 Hospital.",
    date: "2024-04-19 16:40",
    read: false,
  },
  {
    id: 3,
    type: "success",
    message: "Treatment report generated for Pumwani Maternity Hospital.",
    date: "2024-04-19 14:10",
    read: true,
  },
  {
    id: 4,
    type: "error",
    message: "Failed to sync inventory data from Garissa County Referral Hospital.",
    date: "2024-04-18 18:22",
    read: false,
  },
  {
    id: 5,
    type: "info",
    message: "NHIF coverage report available for download.",
    date: "2024-04-18 10:05",
    read: true,
  },
];

const typeIcon: Record<string, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};
const typeColor: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  success: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAsUnread = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: false } : n));
  };
  const clearAll = () => setNotifications([]);

  return (
    <RoleGuard allowed={["clinician", "admin"]}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-7 w-7 text-pink-600" /> Notifications
          </h2>
          <Button variant="outline" onClick={clearAll} disabled={notifications.length === 0}>
            Clear All
          </Button>
        </div>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CheckCircle className="h-10 w-10 text-green-400 mb-2" />
                <div className="font-semibold text-gray-700">No new notifications!</div>
                <div className="text-gray-400 text-sm">You're all caught up.</div>
              </CardContent>
            </Card>
          ) : notifications.map(n => {
            const Icon = typeIcon[n.type];
            return (
              <Card key={n.id} className={`border-l-4 ${typeColor[n.type]}`.replace(' ', ' ')}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Icon className="h-6 w-6" />
                  <CardTitle className="text-base font-semibold flex-1">{n.message}</CardTitle>
                  <Badge variant={n.type === "error" ? "destructive" : n.type === "warning" ? "default" : "secondary"}>
                    {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-0">
                  <span className="text-xs text-gray-500">{n.date}</span>
                  <div className="flex gap-2">
                    {n.read ? (
                      <Button size="sm" variant="outline" onClick={() => markAsUnread(n.id)}>
                        Mark as Unread
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => markAsRead(n.id)}>
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </RoleGuard>
  );
} 