"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import Link from "next/link";
import { Search, SlidersHorizontal, RefreshCw, X, Dumbbell } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Category } from "@/types";

function GearCard({ item }: { item: { id: string; name: string; brand: string; description: string; category?: { name: string }; pricePerDay: number; isAvailable: boolean; stock: number } }) {
  return (   
    <div className="bg-quaternary border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
      <div className="bg-slate-100 h-48 w-full relative flex items-center justify-center overflow-hidden">
        <span className="text-slate-350 text-xs font-semibold uppercase tracking-wider">{item.brand}</span>
        <span className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
          {item.category?.name}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>{item.brand}</span>
          <span className={item.isAvailable && item.stock > 0 ? "text-primary" : "text-secondary"}>
            {item.isAvailable && item.stock > 0 ? `${item.stock} Available` : "Out of stock"}
          </span>
        </div>
        <h3 className="font-extrabold text-slate-900 mt-1 text-base leading-tight line-clamp-1">{item.name}</h3>
        <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div>
            <span className="text-lg font-extrabold text-primary">${item.pricePerDay}</span>
            <span className="text-[10px] text-slate-400 font-semibold block">per day</span>
          </div>
          <Link
            href={`/gear/${item.id}`}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg transition-all"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// Gear skeleton loader card
function CardSkeleton() {
  return (
    <div className="bg-quaternary border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="bg-slate-200 h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-3.5 bg-slate-200 rounded w-1/4" />
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-3.5 bg-slate-200 rounded w-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-8 bg-slate-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function GearPageInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosInstance.get("/categories");
      return response.data?.success ? response.data.data : [];
    },
  });

  // Fetch matching gear list (real-time params updates)
  const { data: gearList = [], isLoading: gearLoading } = useQuery({
    queryKey: ["gear-list", selectedCategory, minPrice, maxPrice, selectedBrand],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const response = await axiosInstance.get("/gear", { params });
      return response.data?.success ? response.data.data : [];
    },
  });

  // Filter client-side by search query
  const filteredGear: { id: string; name: string; brand: string; description: string; category?: { name: string }; pricePerDay: number; isAvailable: boolean; stock: number }[] = gearList.filter(
    (item: { name: string; description: string; brand: string }) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      {/* Header and Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Sports & Outdoor Gear</h1>
          <p className="text-sm text-slate-500">Rent high-quality gear for your next hike, ride, or climb</p>
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold bg-quaternary hover:bg-slate-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block bg-quaternary p-6 rounded-2xl border border-slate-200 space-y-6 h-fit shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Brand</label>
            <input
              type="text"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              placeholder="e.g. Coleman, Trek"
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Price Per Day ($)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </aside>

        {/* Catalog Listings Panel */}
        <div className="md:col-span-3 space-y-6">
          {/* Real-time search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search gear name, description, brand..."
              className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-quaternary text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          </div>

          {/* Catalog grid */}
          {gearLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredGear.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGear.map((item) => (
                <GearCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-quaternary border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center gap-4">
              <Dumbbell className="h-12 w-12 text-slate-350" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg">No equipment matches found</h4>
                <p className="text-sm text-slate-450 mt-1">Try resetting the filters or modifying search keywords.</p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-dark transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex justify-end md:hidden">
          <div className="w-80 bg-quaternary h-full p-6 shadow-2xl relative flex flex-col space-y-6">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-450 hover:text-primary transition-colors flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Brand</label>
              <input
                type="text"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                placeholder="e.g. Coleman, Trek"
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Price ($)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-auto w-full py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary-dark transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GearPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
      <div className="mt-6 h-10 bg-slate-200 rounded animate-pulse" />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-xl h-80 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function GearPage() {
  return (
    <Suspense fallback={<GearPageSkeleton />}>
      <GearPageInner />
    </Suspense>
  );
}
