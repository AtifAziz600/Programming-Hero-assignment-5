"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function CancelContent() {
  const searchParams = useSearchParams();
  const rentalId = searchParams.get("rentalId");

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-quaternary-light">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-secondary-50 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-secondary" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Payment Cancelled</h1>
        <p className="text-slate-500">
          Your payment was cancelled. No charges were made to your account.
          {rentalId && <span className="block mt-2 font-mono text-xs text-slate-400">Order #{rentalId}</span>}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/dashboard/customer/orders/${rentalId || ""}/pay`}>
            <Button>Try Again</Button>
          </Link>
          <Link href="/dashboard/customer">
            <Button variant="outline">View Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <CancelContent />
    </Suspense>
  );
}
