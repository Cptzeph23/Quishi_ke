"use client";
/**
 * FILE:    frontend/src/lib/api/properties.ts
 * PURPOSE: Property CRUD, image upload, save/unsave, amenities
 */
import { api } from "./client";
import type {
  Amenity, Property, PropertySummary, Paginated, PropertyFilters,
} from "@/lib/types";

export const propertiesApi = {
  /** Paginated, filtered list of properties. */
  list: (filters?: PropertyFilters) =>
    api.get<Paginated<PropertySummary>>("/properties/", { params: filters })
       .then((r) => r.data),

  /** Full property detail (increments views_count). */
  get: (id: string) =>
    api.get<Property>(`/properties/${id}/`).then((r) => r.data),

  /** Create a new listing (agent / admin only). */
  create: (data: Partial<Property> & { amenity_ids?: number[] }) =>
    api.post<Property>("/properties/", data).then((r) => r.data),

  /** Partial update (owner / admin only). */
  update: (id: string, data: Partial<Property> & { amenity_ids?: number[] }) =>
    api.patch<Property>(`/properties/${id}/`, data).then((r) => r.data),

  /** Delete listing (owner / admin only). */
  remove: (id: string) =>
    api.delete(`/properties/${id}/`),

  /** Top 8 featured available listings. */
  featured: () =>
    api.get<PropertySummary[]>("/properties/featured/").then((r) => r.data),

  /** Current user's saved properties. */
  saved: () =>
    api.get<PropertySummary[]>("/properties/saved/").then((r) => r.data),

  /** Save a property. */
  save: (id: string) =>
    api.post(`/properties/${id}/save/`).then((r) => r.data),

  /** Unsave a property. */
  unsave: (id: string) =>
    api.delete(`/properties/${id}/save/`).then((r) => r.data),

  /** Upload one or more images for a property. */
  uploadImages: (propertyId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return api.post(`/properties/${propertyId}/images/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  /** Public list of all available amenities. */
  amenities: () =>
    api.get<Amenity[]>("/properties/amenities/").then((r) => r.data),
};