"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { Dumbbell, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/auth/login", data);
      if (response.data?.success && response.data?.data) {
        const { token, user } = response.data.data;
        login(token, user);
        toast.success(`Welcome back, ${user.name}!`);

        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          switch (user.role) {
            case "ADMIN":
              router.push("/dashboard/admin");
              break;
            case "PROVIDER":
              router.push("/dashboard/provider");
              break;
            case "CUSTOMER":
            default:
              router.push("/dashboard/customer");
              break;
          }
        }
      } else {
        throw new Error(response.data?.message || "Invalid response from server");
      }
    } catch (error) {
      let msg = "Failed to log in";
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { data: { message?: string } } };
        msg = err.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message;
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Or{" "}
            <Link href="/auth/register" className="font-semibold text-primary hover:text-primary-dark">
              register a new account
            </Link>
          </p>
        </div>
   
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
                  autoComplete="current-password"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-quaternary-dark/30">
      <div className="max-w-md w-full space-y-8 bg-quaternary p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
