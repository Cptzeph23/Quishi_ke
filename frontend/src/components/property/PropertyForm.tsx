"use client";
/**
 * FILE:    PropertyForm.tsx
 * PURPOSE: Create / edit property form — all fields, amenity pills, used by
 *          agent create page and agent edit page.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Input }   from "@/components/ui/Input";
import { Button }  from "@/components/ui/Button";
import { useAmenities, propertyKeys } from "@/lib/hooks/useProperties";
import { propertiesApi } from "@/lib/api/properties";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types";

const schema = z.object({
  title:         z.string().min(5,  "At least 5 characters"),
  description:   z.string().min(20, "At least 20 characters"),
  property_type: z.enum(["apartment","house","studio","penthouse","office","land"]),
  status:        z.enum(["available","rented","sold","maintenance"]),
  address:       z.string().min(5,  "Required"),
  city:          z.string().min(2,  "Required"),
  neighborhood:  z.string().optional(),
  floor_number:  z.coerce.number().min(0),
  house_number:  z.string().min(1,  "Required"),
  bedrooms:      z.coerce.number().min(0),
  bathrooms:     z.coerce.number().min(1),
  area_sqm:      z.coerce.number().positive("Must be > 0"),
  price:         z.coerce.number().positive("Must be > 0"),
  is_negotiable: z.boolean().default(false),
  is_featured:   z.boolean().default(false),
  amenity_ids:   z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof schema>;

const PROPERTY_TYPES = ["apartment","house","studio","penthouse","office","land"] as const;
const STATUS_OPTIONS = ["available","rented","sold","maintenance"] as const;

interface PropertyFormProps {
  property?: Property;
  onSuccess?: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const router  = useRouter();
  const qc      = useQueryClient();
  const isEdit  = !!property;
  const { data: amenities = [] } = useAmenities();

  const { register, handleSubmit, watch, setValue,
          formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:         property?.title         ?? "",
      description:   property?.description   ?? "",
      property_type: (property?.property_type as any) ?? "apartment",
      status:        (property?.status as any)        ?? "available",
      address:       property?.address       ?? "",
      city:          property?.city          ?? "Nairobi",
      neighborhood:  property?.neighborhood  ?? "",
      floor_number:  property?.floor_number  ?? 0,
      house_number:  property?.house_number  ?? "",
      bedrooms:      property?.bedrooms      ?? 1,
      bathrooms:     property?.bathrooms     ?? 1,
      area_sqm:      property?.area_sqm ? Number(property.area_sqm) : (undefined as any),
      price:         property?.price    ? Number(property.price)    : (undefined as any),
      is_negotiable: property?.is_negotiable ?? false,
      is_featured:   property?.is_featured   ?? false,
      amenity_ids:   property?.amenities?.map((a) => a.id) ?? [],
    },
  });

  const selectedIds = watch("amenity_ids") ?? [];

  function toggleAmenity(id: number) {
    setValue(
      "amenity_ids",
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
      { shouldDirty: true }
    );
  }

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      isEdit
        ? propertiesApi.update(property!.id, data)
        : propertiesApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? "Listing updated!" : "Listing created!");
      qc.invalidateQueries({ queryKey: propertyKeys.all });
      onSuccess ? onSuccess() : router.push("/dashboard/agent");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.detail ??
        err?.response?.data?.title?.[0] ??
        "Something went wrong."
      );
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">

      {/* Listing details */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Listing details</h2>

        <Input label="Title" placeholder="e.g. Modern 2-Bed Apartment in Westlands"
          error={errors.title?.message} {...register("title")} />

        <div>
          <label className="label">Description</label>
          <textarea rows={4}
            placeholder="Describe the property — highlights, condition, nearby amenities…"
            className={cn("input resize-none", errors.description && "border-red-400")}
            {...register("description")} />
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Property type</label>
            <select className="input" {...register("property_type")}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" {...register("status")}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              {...register("is_negotiable")} />
            Price is negotiable
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              {...register("is_featured")} />
            Mark as featured
          </label>
        </div>
      </div>

      {/* Location */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Location</h2>
        <Input label="Street address" placeholder="e.g. 14 Ring Road"
          error={errors.address?.message} {...register("address")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" placeholder="Nairobi"
            error={errors.city?.message} {...register("city")} />
          <Input label="Neighbourhood" placeholder="e.g. Westlands"
            {...register("neighborhood")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Floor number" type="number" min={0}
            error={errors.floor_number?.message} {...register("floor_number")} />
          <Input label="Unit / house number" placeholder="e.g. 3B"
            error={errors.house_number?.message} {...register("house_number")} />
        </div>
      </div>

      {/* Specs & pricing */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Specs & pricing</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Bedrooms" type="number" min={0}
            error={errors.bedrooms?.message} {...register("bedrooms")} />
          <Input label="Bathrooms" type="number" min={1}
            error={errors.bathrooms?.message} {...register("bathrooms")} />
          <Input label="Area (m²)" type="number" step="0.01" min={1}
            error={errors.area_sqm?.message} {...register("area_sqm")} />
        </div>
        <Input label="Monthly rent / price (KES)" type="number" min={1}
          placeholder="e.g. 85000"
          error={errors.price?.message} {...register("price")} />
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  selectedIds.includes(a.id)
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                )}>
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" loading={mutation.isPending}>
          {isEdit ? "Save changes" : "Create listing"}
        </Button>
      </div>
    </form>
  );
}