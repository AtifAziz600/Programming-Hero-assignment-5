"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { Compass, ShieldCheck, Zap, Calendar, Award, ArrowRight } from "lucide-react";
import { Category, GearItem } from "@/types";

// Skeletons for featured gear list loading
function GearCardSkeleton() {
  return (
    <div className="bg-quaternary border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="bg-slate-200 h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-8 bg-slate-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // Fetch gear items
  const { data: gearData, isLoading: gearLoading } = useQuery<GearItem[]>({
    queryKey: ["featured-gear"],
    queryFn: async () => {
      const response = await axiosInstance.get("/gear");
      return response.data?.success ? response.data.data : [];
    },
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosInstance.get("/categories");
      return response.data?.success ? response.data.data : [];
    },
  });

  // Take first 3-4 gear items for features
  const featuredGear = gearData ? gearData.slice(0, 4) : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 md:py-28 relative overflow-hidden">
        {/* Subtle background decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary-light border border-primary/30 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-tertiary animate-pulse" /> Outdoor Adventure Starts Here
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none">
                Rent Sports & <br />
                <span className="text-primary-light">Outdoor Gear</span> Instantly
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto md:mx-0 leading-relaxed">
                Why buy expensive equipment you only use once? Browse premium tents, sleeping bags, climbing
                kits, and bikes from trusted rental shops nearby.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/gear"
                  className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                >
                  Browse Catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/register"
                  className="px-8 py-3.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 hover:text-white transition-all border border-slate-700 flex items-center justify-center"
                >
                  Become a Provider
                </Link>
              </div>
            </div>
            {/* Visual Panel */}
            <div className="relative flex justify-center">
              <div className="bg-slate-850 p-4 rounded-3xl border border-slate-800 shadow-2xl relative w-full max-w-md aspect-[4/3] flex items-center justify-center overflow-hidden">
                <div className="text-center p-8 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-primary-100 text-primary mb-2">
                    <Dumbbell className="h-12 w-12 text-primary animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Premium Quality Sports Equipment</h3>
                  <p className="text-sm text-slate-400">
                    Coleman, Osprey, Trek, Black Diamond, and more. Cleaned, checked, and ready for use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons Section */}
      <section className="bg-quaternary border-b border-quaternary-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-primary-50 rounded-xl text-primary flex-shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Vetted Providers</h4>
                <p className="text-sm text-slate-500">
                  Every vendor is verified to ensure gear meets premium safety and sanitization protocols.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-tertiary-50 rounded-xl text-tertiary-dark flex-shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Flexible Rentals</h4>
                <p className="text-sm text-slate-500">
                  Pick your dates, adjust reservation durations, and return gear seamlessly on your schedule.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-secondary-50 rounded-xl text-secondary flex-shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Stripe Checkout Protection</h4>
                <p className="text-sm text-slate-500">
                  Complete rentals confidently with protected, standardized digital Stripe payment routing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-quaternary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">Explore by Category</h2>
            <p className="text-slate-500 mt-2">Find exactly what you need for your next adventure</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categoriesLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-quaternary border border-slate-200 rounded-xl animate-pulse"
                  />
                ))
              : categoriesData?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/gear?category=${encodeURIComponent(cat.name)}`}
                    className="bg-quaternary border border-slate-200 hover:border-primary hover:shadow-md rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 group transition-all"
                  >
                    <Compass className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="font-bold text-slate-700 group-hover:text-primary text-sm tracking-tight transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Gear Section */}
      <section className="py-16 bg-quaternary border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Gear</h2>
              <p className="text-slate-500 mt-1">High-quality equipment curated by our provider community</p>
            </div>
            <Link
              href="/gear"
              className="text-primary font-bold hover:text-primary-dark hover:underline flex items-center gap-1.5 text-sm"
            >
              See All Listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gearLoading ? (
              Array.from({ length: 4 }).map((_, i) => <GearCardSkeleton key={i} />)
            ) : featuredGear.length > 0 ? (
              featuredGear.map((item) => (
                <div
                  key={item.id}
                  className="bg-quaternary border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
                >
                  {/* Image placeholder with absolute overlay */}
                  <div className="bg-slate-100 h-48 w-full relative flex items-center justify-center overflow-hidden">
                    <span className="text-slate-350 text-xs font-semibold uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <span className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
                      {item.category?.name}
                    </span>
                  </div>
                  {/* Details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">
                      {item.brand}
                    </span>
                    <h3 className="font-extrabold text-slate-900 mt-1 text-base leading-tight line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-lg font-extrabold text-primary">${item.pricePerDay}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">per day</span>
                      </div>
                      <Link
                        href={`/gear/${item.id}`}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs rounded-lg transition-all"
                      >
                        Rent Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                No gear items available at the moment. Please check back later!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple fallback helper component since it was imported dynamically above
function Dumbbell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6.5 6.5h11" />
      <path d="M6.5 17.5h11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="M18 22H6v-3h12v3Z" />
      <path d="M18 5H6V2h12v3Z" />
      <path d="M2 17h2v-6H2v6Z" />
      <path d="M20 17h2v-6h-2v6Z" />
    </svg>
  );
}
