"use client";
/**
 * FILE:    frontend/src/lib/api/enquiries.ts
 * PURPOSE: Enquiry API — submit, list, update status
 */
import { api } from "./client";

export interface EnquiryPayload {
  property:     string;
  sender_name:  string;
  sender_email: string;
  sender_phone?: string;
  message:      string;
}

export interface Enquiry {
  id:             string;
  property:       string;
  property_title: string;
  sender_name:    string;
  sender_email:   string;
  sender_phone:   string;
  message:        string;
  status:         "new" | "read" | "replied" | "archived";
  created_at:     string;
}

export const enquiriesApi = {
  /** Submit an enquiry — open to all (no auth required) */
  submit: (data: EnquiryPayload) =>
    api.post<Enquiry>("/enquiries/", data).then((r) => r.data),

  /** List enquiries — agents see own properties, admins see all */
  list: (params?: { status?: string; property?: string }) =>
    api.get<{ count: number; results: Enquiry[] }>("/enquiries/", { params })
       .then((r) => r.data),

  /** Update status — agent/admin only */
  updateStatus: (id: string, status: Enquiry["status"]) =>
    api.patch<Enquiry>(`/enquiries/${id}/`, { status }).then((r) => r.data),
};