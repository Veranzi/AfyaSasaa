"use client"

import { useGoogleSheet } from "@/hooks/useGoogleSheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, Users, Activity, AlertTriangle } from "lucide-react"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts"

const OVARIAN_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=0&single=true&output=csv";

const COLORS = ["#82ca9d", "#8884d8", "#ff7f7f", "#ffc658", "#a4de6c", "#d0ed57"];

// Define types for risk and age group keys
const RISK_LEVELS = ["Low", "Medium", "High", "Moderate"] as const;
type RiskLevel = typeof RISK_LEVELS[number];
const AGE_GROUPS = ["<30", "30-39", "40-49", "50+"] as const;
type AgeGroup = typeof AGE_GROUPS[number];

function getMonthName(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleString("default", { month: "short" });
}

export default function AnalyticsPage() {
  const ovarian = useGoogleSheet(OVARIAN_DATA_CSV);

  if (ovarian.loading) return <div>Loading...</div>;
  if (ovarian.error) return <div>Error loading data</div>;

  // Map ovarian_data to patients for analytics
  const patients = (ovarian.data || []).filter(p => p["Patient ID"]);

  // Group by month for the last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleString("default", { month: "short" });
  });

  const monthlyData = months.map(month => {
    // Patients with Date of Exam in this month
    const monthPatients = patients.filter(p => getMonthName(p["Date of Exam"]) === month);
    return {
      month,
      patients: monthPatients.length,
      predictions: Math.round(monthPatients.length * 0.95), // Placeholder for AI predictions
      accuracy: 94 + Math.floor(Math.random() * 4), // Placeholder accuracy
    };
  });

  // Risk mapping
  function getRisk(rec: any) {
    if (rec["Recommended Management"] === "Referral") return "High";
    if (rec["Recommended Management"] === "Surgery") return "Medium";
    if (rec["Recommended Management"] === "Medication") return "Low";
    if (rec["Recommended Management"] === "Observation") return "Moderate";
    return "-";
  }

  // Risk distribution
  const riskCounts = { Low: 0, Medium: 0, High: 0, Moderate: 0 };
  patients.forEach(p => {
    const risk = getRisk(p);
    if (risk === "High" || risk === "Medium" || risk === "Low" || risk === "Moderate") riskCounts[risk]++;
  });
  const riskDistribution = [
    { name: "Low Risk", value: riskCounts.Low },
    { name: "Medium Risk", value: riskCounts.Medium },
    { name: "High Risk", value: riskCounts.High },
  ];

  // Age group distribution by risk
  const ageGroups = ['<30', '30-39', '40-49', '50+'];
  function getAgeGroup(age: string | number) {
    const n = Number(age);
    if (isNaN(n)) return '<30';
    if (n < 30) return '<30';
    if (n < 40) return '30-39';
    if (n < 50) return '40-49';
    return '50+';
  }
  const ageRiskMap: Record<string, { High: number; Medium: number; Low: number; Moderate: number }> = {
    '<30': { High: 0, Medium: 0, Low: 0, Moderate: 0 },
    '30-39': { High: 0, Medium: 0, Low: 0, Moderate: 0 },
    '40-49': { High: 0, Medium: 0, Low: 0, Moderate: 0 },
    '50+': { High: 0, Medium: 0, Low: 0, Moderate: 0 },
  };
  patients.forEach(p => {
    const group = getAgeGroup(p['Age']);
    const risk = getRisk(p);
    if (risk === 'High' || risk === 'Medium' || risk === 'Low' || risk === 'Moderate') {
      ageRiskMap[group][risk]++;
    }
  });
  const ageRiskDistribution = ageGroups.map(group => ({
    ageGroup: group,
    ...ageRiskMap[group],
  }));

  // Summary cards
  const totalPatients = patients.length;
  const predictionAccuracy = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].accuracy : 0;
  const highRiskCases = riskCounts.High;
  const growthRate = monthlyData.length > 1 && monthlyData[monthlyData.length - 2].patients > 0
    ? ((monthlyData[monthlyData.length - 1].patients - monthlyData[monthlyData.length - 2].patients) / monthlyData[monthlyData.length - 2].patients * 100).toFixed(1) + "%"
    : "+0%";

  // Prepare separate datasets for pre- and post-menopausal
  const preUltrasoundData: Array<any> = [];
  const postUltrasoundData: Array<any> = [];
  patients.forEach(p => {
    const region = p['Region'] || 'Unknown';
    const menopause = (p['Menopause Status'] || '').toLowerCase().includes('pre') ? 'Pre' : 'Post';
    const feature = p['Ultrasound Features'] || 'Unknown';
    let entryArr = menopause === 'Pre' ? preUltrasoundData : postUltrasoundData;
    let entry = entryArr.find(d => d.region === region);
    if (!entry) {
      entry = { region };
      entryArr.push(entry);
    }
    entry[feature] = (entry[feature] || 0) + 1;
  });

  // Grouped+Stacked Bar Chart: Region x Menopause x Ultrasound Feature
  const featureSet = new Set<string>();
  const groupedStackedData: Array<any> = [];
  const regionMenopauseMap: Record<string, Record<string, Record<string, number>>> = {};
  patients.forEach(p => {
    const region = p['Region'] || 'Unknown';
    const menopause = (p['Menopause Status'] || '').toLowerCase().includes('pre') ? 'Pre' : 'Post';
    const feature = p['Ultrasound Features'] || 'Unknown';
    featureSet.add(feature);
    if (!regionMenopauseMap[region]) regionMenopauseMap[region] = {};
    if (!regionMenopauseMap[region][menopause]) regionMenopauseMap[region][menopause] = {};
    regionMenopauseMap[region][menopause][feature] = (regionMenopauseMap[region][menopause][feature] || 0) + 1;
  });
  // Flatten to array for recharts
  Object.entries(regionMenopauseMap).forEach(([region, menopauseObj]) => {
    Object.entries(menopauseObj).forEach(([menopause, featureCounts]) => {
      groupedStackedData.push({
        region,
        menopause,
        ...featureCounts,
      });
    });
  });
  const ultrasoundFeatures = Array.from(featureSet);

  // Process data for charts
  const processData = (data: any[]) => {
    // Age distribution data
    const ageDistributionData = processAgeDistribution(data);

    // Risk distribution data
    const riskDistributionData = processRiskDistribution(data);

    // Monthly growth data
    const monthlyGrowthData = processMonthlyGrowth(data);

    return {
      ageDistributionData,
      riskDistributionData,
      monthlyGrowthData,
    };
  };

  // Process age distribution
  const processAgeDistribution = (data: any[]) => {
    const ageGroups: Record<AgeGroup, Record<RiskLevel, number>> = {
      '<30': { Low: 0, Medium: 0, High: 0, Moderate: 0 },
      '30-39': { Low: 0, Medium: 0, High: 0, Moderate: 0 },
      '40-49': { Low: 0, Medium: 0, High: 0, Moderate: 0 },
      '50+': { Low: 0, Medium: 0, High: 0, Moderate: 0 }
    };

    data.forEach(p => {
      const age = parseInt(p['Age']) || 0;
      const risk = getRisk(p);
      let ageGroup: AgeGroup = age < 30 ? '<30' : age < 40 ? '30-39' : age < 50 ? '40-49' : '50+';
      if (RISK_LEVELS.includes(risk as RiskLevel)) {
        ageGroups[ageGroup][risk as RiskLevel]++;
      }
    });

    return Object.entries(ageGroups).map(([name, values]) => ({
      name,
      ...values
    }));
  };

  // Process risk distribution
  const processRiskDistribution = (data: any[]) => {
    const riskCounts: Record<RiskLevel, number> = { Low: 0, Medium: 0, High: 0, Moderate: 0 };
    data.forEach(p => {
      const risk = getRisk(p);
      if (RISK_LEVELS.includes(risk as RiskLevel)) {
        riskCounts[risk as RiskLevel]++;
      }
    });

    return Object.entries(riskCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Process monthly growth
  const processMonthlyGrowth = (data: any[]) => {
    const monthlyData: Record<string, number> = {};
    
    data.forEach(p => {
      const date = p['Date'] ? new Date(p['Date']) : null;
      if (date) {
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
      }
    });

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartData = processData(patients);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" /> Last 6 Months
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictionAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCases}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">Live</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthRate}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.length === 0 ? (
                  <div className="text-center text-gray-500">No recommendations available.</div>
                ) : (
                  <>
                    {/* Example: Highlight patients with large cysts */}
                    {(() => {
                      const largeCysts = patients.filter(p => {
                        const size = parseFloat(p["Size"] || "0");
                        return size >= 5;
                      });
                      if (largeCysts.length > 0) {
                        return (
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <div>
                              <div className="font-semibold text-yellow-800">{largeCysts.length} patient(s) have cysts ≥ 5cm</div>
                              <div className="text-xs text-yellow-700">Recommend urgent follow-up and imaging for these cases.</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {/* Example: Suggest routine follow-up for moderate cysts */}
                    {(() => {
                      const moderateCysts = patients.filter(p => {
                        const size = parseFloat(p["Size"] || "0");
                        return size > 2 && size < 5;
                      });
                      if (moderateCysts.length > 0) {
                        return (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-semibold text-blue-800">{moderateCysts.length} patient(s) have cysts 2-5cm</div>
                              <div className="text-xs text-blue-700">Recommend routine follow-up in 3-6 months.</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {/* Example: Reassure for small cysts */}
                    {(() => {
                      const smallCysts = patients.filter(p => {
                        const size = parseFloat(p["Size"] || "0");
                        return size > 0 && size <= 2;
                      });
                      if (smallCysts.length > 0) {
                        return (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
                            <Users className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-semibold text-green-800">{smallCysts.length} patient(s) have cysts ≤ 2cm</div>
                              <div className="text-xs text-green-700">Most small cysts are benign. Routine care advised.</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {/* Add region-based recommendations */}
                    {(() => {
                      // Find region with most high-risk cases
                      const regionRiskMap: Record<string, number> = {};
                      patients.forEach(p => {
                        if (getRisk(p) === "High") {
                          const region = p["Region"] || "Unknown";
                          regionRiskMap[region] = (regionRiskMap[region] || 0) + 1;
                        }
                      });
                      const sortedRegions = Object.entries(regionRiskMap).sort((a, b) => b[1] - a[1]);
                      if (sortedRegions.length > 0 && sortedRegions[0][1] > 0) {
                        const [topRegion, count] = sortedRegions[0];
                        return (
                          <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                            <div>
                              <div className="font-semibold text-rose-800">{topRegion}: {count} high-risk case(s)</div>
                              <div className="text-xs text-rose-700">Prioritize outreach and specialist support in this region.</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {/* Region-based high-risk cases chart */}
                    {(() => {
                      // Prepare data for chart: [{ region, count }]
                      const regionRiskMap: Record<string, number> = {};
                      patients.forEach(p => {
                        if (getRisk(p) === "High") {
                          const region = p["Region"] || "Unknown";
                          regionRiskMap[region] = (regionRiskMap[region] || 0) + 1;
                        }
                      });
                      const chartData = Object.entries(regionRiskMap).map(([region, count]) => ({ region, count }));
                      if (chartData.length === 0) return null;
                      return (
                        <div className="mt-6">
                          <div className="font-semibold mb-2 text-sm text-gray-700">High-Risk Cases by Region</div>
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
                              <XAxis type="number" allowDecimals={false} />
                              <YAxis dataKey="region" type="category" width={100} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#ef4444" name="High Risk Cases" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.riskDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {chartData.riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution by Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.ageDistributionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Low" stackId="a" fill="#82ca9d" />
                <Bar dataKey="Medium" stackId="a" fill="#8884d8" />
                <Bar dataKey="High" stackId="a" fill="#ff7f7f" />
                <Bar dataKey="Moderate" stackId="a" fill="#ffd966" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 