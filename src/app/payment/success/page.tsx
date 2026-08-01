"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const rentalId = searchParams.get("rentalId");

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-quaternary-light">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Payment Successful!</h1>
        <p className="text-slate-500">
          Your payment has been processed successfully. Your rental order is now confirmed.
          {rentalId && <span className="block mt-2 font-mono text-xs text-slate-400">Order #{rentalId}</span>}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.href = "/dashboard/customer"}>View Orders</Button>
          <Link href="/gear">
            <Button variant="outline">Browse More Gear</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
