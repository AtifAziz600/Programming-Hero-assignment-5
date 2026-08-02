"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Search, UserX, UserCheck } from "lucide-react";
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
import { User } from "@/types";
   
function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-40 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
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

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/users");
      return response.data?.success ? response.data.data : [];
    },
  });

  const meta = data?.meta;

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!searchTerm.trim()) return data as User[];
    const lower = searchTerm.toLowerCase();
    return data.filter(
      (u: User) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  const limit = meta?.limit || 10;
  const totalPages = meta?.totalPages || Math.ceil(filteredUsers.length / limit);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, currentPage, limit]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) => {
      const response = await axiosInstance.patch(`/admin/users/${id}`, { status });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === "ACTIVE" ? "User activated successfully" : "User suspended successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to update user");
      toast.error(message);
    },
  });

  const handleStatusChange = (u: User) => {
    if (!user || user.role !== "ADMIN") {
      toast.error("You do not have permission to perform this action");
      return;
    }
    const newStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    statusMutation.mutate({ id: u.id, status: newStatus });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-secondary-50 border border-secondary/20 rounded-xl p-8 text-center">
          <p className="text-secondary-dark font-bold">Failed to load users</p>
          <p className="text-sm text-slate-500 mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="h-12 w-12 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No users found</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm ? "Try adjusting your search term" : "No users have been registered yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((u: User) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                        <TableCell className="text-slate-600">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role}>{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.status}>{u.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={u.status === "ACTIVE" ? "secondary" : "default"}
                            onClick={() => handleStatusChange(u)}
                            disabled={statusMutation.isPending}
                            className="gap-1"
                          >
                            {u.status === "ACTIVE" ? (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                Activate
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
