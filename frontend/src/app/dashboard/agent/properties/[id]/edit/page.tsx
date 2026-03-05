"use client";
/**
 * FILE:    [id]/edit/page.tsx
 * PURPOSE: Edit existing listing — loads property then passes to PropertyForm
 */
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar }       from "@/components/layout/Navbar";
import { AuthGuard }    from "@/components/auth/AuthGuard";
import { PropertyForm } from "@/components/property/PropertyForm";
import { PageSpinner }  from "@/components/ui/Spinner";
import { useProperty }  from "@/lib/hooks/useProperties";

export default function EditPropertyPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { data: property, isLoading, isError } = useProperty(id);

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

          {isLoading ? (
            <PageSpinner />
          ) : isError || !property ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Property not found or you don't have permission to edit it.</p>
            </div>
          ) : (
            <>
              <h1 className="heading-section mb-2">Edit listing</h1>
              <p className="text-gray-400 text-sm mb-8 truncate">{property.title}</p>
              <PropertyForm property={property} />
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}