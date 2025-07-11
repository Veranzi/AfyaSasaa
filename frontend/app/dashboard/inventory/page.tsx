"use client";
import { useGoogleSheet } from "@/hooks/useGoogleSheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Search, Plus, AlertTriangle, Package, ArrowUpRight } from "lucide-react"
import { useState } from "react";

const INVENTORY_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=1858485866&single=true&output=csv";

export default function InventoryPage() {
  const inventorySheet = useGoogleSheet(INVENTORY_DATA_CSV);
  const [showFilter, setShowFilter] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  if (inventorySheet.loading) return <div>Loading...</div>;
  if (inventorySheet.error) return <div>Error loading data</div>;

  // Map inventory_data for display
  const inventory = (inventorySheet.data || []).filter(i => i["Item"]).map((i, idx) => ({
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
    location: i["Facility"] || "-",
    cost: Number(i["Cost (KES)"] || 0),
  }));

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === "low").length;
  const criticalItems = inventory.filter(item => item.status === "critical").length;
  // Placeholder for restock orders and value
  const restockOrders = inventory.filter(item => item.status !== "good").length;
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.cost * item.stock || 0), 0);

  // Get unique options for filters
  const facilities = Array.from(new Set((inventorySheet.data || []).map(i => i["Facility"])) ).filter(Boolean);
  const categories = Array.from(new Set((inventorySheet.data || []).map(i => i["Category"])) ).filter(Boolean);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesFacility = !facilityFilter || ((inventorySheet.data || []).find(i => (i["Item"] === item.item && i["Facility"] === facilityFilter)));
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesFacility && matchesCategory;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{criticalItems}</span> critical items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restock Orders</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restockOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span> pending orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Live</span> value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search inventory..." className="pl-8" />
        </div>
        <Button variant="outline" onClick={() => setShowFilter(f => !f)}>Filter</Button>
      </div>

      {showFilter && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Facility</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={facilityFilter}
              onChange={e => setFacilityFilter(e.target.value)}
            >
              <option value="">All Facilities</option>
              {facilities.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Category</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => { setFacilityFilter(""); setCategoryFilter(""); }}>Clear Filters</Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInventory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.item}</div>
                    <div className="text-sm text-gray-600">ID: {item.id} • {item.category}</div>
                    <div className="text-sm text-gray-600">Location: {item.location}</div>
                    <div className="text-sm text-gray-600">Supplier: {item.supplier}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      item.status === "critical"
                        ? "destructive"
                        : item.status === "low"
                        ? "default"
                        : "secondary"
                    }
                    className="mb-1"
                  >
                    {item.stock} units
                  </Badge>
                  <div className="w-[200px]">
                    <Progress value={(item.stock / (item.threshold * 4)) * 100} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-500">Threshold: {item.threshold} units</div>
                  <div className="text-xs text-gray-500">Last Restock: {item.lastRestock}</div>
                  <div className="text-xs text-gray-500">Cost: {item.cost.toLocaleString()} KES</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 