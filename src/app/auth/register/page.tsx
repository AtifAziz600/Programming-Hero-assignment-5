"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { Dumbbell, Eye, EyeOff, User, ShoppingBag } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "PROVIDER"]),
  })
  .superRefine((data, ctx) => {
    if (!["CUSTOMER", "PROVIDER"].includes(data.role)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a role",
        path: ["role"],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CUSTOMER",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFields) => {
    setIsSubmitting(true);
    // Remove confirmPassword before sending to server
    const { confirmPassword: _confirmPassword, ...submitData } = data;
    try {
      const response = await axiosInstance.post("/auth/register", submitData);
      if (response.data?.success) {
        toast.success("Account created successfully! Please sign in.");
        router.push("/auth/login");
      } else {
        throw new Error(response.data?.message || "Failed to register");
      }
    } catch (e) {
      let msg = "Failed to register";
      if (typeof e === "object" && e !== null) {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        msg = err.response?.data?.message || err.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-quaternary-dark/30">
      <div className="max-w-md w-full space-y-8 bg-quaternary p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-2">
            <Dumbbell className="h-8 w-8 text-primary rotate-[-15deg]" />
            <span className="text-dark">GearUp</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-dark tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark">
              sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selector Card Buttons */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-center mb-3">
              Choose your account type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue("role", "CUSTOMER")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                  selectedRole === "CUSTOMER"
                    ? "border-primary bg-primary-50/50 text-primary ring-2 ring-primary/20"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-bold">Customer</span>
                <span className="text-[10px] text-slate-400">Rent sports gear</span>
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "PROVIDER")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                  selectedRole === "PROVIDER"
                    ? "border-primary bg-primary-50/50 text-primary ring-2 ring-primary/20"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <ShoppingBag className="h-6 w-6" />
                <span className="text-sm font-bold">Provider</span>
                <span className="text-[10px] text-slate-400">List & rent out gear</span>
              </button>
            </div>
            {errors.role && <p className="mt-1 text-xs text-secondary text-center">{errors.role.message}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register("name")}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.name ? "border-secondary focus:ring-secondary" : "border-slate-350"
                }`}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-xs text-secondary">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.email ? "border-secondary focus:ring-secondary" : "border-slate-350"
                }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-secondary">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`block w-full px-3 py-2 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.password ? "border-secondary focus:ring-secondary" : "border-slate-350"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-secondary">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.confirmPassword ? "border-secondary focus:ring-secondary" : "border-slate-350"
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-secondary">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
