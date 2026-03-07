"use client";
/**
 * FILE:    frontend/src/app/properties/[id]/page.tsx
 * PURPOSE: Property detail — image slider, full info, map, enquiry form
 */
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Bed, Bath, Maximize2, MapPin,
  Heart, Eye, Share2, CheckCircle2,
} from "lucide-react";
import { Navbar }        from "@/components/layout/Navbar";
import { Badge }         from "@/components/ui/Badge";
import { Button }        from "@/components/ui/Button";
import { Spinner }       from "@/components/ui/Spinner";
import { ImageSlider }   from "@/components/property/ImageSlider";
import { PropertyMap, MapPlaceholder } from "@/components/property/PropertyMap";
import { EnquiryForm }   from "@/components/property/EnquiryForm";
import { useProperty, useSaveProperty, useSavedProperties } from "@/lib/hooks/useProperties";
import { formatPrice, formatArea, timeAgo, cn } from "@/lib/utils";

export default function PropertyDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: property, isLoading, isError } = useProperty(id);
  const { data: saved = [] }                   = useSavedProperties();
  const { mutate: toggleSave, isPending }      = useSaveProperty();

  const isSaved = saved.some((s) => s.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <div className="page-container py-16 text-center">
          <p className="font-display text-2xl text-gray-900 mb-2">Property not found</p>
          <p className="text-gray-500 mb-6">This listing may have been removed.</p>
          <Button onClick={() => router.push("/properties")}>Browse properties</Button>
        </div>
      </div>
    );
  }

  const images    = property.images ?? [];
  const hasCoords = property.latitude && property.longitude;
  const fullAddress = [
    property.house_number, property.address,
    property.neighborhood, property.city,
  ].filter(Boolean).join(", ");

  /* Slider overlay */
  const sliderLeft = (
    <>
      <Badge status={property.status}>{property.status}</Badge>
      {property.is_featured && (
        <span className="badge bg-amber-400/95 text-amber-900 border-amber-300">⭐ Featured</span>
      )}
    </>
  );

  const sliderRight = (
    <>
      <button
        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center
                   justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
        onClick={() => navigator.share?.({ title: property.title, url: location.href })}
      >
        <Share2 size={15} />
      </button>
      <button
        onClick={() => toggleSave({ id: property.id, saved: isSaved })}
        disabled={isPending}
        className={cn(
          "w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm",
          "transition-all duration-200",
          isSaved
            ? "bg-red-500 text-white"
            : "bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500"
        )}
      >
        <Heart size={15} className={isSaved ? "fill-current" : ""} />
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <main className="page-container py-8">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900
                     mb-6 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to listings
        </button>

        {/* Image slider */}
        <div className="mb-8">
          <ImageSlider
            images={images} title={property.title}
            autoPlay interval={4000}
            overlayLeft={sliderLeft} overlayRight={sliderRight}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left col ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title + price */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">
                  {property.property_type}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                  <MapPin size={13} />{fullAddress}
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-semibold text-gray-900">
                  {formatPrice(property.price, "KES")}
                </p>
                {property.price_per_sqm && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatPrice(property.price_per_sqm, "KES")}/m²
                  </p>
                )}
                {property.is_negotiable && (
                  <p className="text-xs text-green-600 font-medium mt-0.5">Negotiable</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Bed,       value: `${property.bedrooms} bed${property.bedrooms !== 1 ? "s" : ""}` },
                { icon: Bath,      value: `${property.bathrooms} bath${property.bathrooms !== 1 ? "s" : ""}` },
                { icon: Maximize2, value: formatArea(property.area_sqm) },
              ].map(({ icon: Icon, value }) => (
                <div key={value} className="card flex flex-col items-center gap-1.5 py-4 text-center">
                  <Icon size={18} className="text-brand-500" />
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">About this property</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100">
                      <CheckCircle2 size={12} />{a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Map ── */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Location</h2>
              {hasCoords ? (
                <PropertyMap
                  latitude={Number(property.latitude)}
                  longitude={Number(property.longitude)}
                  title={property.title}
                  address={fullAddress}
                />
              ) : (
                <MapPlaceholder address={fullAddress} />
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <Eye size={12} />{property.views_count} views
              </span>
              <span>Listed {timeAgo(property.created_at)}</span>
            </div>
          </div>

          {/* ── Right col ── */}
          <div className="space-y-4">

            {/* Save button (standalone if no agent) */}
            <div className="card p-4">
              <Button
                variant={isSaved ? "danger" : "secondary"}
                fullWidth
                onClick={() => toggleSave({ id: property.id, saved: isSaved })}
                disabled={isPending}
                leftIcon={<Heart size={14} className={isSaved ? "fill-current" : ""} />}
              >
                {isSaved ? "Saved" : "Save property"}
              </Button>
            </div>

            {/* Enquiry form */}
            <EnquiryForm
              propertyId={property.id}
              propertyTitle={property.title}
              agentName={property.listed_by?.name}
            />
          </div>
        </div>
      </main>
    </div>
  );
}