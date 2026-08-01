"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { GearItem } from "@/types";

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
      </TableCell>
    </TableRow>
  );
}

export default function AdminGearPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-gear"],
    queryFn: async () => {
      const response = await axiosInstance.get("/gear");
      return response.data?.success ? response.data.data : [];
    },
  });

  const filteredGear = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!searchTerm.trim()) return data as GearItem[];
    const lower = searchTerm.toLowerCase();
    return data.filter(
      (g: GearItem) =>
        g.name.toLowerCase().includes(lower) ||
        g.brand.toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  const availabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const response = await axiosInstance.patch(`/admin/gear/${id}`, { isAvailable });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.isAvailable ? "Gear listing enabled" : "Gear listing disabled"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-gear"] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to update gear");
      toast.error(message);
    },
  });

  const handleToggleAvailability = (gear: GearItem) => {
    if (!user || user.role !== "ADMIN") {
      toast.error("You do not have permission to perform this action");
      return;
    }
    availabilityMutation.mutate({ id: gear.id, isAvailable: !gear.isAvailable });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-secondary-50 border border-secondary/20 rounded-xl p-8 text-center">
          <p className="text-secondary-dark font-bold">Failed to load gear listings</p>
          <p className="text-sm text-slate-500 mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gear Listings Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">Review and manage all gear listings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Gear Listings</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or brand..."
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
          ) : filteredGear.length === 0 ? (
            <div className="text-center py-12">
              <Ban className="h-12 w-12 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No gear listings found</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm ? "Try adjusting your search term" : "No gear listings available"}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGear.map((gear) => (
                    <TableRow key={gear.id}>
                      <TableCell className="font-medium text-slate-900">{gear.name}</TableCell>
                      <TableCell className="text-slate-600">{gear.brand}</TableCell>
                      <TableCell className="text-slate-600">{gear.provider?.name || "—"}</TableCell>
                      <TableCell className="text-slate-600">{gear.category?.name || "—"}</TableCell>
                      <TableCell className="text-slate-600">{gear.stock}</TableCell>
                      <TableCell className="text-slate-600">${gear.pricePerDay}</TableCell>
                      <TableCell>
                        <Badge variant={gear.isAvailable && gear.stock > 0 ? "AVAILABLE" : "SUSPENDED"}>
                          {gear.isAvailable && gear.stock > 0 ? "Available" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={gear.isAvailable ? "secondary" : "default"}
                          onClick={() => handleToggleAvailability(gear)}
                          disabled={availabilityMutation.isPending}
                          className="gap-1"
                        >
                          {gear.isAvailable ? (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Enable
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
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
