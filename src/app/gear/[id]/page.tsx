"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { Calendar, ShoppingBag, ShieldAlert, Star, MessageSquare, Tag, Info, User } from "lucide-react";
import { Review } from "@/types";

export default function GearDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Booking form states
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "reviews">("desc");

  // Fetch single gear details
  const { data: gear, isLoading, error } = useQuery({
    queryKey: ["gear-detail", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/gear/${id}`);
      return response.data?.success ? response.data.data : null;
    },
  });

  // Calculate rental duration in days
  const getDurationInDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Live total price
  const totalPrice = gear ? getDurationInDays() * gear.pricePerDay * quantity : 0;

  // Book order mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) throw new Error("Please select start and end dates");
      
      const payload = {
        // Format dates as YYYY-MM-DD
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        items: [
          {
            gearItemId: id,
            quantity: quantity,
          },
        ],
      };

      const response = await axiosInstance.post("/rentals", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Rental order placed successfully!");
        queryClient.invalidateQueries({ queryKey: ["gear-detail", id] });
        router.push("/dashboard/customer");
      }
    },
    onError: (err) => {
      let msg = "Failed to place order";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      toast.error(msg);
    },
  });

  const handleBookingSubmit = () => {
    if (!user) {
      toast.error("Please sign in to place a rental order");
      router.push(`/auth/login?callbackUrl=/gear/${id}`);
      return;
    }

    if (user.role !== "CUSTOMER") {
      toast.error("Only Customers can place rental orders.");
      return;
    }

    bookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center flex-grow">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading equipment details...</span>
        </div>
      </div>
    );
  }

  if (error || !gear) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center flex-grow">
        <h2 className="text-2xl font-bold text-slate-900">Equipment item not found</h2>
        <p className="text-slate-500 mt-2">The listing might have been removed or does not exist.</p>
        <button
          onClick={() => router.push("/gear")}
          className="mt-6 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Details Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Image Banner */}
          <div className="bg-slate-100 rounded-2xl h-80 sm:h-96 relative flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
            <span className="text-slate-350 text-base font-semibold uppercase tracking-wider">{gear.brand}</span>
            <span className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">
              {gear.category?.name}
            </span>
          </div>

          {/* Title and Vendor Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{gear.brand}</span>
                <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{gear.name}</h1>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-primary">${gear.pricePerDay}</span>
                <span className="text-xs text-slate-400 font-bold block">per day</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-y border-slate-100 py-3">
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary" /> Category: <strong className="text-slate-800">{gear.category?.name}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-primary" /> Provider: <strong className="text-slate-800">{gear.provider?.name}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" /> Stock Available: <strong className="text-slate-800">{gear.stock} items</strong>
              </span>
            </div>
          </div>

          {/* Tabs for Info and reviews */}
          <div className="space-y-4">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("desc")}
                className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${
                  activeTab === "desc"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Reviews ({gear.reviews?.length || 0})
              </button>
            </div>

            <div className="bg-quaternary p-6 rounded-xl border border-slate-200 shadow-sm min-h-[150px]">
              {activeTab === "desc" ? (
                <div className="prose max-w-none text-sm text-slate-600 leading-relaxed">
                  <p>{gear.description}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {gear.reviews && gear.reviews.length > 0 ? (
                      gear.reviews.map((rev: Review) => (
                      <div key={rev.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">{rev.customer?.name}</div>
                              <div className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          {/* Stars */}
                          <div className="flex items-center gap-0.5 text-tertiary">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < rev.rating ? "fill-current text-tertiary" : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-550 pl-10 italic">&quot;{rev.comment}&quot;</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-450 py-6 text-sm flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="h-8 w-8 text-slate-350" />
                      <span>No reviews for this equipment yet.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Booking Card */}
        <div>
          <div className="bg-quaternary p-6 rounded-2xl border border-slate-200 shadow-md sticky top-24 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Select Rental Dates
            </h3>

            {gear.isAvailable && gear.stock > 0 ? (
              <div className="space-y-4">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={startDate}
                       onChange={(date: Date | null) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      minDate={new Date()}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={endDate}
                       onChange={(date: Date | null) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || new Date()}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {Array.from({ length: Math.min(gear.stock, 10) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-quaternary-dark/50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Daily Rental Rate</span>
                    <span>${gear.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Rental Duration</span>
                    <span>{getDurationInDays()} days</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Selected Quantity</span>
                    <span>x {quantity}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex justify-between text-sm font-bold text-slate-900">
                    <span>Estimated Total</span>
                    <span className="text-primary">${totalPrice}</span>
                  </div>
                </div>

                {/* Submit rent button */}
                <button
                  onClick={handleBookingSubmit}
                  disabled={bookingMutation.isPending}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/10 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingMutation.isPending ? "Processing booking..." : "Rent Now"}
                </button>
              </div>
            ) : (
              <div className="bg-secondary-50 border border-secondary/20 p-4 rounded-xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-secondary-dark">Currently Unavailable</h4>
                  <p className="text-slate-500 mt-1">
                    This item is fully booked or temporarily disabled by the provider.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
