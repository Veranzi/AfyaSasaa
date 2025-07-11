"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PatientGrowthChartProps {
  monthlyData: Array<{
    month: string
    patients: number
    predictions: number
    accuracy: number
  }>
}

export function PatientGrowthChart({ monthlyData }: PatientGrowthChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Patient Growth & Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="patients"
                stroke="#8884d8"
                strokeWidth={2}
                name="Actual Patients"
              />
              <Line
                type="monotone"
                dataKey="predictions"
                stroke="#82ca9d"
                strokeWidth={2}
                name="AI Predictions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 