"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Package, DollarSign, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react"
import { useGoogleSheet } from "@/hooks/useGoogleSheet"
import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart } from 'recharts';

const OVARIAN_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=0&single=true&output=csv";
const INVENTORY_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=1858485866&single=true&output=csv";
const TREATMENT_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=1665109618&single=true&output=csv";

interface InventoryItem {
  id: string;
  item: string;
  stock: number;
  threshold: number;
  status: "critical" | "low" | "good";
  category: string;
  lastRestock: string;
  supplier: string;
  location: string;
  locationKey: string;
}

interface PatientData {
  "Patient ID": string;
  "Age": string;
  "Risk Level": string;
  "Date": string;
  [key: string]: string;
}

interface InventoryData {
  "ID": string;
  "Item": string;
  "Available Stock": string;
  "Threshold": string;
  "Category": string;
  "Last Restock": string;
  "Supplier": string;
  "Facility": string;
  [key: string]: string;
}

interface DashboardProps {
  initialTab?: 'dashboard' | 'treatment';
}

export function Dashboard({ initialTab = 'dashboard' }: DashboardProps) {
  const { data: ovarianSheet, loading: ovarianLoading } = useGoogleSheet(OVARIAN_DATA_CSV);
  const { data: inventorySheet, loading: inventoryLoading } = useGoogleSheet(INVENTORY_DATA_CSV);
  const { data: treatmentSheet, loading: treatmentLoading } = useGoogleSheet(TREATMENT_DATA_CSV);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'treatment'>(initialTab);

  // Treatment tab filters
  const [treatmentFacility, setTreatmentFacility] = useState("");
  const [treatmentCategory, setTreatmentCategory] = useState("");
  const [treatmentNHIF, setTreatmentNHIF] = useState("");

  if (ovarianLoading || inventoryLoading || treatmentLoading) {
    return <div>Loading...</div>;
  }

  // Map ovarian_data to patients for display
  const patients = (ovarianSheet || []).filter(p => p["Patient ID"]).map((p: PatientData) => {
    let risk = "Unknown";
    const mgmt = (p["Recommended Management"] || "").trim();
    if (mgmt === "Referral") risk = "High";
    else if (mgmt === "Surgery") risk = "Medium";
    else if (mgmt === "Medication") risk = "Low";
    else if (mgmt === "Observation") risk = "Moderate";
    return {
      name: p["Patient ID"] || "Unknown",
      age: p["Age"] || "-",
      risk,
      date: p["Date"] ? new Date(p["Date"]).toLocaleDateString() : "-",
    };
  });

  // Map inventory_data for display
  const inventoryItems = (inventorySheet || []).filter(i => i["Item"]).map((i: InventoryData, idx: number): InventoryItem => ({
    id: i["ID"] || `I${idx+1}`,
    item: i["Item"] || "Unknown",
    stock: Number(i["Available Stock"] || 0),
    threshold: Number(i["Threshold"] || 10),
    status: Number(i["Available Stock"] || 0) <= Number(i["Threshold"] || 10)
      ? (Number(i["Available Stock"] || 0) <= 5 ? "critical" : "low")
      : "good",
    category: i["Category"] || "-",
    lastRestock: i["Last Restock"] || "-",
    supplier: i["Supplier"] || "-",
    location: (i["Facility"] || "-").trim(),
    locationKey: (i["Facility"] || "-").trim().toLowerCase(),
  }));

  // Get unique categories and facilities for filter
  const categories = Array.from(new Set(inventoryItems.map(i => i.category))).filter(Boolean);
  const facilityMap = new Map<string, string>();
  inventoryItems.forEach(i => {
    if (i.locationKey && i.locationKey !== "-") {
      facilityMap.set(i.locationKey, i.location);
    }
  });
  const facilities = Array.from(facilityMap.entries());

  // Filter inventory by selected category and facility
  const filteredInventoryItems = inventoryItems.filter(item => {
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesFacility = !facilityFilter || item.locationKey === facilityFilter;
    return matchesCategory && matchesFacility;
  });

  const inventory = (inventorySheet || []).reduce((acc: any[], i: any) => {
    const existingItem = acc.find(item => item.item === i["Item"]);
    if (existingItem) {
      existingItem.stock += Number(i["Available Stock"] || 0);
    } else {
      acc.push({
        item: i["Item"],
        category: i["Category"],
        stock: Number(i["Available Stock"] || 0),
        cost: Number(i["Cost"] || 0),
        status: Number(i["Available Stock"] || 0) <= Number(i["Threshold"] || 10)
          ? "warning"
          : "default"
      });
    }
    return acc;
  }, []);

  // Treatment filter options
  const treatmentFacilities = Array.from(new Set((treatmentSheet || []).map(t => t["Facility"]).filter(Boolean)));
  const treatmentCategories = Array.from(new Set((treatmentSheet || []).map(t => t["Category"]).filter(Boolean)));
  const treatmentNHIFOptions = ["Yes", "No"];

  // Filtered treatment data
  const filteredTreatmentSheet = (treatmentSheet || []).filter(t => {
    const matchesFacility = !treatmentFacility || t["Facility"] === treatmentFacility;
    const matchesCategory = !treatmentCategory || t["Category"] === treatmentCategory;
    const matchesNHIF = !treatmentNHIF || (t["NHIF Covered"] || "").toLowerCase() === treatmentNHIF.toLowerCase();
    return matchesFacility && matchesCategory && matchesNHIF;
  });

  // Calculate cost savings (example: 5000 Ksh per patient)
  const costSavings = patients.length * 5000;

  // Remove avgTreatmentCost calculation and card

  // Find the most common ultrasound feature
  let mostCommonFeature = "-";
  let mostCommonFeatureCount = 0;
  if (ovarianSheet && ovarianSheet.length > 0) {
    const featureCounts: Record<string, number> = {};
    ovarianSheet.forEach(p => {
      const feature = (p["Ultrasound Features"] || "-").trim();
      if (feature) featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });
    const sorted = Object.entries(featureCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      mostCommonFeature = sorted[0][0];
      mostCommonFeatureCount = sorted[0][1];
    }
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Dashboard</h1>
              <p className="text-gray-500 text-base md:text-lg">Overview of ovarian cyst care metrics</p>
            </div>
            <div className="flex flex-row flex-nowrap justify-evenly gap-6 mb-8 w-full">
              {/* Key Metrics */}
              <div className="lg:col-span-3">
                <div className="flex flex-row flex-nowrap justify-between gap-6 mb-8 w-full">
                  <div className="flex-1 flex justify-center min-w-0" style={{ flexBasis: '40%' }}>
                    <Card className="shadow-lg w-full max-w-none">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Patients</p>
                            <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
                          </div>
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600">Live data</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex-1 flex justify-center min-w-0" style={{ flexBasis: '40%' }}>
                    <Card className="shadow-lg w-full max-w-none">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">High Risk Cases</p>
                            <p className="text-3xl font-bold text-gray-900">{patients.filter(p => p.risk === "High").length}</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                          <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                          <span className="text-yellow-600">{patients.filter(p => p.risk === "High").length} need immediate attention</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex-1 flex justify-center min-w-0" style={{ flexBasis: '40%' }}>
                    <Card className="shadow-lg w-full max-w-none">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                            <p className="text-3xl font-bold text-gray-900">Ksh {costSavings.toLocaleString()}</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600">Estimated</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex-1 flex justify-center min-w-0" style={{ flexBasis: '40%' }}>
                    <Card className="shadow-lg w-full max-w-none">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Most Common Feature</p>
                            <p className="text-lg font-bold text-gray-900">{mostCommonFeature}</p>
                            <p className="text-xs text-muted-foreground">{mostCommonFeatureCount} patient(s)</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800"><span role="img" aria-label="ultrasound">🔬</span></Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Patients and Recent Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Patients */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-pink-500" /> Recent Patients</h3>
                <div className="space-y-4">
                  {patients.slice(0, 5).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-pink-50 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-pink-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg">{p.name.slice(0, 2)}</div>
                        <div>
                          <div className="font-semibold text-pink-900">{p.name}</div>
                          <div className="text-xs text-gray-500">Age {p.age}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">{p.risk}</div>
                        <div className="text-xs text-gray-400">{p.date}</div>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && <div className="text-gray-400">No recent patients found.</div>}
                </div>
              </div>
              {/* Recent Inventory */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Package className="w-6 h-6 text-orange-500" /> Recent Inventory</h3>
                <div className="flex gap-4 mb-4">
                  <select className="border rounded px-2 py-1" value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)}>
                    <option value="">All Facilities</option>
                    {facilities.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                  </select>
                  <select className="border rounded px-2 py-1" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  {filteredInventoryItems.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="bg-orange-50 rounded-lg px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-orange-900">{item.item}</div>
                        <div className="text-xs text-gray-500">{item.category} <span className="ml-2 text-gray-400">{item.location}</span></div>
                        <div className="text-xs text-gray-400">Threshold: {item.threshold} units</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="font-bold text-orange-700">{item.stock} units</div>
                        <div className={`w-24 h-2 rounded-full mt-1 ${item.status === 'critical' ? 'bg-red-400' : item.status === 'low' ? 'bg-yellow-400' : 'bg-green-300'}`}></div>
                      </div>
                    </div>
                  ))}
                  {filteredInventoryItems.length === 0 && <div className="text-gray-400">No inventory items found.</div>}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'treatment' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Treatment Dashboard</h2>
            {/* Filters */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="min-w-[220px]">
                <label className="block text-xs font-semibold mb-1">Facility</label>
                <select className="w-full p-2 border rounded-md" value={treatmentFacility} onChange={e => setTreatmentFacility(e.target.value)}>
                  <option value="">All Facilities</option>
                  {treatmentFacilities.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="min-w-[220px]">
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select className="w-full p-2 border rounded-md" value={treatmentCategory} onChange={e => setTreatmentCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {treatmentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="min-w-[220px]">
                <label className="block text-xs font-semibold mb-1">NHIF Covered</label>
                <select className="w-full p-2 border rounded-md" value={treatmentNHIF} onChange={e => setTreatmentNHIF(e.target.value)}>
                  <option value="">All</option>
                  {treatmentNHIFOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex items-end min-w-[120px]">
                <button className="w-full p-2 border rounded-md bg-gray-100" onClick={() => { setTreatmentFacility(""); setTreatmentCategory(""); setTreatmentNHIF(""); }}>Clear Filters</button>
              </div>
            </div>
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card className="shadow">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Total Treatments</div>
                  <div className="text-2xl font-bold">{filteredTreatmentSheet.length}</div>
                </CardContent>
              </Card>
              <Card className="shadow">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Unique Facilities</div>
                  <div className="text-2xl font-bold">{new Set(filteredTreatmentSheet.map(t => t["Facility"])).size}</div>
                </CardContent>
              </Card>
              <Card className="shadow">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">NHIF Coverage Rate</div>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const total = filteredTreatmentSheet.length;
                      const covered = filteredTreatmentSheet.filter(t => (t["NHIF Covered"] || "").toLowerCase() === "yes").length;
                      return total ? `${((covered / total) * 100).toFixed(1)}%` : "-";
                    })()}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Total Cost (Base Cost)</div>
                  <div className="text-2xl font-bold">
                    KES {filteredTreatmentSheet.reduce((sum, t) => sum + (Number(t["Base Cost (KES)"]) || 0), 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Insurance Copay vs Out-of-Pocket</div>
                  <div className="text-xs text-gray-500 mb-1">Copay: KES {filteredTreatmentSheet.reduce((sum, t) => sum + (Number(t["Insurance Copay (KES)"]) || 0), 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mb-1">Out-of-Pocket: KES {filteredTreatmentSheet.reduce((sum, t) => sum + (Number(t["Out-of-Pocket (KES)"]) || 0), 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {(() => {
                      const copay = filteredTreatmentSheet.reduce((sum, t) => sum + (Number(t["Insurance Copay (KES)"]) || 0), 0);
                      const oop = filteredTreatmentSheet.reduce((sum, t) => sum + (Number(t["Out-of-Pocket (KES)"]) || 0), 0);
                      const total = copay + oop;
                      if (!total) return null;
                      const copayPct = ((copay / total) * 100).toFixed(1);
                      const oopPct = ((oop / total) * 100).toFixed(1);
                      return `Copay: ${copayPct}% | Out-of-Pocket: ${oopPct}%`;
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Stacked Bar: Treatments by Category & NHIF Covered */}
              <Card className="shadow">
                <CardHeader><CardTitle>Treatments by Category & NHIF</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={(() => {
                      const catMap: Record<string, { Yes: number; No: number }> = {};
                      filteredTreatmentSheet.forEach(t => {
                        const cat = t["Category"] || "Other";
                        const nhif = (t["NHIF Covered"] || "No").toLowerCase() === "yes" ? "Yes" : "No";
                        if (!catMap[cat]) catMap[cat] = { Yes: 0, No: 0 };
                        catMap[cat][nhif]++;
                      });
                      return Object.entries(catMap).map(([category, vals]) => ({ category, ...vals })).filter(d => d.Yes > 0 || d.No > 0);
                    })()}>
                      <XAxis dataKey="category" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Yes" stackId="a" fill="#82ca9d" name="NHIF Covered" />
                      <Bar dataKey="No" stackId="a" fill="#ff7f7f" name="Not Covered" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Pie: NHIF Coverage Distribution */}
              <Card className="shadow">
                <CardHeader><CardTitle>NHIF Coverage Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          const yes = filteredTreatmentSheet.filter(t => (t["NHIF Covered"] || "").toLowerCase() === "yes").length;
                          const no = filteredTreatmentSheet.filter(t => (t["NHIF Covered"] || "").toLowerCase() === "no").length;
                          return [
                            { name: "NHIF Covered", value: yes },
                            { name: "Not Covered", value: no },
                          ].filter(d => d.value > 0);
                        })()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ff7f7f" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Bar: Top Facilities by Total Cost */}
              <Card className="shadow col-span-2">
                <CardHeader><CardTitle>Top Facilities by Total Cost</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={(() => {
                      const facMap: Record<string, number> = {};
                      filteredTreatmentSheet.forEach(t => {
                        const fac = t["Facility"] || "Other";
                        facMap[fac] = (facMap[fac] || 0) + (Number(t["Base Cost (KES)"]) || 0);
                      });
                      return Object.entries(facMap).map(([facility, value]) => ({ facility, value })).sort((a, b) => b.value - a.value).slice(0, 7);
                    })()}>
                      <XAxis dataKey="facility" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            {/* Recent Treatments Table */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Recent Treatments</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      {filteredTreatmentSheet && filteredTreatmentSheet.length > 0 && Object.keys(filteredTreatmentSheet[0]).map((col) => (
                        <th key={col} className="px-4 py-2 text-left font-semibold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTreatmentSheet && filteredTreatmentSheet.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-2">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!filteredTreatmentSheet || filteredTreatmentSheet.length === 0) && <div className="text-gray-500">No treatment data found.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
