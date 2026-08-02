"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Menu, X, LogOut, LayoutDashboard, Dumbbell } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, mounted } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "PROVIDER":
        return "/dashboard/provider";
      case "CUSTOMER":
      default:
        return "/dashboard/customer";
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-quaternary border-b border-quaternary-dark sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <Dumbbell className="h-6 w-6 text-primary rotate-[-15deg]" />
              <span className="text-dark">
                Gear<span className="text-primary">Up</span>
              </span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/gear"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive("/gear")
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Browse Gear
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={getDashboardPath(user.role)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname.startsWith("/dashboard")
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-quaternary-dark hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-950">{user.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary-50 transition-all"
                    title="Log Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-quaternary border-b border-quaternary-dark">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link
              href="/gear"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/gear")
                  ? "bg-primary-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Browse Gear
            </Link>
            {mounted && user && (
              <Link
                href={getDashboardPath(user.role)}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith("/dashboard")
                    ? "bg-primary-50 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Dashboard ({user.role})
              </Link>
            )}
          </div>

          <div className="pt-4 pb-4 border-t border-slate-200 px-4">
            {mounted && user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:text-secondary hover:bg-secondary-50 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary-dark"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
