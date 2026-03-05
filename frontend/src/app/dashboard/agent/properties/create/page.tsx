"use client";
/**
 * FILE:    create/page.tsx
 * PURPOSE: New listing page — wraps PropertyForm for creation
 */
import { ArrowLeft } from "lucide-react";
import { useRouter }   from "next/navigation";
import { Navbar }      from "@/components/layout/Navbar";
import { AuthGuard }   from "@/components/auth/AuthGuard";
import { PropertyForm } from "@/components/property/PropertyForm";

export default function CreatePropertyPage() {
  const router = useRouter();
  return (
    <AuthGuard role={["agent","admin"]}>
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8 max-w-3xl">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900
                       mb-6 transition-colors group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to dashboard
          </button>
          <h1 className="heading-section mb-8">Create new listing</h1>
          <PropertyForm />
        </main>
      </div>
    </AuthGuard>
  );
}