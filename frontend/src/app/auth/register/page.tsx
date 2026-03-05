"use client";
/**
 * FILE:    frontend/src/app/auth/register/page.tsx
 * PURPOSE: Registration — name, email, role picker, password with strength bar
 */
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRegister } from "@/lib/hooks/useAuth";

const schema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email:     z.string().email("Enter a valid email address"),
    role:      z.enum(["client", "agent"]),
    password:  z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
    message: "Passwords do not match",
    path:    ["password2"],
  });

type FormValues = z.infer<typeof schema>;

function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;
  return s as 0 | 1 | 2 | 3 | 4;
}

const strengthLabel  = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor  = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];

export default function RegisterPage() {
  const [showPass,  setShowPass]  = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const { mutate: register_, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver:     zodResolver(schema),
    defaultValues: { role: "client" },
  });

  const password = watch("password") ?? "";
  const strength = passwordStrength(password);

  const onSubmit = (data: FormValues) => register_(data);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gray-900 flex-col justify-between
                      p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #4f6ef7 0%, transparent 50%)," +
              "radial-gradient(circle at 20% 80%, #a4b8fb 0%, transparent 50%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-display text-white text-xl font-semibold">SmartRealty</span>
        </div>
        <div className="relative space-y-6">
          <h2 className="font-display text-3xl text-white leading-snug">
            Your next home is one search away.
          </h2>
          <ul className="space-y-3">
            {[
              "AI-powered property matching",
              "Verified listings updated daily",
              "Chat directly with agents",
              "Save your favourite properties",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-400/30
                                 flex items-center justify-center text-brand-300 text-xs flex-shrink-0">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-gray-500">
          © {new Date().getFullYear()} SmartRealty. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-gray-900 text-lg">SmartRealty</span>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <h1 className="font-display text-3xl font-semibold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Join thousands finding their perfect property.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            <Input
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              leftIcon={<User size={15} />}
              error={errors.full_name?.message}
              {...register("full_name")}
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Role selector */}
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {(["client", "agent"] as const).map((r) => (
                  <label
                    key={r}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer",
                      "transition-all duration-150 select-none",
                      watch("role") === r
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <input type="radio" value={r} {...register("role")} className="sr-only" />
                    <span className="text-lg">{r === "client" ? "🏠" : "🤝"}</span>
                    <span className="text-xs font-medium capitalize">{r}</span>
                  </label>
                ))}
              </div>
              {errors.role && <p className="mt-1.5 text-xs text-red-500">{errors.role.message}</p>}
            </div>

            {/* Password with strength meter */}
            <div>
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                leftIcon={<Lock size={15} />}
                error={errors.password?.message}
                rightSlot={
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPass((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                {...register("password")}
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength ? strengthColor[strength] : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Strength: <span className="font-medium">{strengthLabel[strength]}</span>
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type={showPass2 ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              error={errors.password2?.message}
              rightSlot={
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPass2((s) => !s)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass2 ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register("password2")}
            />

            <Button type="submit" loading={isPending} fullWidth size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}