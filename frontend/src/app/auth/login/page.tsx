"use client";
/**
 * FILE:    frontend/src/app/auth/login/page.tsx
 * PURPOSE: Sign-in page — email + password, RHF + Zod, split layout
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { Input }  from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending,    setIsPending]    = useState(false);
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);

  const { register, handleSubmit, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      const user = useAuthStore.getState().user;
      const dest =
        user?.role === "admin" ? "/dashboard/admin" :
        user?.role === "agent" ? "/dashboard/agent" :
        "/properties";
      router.push(dest);
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between
                      p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage:
            "radial-gradient(circle at 20% 80%, #4f6ef7 0%, transparent 50%)," +
            "radial-gradient(circle at 80% 20%, #7b96f7 0%, transparent 50%)",
        }} />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-display text-white text-xl font-semibold">SmartRealty</span>
        </div>
        <div className="relative">
          <p className="font-display text-3xl text-white leading-snug mb-4">
            "Find the space where your life happens."
          </p>
          <p className="text-gray-400 text-sm">
            Thousands of verified listings across Nairobi, updated daily.
          </p>
        </div>
        <div className="relative flex gap-8">
          {[["10K+","Properties"],["2K+","Happy clients"],["500+","Agents"]].map(([n,l]) => (
            <div key={l}>
              <p className="text-2xl font-semibold text-white font-display">{n}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-gray-900 text-lg">SmartRealty</span>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <h1 className="font-display text-3xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              rightSlot={
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register("password")}
            />
            <div className="flex justify-end">
              <Link href="/auth/forgot-password"
                className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={isPending} fullWidth size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-brand-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}