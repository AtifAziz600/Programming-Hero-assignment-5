"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Rental } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { DollarSign, Package, ShoppingBag, ArrowRight } from "lucide-react";

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: gearList = [] } = useQuery({
    queryKey: ["provider-gear"],
    queryFn: async () => {
      const response = await axiosInstance.get("/provider/gear");
      return response.data?.success ? response.data.data : [];
    },
  });

  const { data: orders = [] } = useQuery<Rental[]>({
    queryKey: ["provider-orders"],
    queryFn: async () => {
      const response = await axiosInstance.get("/provider/orders");
      return response.data?.success ? response.data.data : [];
    },
  });

  const totalGear = gearList.length;
  const activeRentals = orders.filter((o) => ["PAID", "PICKED_UP"].includes(o.status)).length;
  const pendingOrders = orders.filter((o) => o.status === "PLACED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Provider Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Gear</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">{totalGear}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Rentals</CardTitle>
              <ShoppingBag className="h-5 w-5 text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">{activeRentals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Orders</CardTitle>
              <DollarSign className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">{pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Recent Orders</h2>
            <p className="text-slate-500 text-sm mt-1">Latest incoming rental requests</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/provider/orders")} className="gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent>
            {orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">#{order.id.slice(-6)}</TableCell>
                      <TableCell>{order.customer?.name || "Customer"}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-bold">${order.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status}>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-900">No orders yet</p>
                <p className="text-sm mt-1">Orders will appear here once customers book your gear.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
