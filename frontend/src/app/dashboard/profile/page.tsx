"use client";
/**
 * FILE:    profile/page.tsx
 * PURPOSE: Profile editor — shared by all roles. Update name, phone, password.
 */
import { useState } from "react";
import { useForm }  from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Navbar }    from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Input }     from "@/components/ui/Input";
import { Button }    from "@/components/ui/Button";
import { authApi }   from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

const profileSchema = z.object({
  full_name: z.string().min(2, "At least 2 characters"),
  phone:     z.string().optional(),
});

const passwordSchema = z.object({
  current_password:  z.string().min(1, "Required"),
  new_password:      z.string().min(8, "At least 8 characters")
                      .regex(/[A-Z]/, "Must contain an uppercase letter")
                      .regex(/[0-9]/,  "Must contain a number"),
  confirm_password:  z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path:    ["confirm_password"],
});

type ProfileValues  = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user     = useAuthStore((s) => s.user);
  const [showPw, setShowPw] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name ?? "", phone: user?.phone ?? "" },
  });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileValues) => authApi.updateMe(data),
    onSuccess:  () => toast.success("Profile updated!"),
    onError:    () => toast.error("Failed to update profile."),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordValues) => authApi.updateMe(data),
    onSuccess:  () => { toast.success("Password changed!"); passwordForm.reset(); },
    onError:    () => toast.error("Current password is incorrect."),
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8 max-w-2xl space-y-8">
          <div>
            <h1 className="heading-section">My profile</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your account details.</p>
          </div>

          {/* Avatar + role badge */}
          <div className="card p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center
                            text-brand-700 text-2xl font-semibold font-display flex-shrink-0">
              {user?.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                               bg-brand-50 text-brand-700 border border-brand-100 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Personal info */}
          <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))}
            className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Personal information</h2>
            <Input label="Full name" leftIcon={<User size={15} />}
              error={profileForm.formState.errors.full_name?.message}
              {...profileForm.register("full_name")} />
            <Input label="Email address" type="email" leftIcon={<Mail size={15} />}
              value={user?.email ?? ""} disabled
              hint="Email address cannot be changed." />
            <Input label="Phone number" type="tel" leftIcon={<Phone size={15} />}
              placeholder="+254 700 000 000"
              {...profileForm.register("phone")} />
            <div className="flex justify-end">
              <Button type="submit" loading={profileMutation.isPending}>Save changes</Button>
            </div>
          </form>

          {/* Change password */}
          <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))}
            className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Change password</h2>
            <Input label="Current password"
              type={showPw ? "text" : "password"}
              leftIcon={<Lock size={15} />}
              error={passwordForm.formState.errors.current_password?.message}
              rightSlot={
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw((s) => !s)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...passwordForm.register("current_password")} />
            <Input label="New password" type="password" leftIcon={<Lock size={15} />}
              error={passwordForm.formState.errors.new_password?.message}
              {...passwordForm.register("new_password")} />
            <Input label="Confirm new password" type="password" leftIcon={<Lock size={15} />}
              error={passwordForm.formState.errors.confirm_password?.message}
              {...passwordForm.register("confirm_password")} />
            <div className="flex justify-end">
              <Button type="submit" loading={passwordMutation.isPending}>Update password</Button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}