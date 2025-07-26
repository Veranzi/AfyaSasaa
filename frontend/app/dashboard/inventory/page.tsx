"use client";
import { useGoogleSheet } from "@/hooks/useGoogleSheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Search, Plus, AlertTriangle, Package, ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react";
import RoleGuard from "@/components/RoleGuard";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useUserRole } from "@/hooks/useUserRole";
import { auth } from "@/lib/firebase";

const INVENTORY_DATA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOrLbxUb6jmar3LIp2tFGHHimYL7Tl6zZTRNqJohoWBaq7sk0UHkxTKPwknP3muI5rx2kE6PwSyrKk/pub?gid=1858485866&single=true&output=csv";

export default function InventoryPage() {
  const { data: inventory, loading } = useGoogleSheet(INVENTORY_DATA_CSV);
  const [user, setUser] = useState<any>(null);
  const { role, loading: roleLoading } = useUserRole(user);

  // Add missing state for showFilter and filters
  const [showFilter, setShowFilter] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const form = useForm({
    defaultValues: {
      Facility: "",
      Region: "",
      Category: "",
      Item: "",
      Cost: "",
      Stock: ""
    }
  });

  const onSubmit = async (values: any) => {
    // Placeholder: send to backend API
    await fetch("/api/inventory/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setShowAddModal(false);
    form.reset();
    // Optionally: refresh inventory data
  };

  // Map Google Sheet columns to expected keys
  const mappedInventory = (inventory || []).map((item: any) => ({
    item: item["Item"],
    location: item["Facility"],
    category: item["Category"],
    cost: item["Cost (KES)"],
    stock: item["Available Stock"],
    // Add more mappings if needed
  }));

  // Derive unique facilities and categories from mappedInventory
  const facilities = Array.from(new Set(mappedInventory.map((item: any) => item.location)));
  const categories = Array.from(new Set(mappedInventory.map((item: any) => item.category)));
  const regions = Array.from(new Set((inventory || []).map((item: any) => item["Region"])));

  // Filtered inventory
  const [regionFilter, setRegionFilter] = useState("");
  const filteredInventory = mappedInventory.filter((item: any) =>
    (!facilityFilter || item.location === facilityFilter) &&
    (!categoryFilter || item.category === categoryFilter) &&
    (!regionFilter || (inventory.find(inv => inv["Item"] === item.item && inv["Facility"] === item.location && inv["Category"] === item.category && inv["Cost (KES)"] === item.cost && inv["Available Stock"] === item.stock)?.Region === regionFilter))
  );

  // Calculate summary stats with loading guards
  const totalItems = loading ? 0 : mappedInventory.length;
  // Find item with highest stock (low stock items card)
  const highestStockItem = mappedInventory.reduce((max, item) => (Number(item.stock) > Number(max.stock) ? item : max), mappedInventory[0] || {stock: 0, item: "-"});
  // Find item with lowest stock (restock orders card)
  const lowestStockItem = mappedInventory.reduce((min, item) => (Number(item.stock) < Number(min.stock) ? item : min), mappedInventory[0] || {stock: 0, item: "-"});
  const lowStockItems = highestStockItem ? `${highestStockItem.item} (${highestStockItem.stock} units)` : "-";
  const restockOrders = lowestStockItem ? `${lowestStockItem.item} (${lowestStockItem.stock} units)` : "-";
  const criticalItems = 0; // Not available in your data
  const inventoryValue = loading ? 0 : mappedInventory.reduce((sum: number, item: any) => sum + (parseFloat(item.cost) * parseInt(item.stock)), 0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading inventory...</div>;
  }

  return (
    <RoleGuard allowed={["clinician", "admin"]}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          {/* Only show Add Item for admin */}
          {role === "admin" && (
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField name="Facility" control={form.control} render={({ field }) => (
                      <FormItem>
                        <label className="block text-xs font-semibold mb-1">Facility</label>
                        <select className="w-full p-2 border rounded-md" {...field}>
                          <option value="">Select Facility</option>
                          {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </FormItem>
                    )} />
                    <FormField name="Region" control={form.control} render={({ field }) => (
                      <FormItem>
                        <label className="block text-xs font-semibold mb-1">Region</label>
                        <select className="w-full p-2 border rounded-md" {...field}>
                          <option value="">Select Region</option>
                          {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </FormItem>
                    )} />
                    <FormField name="Category" control={form.control} render={({ field }) => (
                      <FormItem>
                        <label className="block text-xs font-semibold mb-1">Category</label>
                        <select className="w-full p-2 border rounded-md" {...field}>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </FormItem>
                    )} />
                    <FormField name="Item" control={form.control} render={({ field }) => (
                      <FormItem>
                        <Input placeholder="Item" {...field} />
                      </FormItem>
                    )} />
                    <FormField name="Cost" control={form.control} render={({ field }) => (
                      <FormItem>
                        <Input placeholder="Cost (KES)" type="number" step="0.01" {...field} />
                      </FormItem>
                    )} />
                    <FormField name="Stock" control={form.control} render={({ field }) => (
                      <FormItem>
                        <Input placeholder="Available Stock" type="number" {...field} />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="submit">Add Item</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Stock Item</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low/Restock Item</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restockOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {inventoryValue.toLocaleString()}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
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
              <label className="block text-xs font-semibold mb-1">Region</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
              >
                <option value="">All Regions</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
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
              <Button variant="secondary" onClick={() => { setFacilityFilter(""); setCategoryFilter(""); setRegionFilter(""); }}>Clear Filters</Button>
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
                      <div className="font-medium text-gray-900 text-base">{item.item}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                      <div className="text-sm text-gray-600">Location: {item.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-1 text-xs">{item.stock} units</Badge>
                    <div className="text-xs text-gray-500">
                      Cost: {item.cost ? Number(item.cost).toLocaleString() : "N/A"} KES
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
} 