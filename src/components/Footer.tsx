import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Dumbbell className="h-6 w-6 text-primary rotate-[-15deg]" />
            <span>
              Gear<span className="text-primary">Up</span>
            </span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/gear" className="hover:text-white transition-colors">
              Browse Gear
            </Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">
              Register
            </Link>
          </div>
          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} GearUp Rental Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
