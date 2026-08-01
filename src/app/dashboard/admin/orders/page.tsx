"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Rental } from "@/types";

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-28 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
      </TableCell>
    </TableRow>
  );
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await axiosInstance.get("/rentals");
      return response.data?.success ? response.data.data : [];
    },
  });

  const filteredRentals = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!searchTerm.trim()) return data as Rental[];
    const lower = searchTerm.toLowerCase();
    return data.filter(
      (r: Rental) =>
        r.id.toLowerCase().includes(lower) ||
        r.customer?.name?.toLowerCase().includes(lower) ||
        r.status.toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-secondary-50 border border-secondary/20 rounded-xl p-8 text-center">
          <p className="text-secondary-dark font-bold">Failed to load orders</p>
          <p className="text-sm text-slate-500 mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rental Orders Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor and review all rental orders across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Orders</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by ID, customer, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : filteredRentals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-semibold">No orders found</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm ? "Try adjusting your search term" : "No orders have been placed yet"}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRentals.map((rental) => (
                    <>
                      <TableRow
                        key={rental.id}
                        className="cursor-pointer"
                        onClick={() => toggleExpand(rental.id)}
                      >
                        <TableCell>
                          {expandedId === rental.id ? (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {rental.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {rental.customer?.name || "—"}
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs">
                          {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          ${rental.totalAmount}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rental.status}>{rental.status}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">
                          {formatDate(rental.createdAt)}
                        </TableCell>
                      </TableRow>
                      {expandedId === rental.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-slate-50/80 p-0">
                            <div className="p-4 border-b border-slate-100">
                              <h4 className="text-sm font-bold text-slate-900 mb-3">Order Items</h4>
                              {rental.items && rental.items.length > 0 ? (
                                <div className="space-y-2">
                                  {rental.items.map((item: Rental["items"][0], idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                          {item.gearItem?.name || "Unknown Item"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          Brand: {item.gearItem?.brand || "—"} | Qty: {item.quantity}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">
                                          ${((item.gearItem?.pricePerDay || 0) * item.quantity)}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          @ ${item.gearItem?.pricePerDay || 0}/day
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">No items in this order</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
