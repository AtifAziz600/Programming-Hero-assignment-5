"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Category } from "@/types";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2 } from "lucide-react";

const gearSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  pricePerDay: z.coerce.number().min(1, "Price must be at least 1"),
  stock: z.coerce.number().min(1, "Stock must be at least 1"),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
});

type GearFormValues = z.infer<typeof gearSchema>;

export default function ProviderGearEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = !id || id === "new";

  const { data: gear, isLoading: gearLoading } = useQuery({
    queryKey: ["provider-gear", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/provider/gear/${id}`);
      return response.data?.success ? response.data.data : null;
    },
    enabled: !isNew,
  });

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosInstance.get("/categories");
      return response.data?.success ? response.data.data : [];
    },
  });
  const categories = categoriesData || [];
    
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GearFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(gearSchema) as any,
    defaultValues: {
      name: "",
      brand: "",
      description: "",
      categoryId: "",
      pricePerDay: 0,
      stock: 1,
      imageUrl: "",
      isAvailable: true,
    },
  });

  useEffect(() => {
    if (gear && !isNew) {
      reset({
        name: gear.name || "",
        brand: gear.brand || "",
        description: gear.description || "",
        categoryId: gear.categoryId || "",
        pricePerDay: gear.pricePerDay || 0,
        stock: gear.stock || 1,
        imageUrl: gear.imageUrl || "",
        isAvailable: gear.isAvailable ?? true,
      });
    }
  }, [gear, isNew, reset]);

  const mutation = useMutation({
    mutationFn: async (data: GearFormValues) => {
      if (isNew) {
        const response = await axiosInstance.post("/provider/gear", data);
        return response.data;
      }
      const response = await axiosInstance.patch(`/provider/gear/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(isNew ? "Gear added successfully!" : "Gear updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
      router.push("/dashboard/provider");
    },
    onError: (err) => {
      let msg = "Operation failed";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`/provider/gear/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Gear deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
      router.push("/dashboard/provider");
    },
    onError: (err) => {
      let msg = "Failed to delete gear";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        msg = e.response?.data?.message || e.message || msg;
      }
      toast.error(msg);
    },
  });

  const onSubmit = (data: GearFormValues) => {
    mutation.mutate(data);
  };

  if (!isNew && gearLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/provider")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isNew ? "Add New Gear" : "Edit Gear"}
        </h1>
      </div>

      <Card>
        <CardContent>
          <form className="space-y-6 mt-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" {...register("name")} error={errors.name?.message} placeholder="e.g. Coleman Tent 4P" />
              <Input label="Brand" {...register("brand")} error={errors.brand?.message} placeholder="e.g. Coleman" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className={`block w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.description ? "border-secondary focus:ring-secondary" : "border-slate-300"}`}
                placeholder="Describe the gear, condition, and ideal use..."
              />
              {errors.description && <p className="mt-1 text-xs text-secondary">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select
                  {...register("categoryId")}
                  className={`block w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.categoryId ? "border-secondary focus:ring-secondary" : "border-slate-300"}`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-xs text-secondary">{errors.categoryId.message}</p>}
              </div>
              <Input label="Price Per Day ($)" type="number" {...register("pricePerDay")} error={errors.pricePerDay?.message} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Stock" type="number" {...register("stock")} error={errors.stock?.message} />
              <Input label="Image URL" {...register("imageUrl")} error={errors.imageUrl?.message} placeholder="https://..." />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                {...register("isAvailable")}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isAvailable" className="text-sm font-semibold text-slate-700">Available for Rent</label>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                {isSubmitting || mutation.isPending ? "Saving..." : isNew ? "Add Gear" : "Update Gear"}
              </Button>
              {!isNew && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this gear?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/provider")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
