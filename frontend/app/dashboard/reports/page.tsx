"use client";
import { useState } from "react";
import { useGoogleSheet } from "@/hooks/useGoogleSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Download,
  FileText,
  Calendar as CalendarIcon,
  Search,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const OVARIAN_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=0&single=true&output=csv";
const INVENTORY_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=1858485866&single=true&output=csv";
const TREATMENT_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=1665109618&single=true&output=csv";

export default function ReportsPage() {
  const { data: patients } = useGoogleSheet(OVARIAN_DATA_CSV);
  const { data: inventory } = useGoogleSheet(INVENTORY_DATA_CSV);
  const { data: treatments } = useGoogleSheet(TREATMENT_DATA_CSV);
  const [search, setSearch] = useState("");

  // Metrics from real data
  const totalReports = (treatments?.length || 0) + (inventory?.length || 0) + (patients?.length || 0);
  // Map real categories to Analytics/Statistics
  const analyticsCategories = ["Lab Test", "Imaging"];
  const statisticsCategories = ["Consultation", "Surgery"];
  const analyticsReports = (treatments || []).filter(t => analyticsCategories.includes(t["Category"])).length;
  const statisticsReports = (treatments || []).filter(t => statisticsCategories.includes(t["Category"])).length;
  const inventoryReports = inventory?.length || 0;

  // Build a real reports list (latest treatments, inventory, patients)
  const realReports = [
    ...(treatments || []).slice(0, 5).map((t, i) => ({
      id: `TREAT-${i+1}`,
      title: t["Service"] || t["Category"] || t["Treatment"] || "Treatment Report",
      type: t["Category"] || "Treatment",
      date: t["Date"] || "-",
      status: "Generated",
      format: "CSV",
      size: t["Base Cost (KES)"] ? `${Number(t["Base Cost (KES)"]).toLocaleString()} KES` : "-",
      icon: BarChart3,
      _rawRow: t,
    })),
    ...(inventory || []).slice(0, 3).map((inv, i) => ({
      id: `INV-${i+1}`,
      title: inv["Item"] || "Inventory Report",
      type: inv["Category"] || "Inventory",
      date: inv["Last Restock"] || "-",
      status: "Generated",
      format: "CSV",
      size: inv["Available Stock"] ? `${inv["Available Stock"]} units` : "-",
      icon: FileText,
      _rawRow: inv,
    })),
    ...(patients || []).slice(0, 2).map((p, i) => ({
      id: `PAT-${i+1}`,
      title: p["Patient ID"] || "Patient Report",
      type: "Patient",
      date: p["Date"] || "-",
      status: "Generated",
      format: "CSV",
      size: p["Age"] ? `${p["Age"]} yrs` : "-",
      icon: PieChart,
      _rawRow: p,
    })),
  ];

  // Search filter
  const filteredReports = realReports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Pick a date range</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
            Generate Report
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsReports}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statistics Reports</CardTitle>
            <PieChart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statisticsReports}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Reports</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryReports}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            placeholder="Search reports..."
            className="pl-8 w-full p-2 border rounded-md"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.length > 0 ? filteredReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white">
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{report.title}</div>
                    <div className="text-sm text-gray-600">ID: {report.id} • {report.type}</div>
                    <div className="text-sm text-gray-600">Format: {report.format} • Size: {report.size}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {report.status}
                  </Badge>
                  <div className="text-xs text-gray-500">Generated: {report.date}</div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => {
                    // Download the report as CSV
                    const row = report._rawRow;
                    if (row) {
                      const csv = Object.keys(row).join(",") + "\n" + Object.values(row).join(",");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${report.title.replace(/\s+/g, "-").toLowerCase()}-${report.id}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-4">No reports found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 