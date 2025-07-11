"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter } from "lucide-react"
import { useGoogleSheet } from "@/hooks/useGoogleSheet"

const OVARIAN_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=0&single=true&output=csv";

export default function PatientsPage() {
  const ovarian = useGoogleSheet(OVARIAN_DATA_CSV);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string | null>(null);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  if (ovarian.loading) return <div>Loading...</div>;
  if (ovarian.error) return <div>Error loading data</div>;

  // Map ovarian_data to patients for display
  const patients = (ovarian.data || []).filter(p => p["Patient ID"]).map((p, idx) => ({
    id: p["Patient ID"] || `P${idx+1}`,
    name: p["Patient ID"] || "Unknown",
    age: p["Age"] || "-",
    risk: p["Recommended Management"] === "Referral"
      ? "High"
      : p["Recommended Management"] === "Surgery"
      ? "Medium"
      : p["Recommended Management"] === "Medication"
      ? "Low"
      : p["Recommended Management"] === "Observation"
      ? "Moderate"
      : "-",
    status: p["Recommended Management"] || "-",
    nextVisit: p["Date of Exam"] || "-",
    lastVisit: "-", // Not available in sheet
    condition: p["Ultrasound Features"] || "-",
    contact: "-", // Not available in sheet
  }));

  // Filter patients by search, risk, and age
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      search === "" ||
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.id.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = !riskFilter || patient.risk === riskFilter;
    const ageNum = Number(patient.age);
    const matchesMinAge = !minAge || (ageNum >= Number(minAge));
    const matchesMaxAge = !maxAge || (ageNum <= Number(maxAge));
    return matchesSearch && matchesRisk && matchesMinAge && matchesMaxAge;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
        <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
          <Plus className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search patients..."
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilter(f => !f)}>
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {showFilter && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold mb-1">Risk Level</label>
            <select
              className="border rounded px-2 py-1"
              value={riskFilter || ""}
              onChange={e => setRiskFilter(e.target.value || null)}
            >
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Min Age</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20"
              value={minAge}
              onChange={e => setMinAge(e.target.value)}
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Max Age</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20"
              value={maxAge}
              onChange={e => setMaxAge(e.target.value)}
              min={0}
            />
          </div>
          <Button variant="secondary" onClick={() => { setRiskFilter(null); setMinAge(""); setMaxAge(""); }}>Clear Filters</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {patient.name}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-600">ID: {patient.id} • Age {patient.age}</div>
                    <div className="text-sm text-gray-600">Condition: {patient.condition}</div>
                    <div className="text-sm text-gray-600">Contact: {patient.contact}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      patient.risk === "High"
                        ? "destructive"
                        : patient.risk === "Medium"
                        ? "default"
                        : patient.risk === "Moderate"
                        ? "outline"
                        : "secondary"
                    }
                    className="mb-1"
                  >
                    {patient.risk} Risk
                  </Badge>
                  <div className="text-sm text-gray-600">{patient.status}</div>
                  <div className="text-xs text-gray-500">Last Visit: {patient.lastVisit}</div>
                  <div className="text-xs text-gray-500">Next: {patient.nextVisit}</div>
                </div>
              </div>
            ))}
            {filteredPatients.length === 0 && <div className="text-center text-gray-500">No patients found.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 