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
import { Calendar, DollarSign, Package, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: rentalsData = [], isLoading, error } = useQuery({
    queryKey: ["customer-rentals"],
    queryFn: async () => {
      const response = await axiosInstance.get("/rentals");
      return response.data?.success ? response.data.data : [];
    },
  });

  const rentals = rentalsData as Rental[];
  const totalRentals = rentals.length;
  const activeRentals = rentals.filter((r: Rental) => ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"].includes(r.status)).length;
  const totalSpent = rentals.reduce((sum: number, r: Rental) => sum + Number(r.totalAmount || 0), 0);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900">Failed to load dashboard</h2>
          <p className="text-slate-500 mt-2">Please try again later.</p>
          <Button onClick={() => router.refresh()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Rentals</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">{totalRentals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Rentals</CardTitle>
              <Calendar className="h-5 w-5 text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">{activeRentals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Spent</CardTitle>
              <DollarSign className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900">${totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push("/gear")} className="gap-1">
                Browse Gear <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : rentals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-mono text-xs">#{rental.id.slice(-6)}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{rental.items?.length || 0} items</TableCell>
                      <TableCell className="font-bold">${Number(rental.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={rental.status}>{rental.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {(rental.status === "PAID" || rental.status === "CONFIRMED") && (
                          <Button size="sm" onClick={() => router.push(`/dashboard/customer/orders/${rental.id}/pay`)}>
                            Pay Now
                          </Button>
                        )}
                        {rental.status === "RETURNED" && (
                          <Button size="sm" variant="tertiary" onClick={() => toast.success("Review form coming soon!")}>
                            Leave Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-900">No rentals yet</p>
                <p className="text-sm mt-1">Browse our catalog and book your first rental!</p>
                <Button className="mt-4" onClick={() => router.push("/gear")}>Browse Gear</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
