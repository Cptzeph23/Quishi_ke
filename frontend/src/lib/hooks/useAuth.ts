/**
 * FILE:    frontend/src/lib/hooks/useAuth.ts
 * PURPOSE: TanStack Query mutations for login and register
 */
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";

export function useLogin() {
  const login  = useAuthStore((s) => s.login);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      toast.success("Welcome back!");
      // Redirect based on role after store updates
      const user = useAuthStore.getState().user;
      const dest =
        user?.role === "admin" ? "/dashboard/admin"  :
        user?.role === "agent" ? "/dashboard/agent"  :
        "/properties";
      router.push(dest);
    },
    onError: () => {
      toast.error("Invalid email or password.");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created! Please sign in.");
      router.push("/auth/login");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.email?.[0]       ??
        err?.response?.data?.password?.[0]    ??
        err?.response?.data?.detail           ??
        "Registration failed. Please try again.";
      toast.error(msg);
    },
  });
}