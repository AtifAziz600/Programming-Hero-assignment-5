"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { DollarSign, Calendar, Package } from "lucide-react";

export default function CustomerOrderPayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: rental, isLoading, error } = useQuery({
    queryKey: ["rental", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/rentals/${id}`);
      return response.data?.success ? response.data.data : null;
    },
    enabled: !!id,
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/payments/create", { rentalOrderId: id, method: "STRIPE" });
      return response.data?.success ? response.data.data : response.data;
    },
    onSuccess: (data) => {
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (data?.success) {
        toast.success("Payment initiated! Redirecting...");
        setTimeout(() => {
          router.push(`/payment/success?rentalId=${id}`);
        }, 1500);
      }
    },
    onError: (e) => {
      let msg = "Failed to initiate payment";
      if (typeof e === "object" && e !== null) {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        msg = err.response?.data?.message || err.message || msg;
      }
      toast.error(msg);
    },
  });

  if (!id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex-grow text-center">
        <h2 className="text-2xl font-bold text-slate-900">Invalid order</h2>
        <Button className="mt-4" onClick={() => router.push("/dashboard/customer")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex-grow text-center">
        <h2 className="text-2xl font-bold text-slate-900">Order not found</h2>
        <p className="text-slate-500 mt-2">The order you are trying to pay for does not exist.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/customer")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Order</p>
              <p className="font-mono text-lg font-bold">#{rental.id.slice(-6)}</p>
            </div>
            <Badge variant={rental.status}>{rental.status}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-quaternary-dark/50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-slate-500">Rental Period</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="bg-quaternary-dark/50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-slate-500">Items</p>
                <p className="text-sm font-bold text-slate-900">{rental.items?.length || 0} item(s)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-bold">Total Amount</span>
            </div>
            <span className="text-2xl font-extrabold text-primary">${Number(rental.totalAmount || 0).toFixed(2)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>
              {payMutation.isPending ? "Processing..." : "Proceed to Payment"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
