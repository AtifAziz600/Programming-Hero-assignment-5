"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { Rental } from "@/types";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  ShieldAlert,
  Settings2,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

function StatCard({
  title,
  value,
  icon,
  href,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="bg-quaternary rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-quaternary rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded w-16" />
        </div>
        <div className="h-12 w-12 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/users");
      return response.data?.success ? response.data.data : [];
    },
  });

  const { data: gearData, isLoading: gearLoading } = useQuery({
    queryKey: ["admin-gear-count"],
    queryFn: async () => {
      const response = await axiosInstance.get("/gear");
      return response.data?.success ? response.data.data : [];
    },
  });

  const { data: rentalsData, isLoading: rentalsLoading } = useQuery({
    queryKey: ["admin-rentals-count"],
    queryFn: async () => {
      const response = await axiosInstance.get("/rentals");
      return response.data?.success ? response.data.data : [];
    },
  });

  const users = Array.isArray(usersData) ? usersData : [];
  const gear = Array.isArray(gearData) ? gearData : [];
  const rentals = Array.isArray(rentalsData) ? rentalsData : [];

  const totalRevenue = rentals.reduce((sum: number, r: Rental) => sum + (r.totalAmount || 0), 0);

  const isLoading = usersLoading || gearLoading || rentalsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {user?.name || "Admin"}. Here is your platform overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={users.length}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              href="/dashboard/admin/users"
              color="bg-blue-50"
            />
            <StatCard
              title="Active Gear Listings"
              value={gear.length}
              icon={<Package className="h-6 w-6 text-emerald-600" />}
              href="/dashboard/admin/gear"
              color="bg-emerald-50"
            />
            <StatCard
              title="Total Rentals"
              value={rentals.length}
              icon={<ShoppingCart className="h-6 w-6 text-purple-600" />}
              href="/dashboard/admin/orders"
              color="bg-purple-50"
            />
            <StatCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6 text-amber-600" />}
              href="/dashboard/admin/orders"
              color="bg-amber-50"
            />
          </>
        )}
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/users" className="block group">
            <div className="bg-quaternary rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <ShieldAlert className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">User Management</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage users, roles, and statuses</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/gear" className="block group">
            <div className="bg-quaternary rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-50">
                  <Settings2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Gear Moderation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enable or disable gear listings</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/admin/orders" className="block group">
            <div className="bg-quaternary rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Orders Moderation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Monitor and review rental orders</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
