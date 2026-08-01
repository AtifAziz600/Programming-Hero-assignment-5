"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import toast from "react-hot-toast";

export default function ProviderOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["provider-orders"],
    queryFn: async () => {
      const response = await axiosInstance.get("/provider/orders");
      return response.data?.success ? response.data.data : [];
    },
  });
  const ordersList = (orders || []) as { id: string; status: string; customer?: { name: string }; startDate: string; endDate: string; items?: { gearItemId: string; quantity: number }[]; totalAmount: number }[];

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await axiosInstance.patch(`/provider/orders/${orderId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
      toast.success("Order status updated");
    },
    onError: (err) => {
      let msg = "Failed to update order";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      toast.error(msg);
    },
  });

  const handleStatusUpdate = (orderId: string, status: string) => {
    if (confirm(`Update order status to ${status}?`)) {
      statusMutation.mutate({ orderId, status });
    }
  };

  const getActions = (order: { id: string; status: string }) => {
    switch (order.status) {
      case "PLACED":
        return (
          <Button size="sm" onClick={() => handleStatusUpdate(order.id, "CONFIRMED")} disabled={statusMutation.isPending}>
            Confirm
          </Button>
        );
      case "CONFIRMED":
        return (
          <Button size="sm" onClick={() => handleStatusUpdate(order.id, "PICKED_UP")} disabled={statusMutation.isPending}>
            Mark Picked Up
          </Button>
        );
      case "PICKED_UP":
        return (
          <Button size="sm" onClick={() => handleStatusUpdate(order.id, "RETURNED")} disabled={statusMutation.isPending}>
            Mark Returned
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order.id, "CANCELLED")} disabled={statusMutation.isPending}>
            Cancel
          </Button>
        );
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow text-center">
        <h2 className="text-2xl font-bold text-slate-900">Failed to load orders</h2>
        <Button className="mt-4" onClick={() => router.refresh()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Update status and fulfill incoming rental requests</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/provider")}>Back to Dashboard</Button>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {ordersList.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">#{order.id.slice(-6)}</TableCell>
                    <TableCell>{order.customer?.name || "Customer"}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell className="font-bold">${order.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{getActions(order)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="font-bold text-slate-900">No orders yet</p>
              <p className="text-sm mt-1">Orders will appear here once customers book your gear.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
