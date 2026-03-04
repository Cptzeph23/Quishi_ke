/**
 * FILE:    frontend/src/lib/types/index.ts
 * PURPOSE: Shared TypeScript interfaces — mirrors Django backend models
 */

// ── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "agent" | "client";

export interface User {
  id:             string;
  email:          string;
  full_name:      string;
  phone?:         string;
  avatar?:        string;
  role:           UserRole;
  email_verified: boolean;
  created_at:     string;
}

export interface AuthTokens {
  access:  string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

// ── Property ─────────────────────────────────────────────────────────────────

export type PropertyType   = "apartment" | "house" | "studio" | "penthouse" | "office";
export type PropertyStatus = "available" | "rented" | "sold" | "maintenance";

export interface Amenity {
  id:   number;
  name: string;
  icon: string;
}

export interface PropertyImage {
  id:         string;
  image:      string;
  thumbnail:  string;
  alt_text:   string;
  is_primary: boolean;
  order:      number;
}

export interface PropertyListed {
  id:    string;
  name:  string;
  email: string;
}

/** Full property — returned by GET /properties/<id>/ */
export interface Property {
  id:            string;
  title:         string;
  description:   string;
  property_type: PropertyType;
  address:       string;
  city:          string;
  neighborhood?: string;
  floor_number:  number;
  house_number:  string;
  latitude?:     number;
  longitude?:    number;
  bedrooms:      number;
  bathrooms:     number;
  area_sqm:      string;
  price:         string;
  price_per_sqm?: string;
  is_negotiable: boolean;
  status:        PropertyStatus;
  amenities:     Amenity[];
  images:        PropertyImage[];
  listed_by?:    PropertyListed;
  views_count:   number;
  is_featured:   boolean;
  created_at:    string;
  updated_at:    string;
}

/** Lightweight property — returned by GET /properties/ list */
export interface PropertySummary
  extends Omit<Property, "description" | "images" | "amenities" | "listed_by"> {
  primary_image?: string;
  amenity_count:  number;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface Paginated<T> {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  T[];
}

// ── Filters ───────────────────────────────────────────────────────────────────

export interface PropertyFilters {
  city?:          string;
  neighborhood?:  string;
  min_price?:     number;
  max_price?:     number;
  bedrooms?:      number;
  property_type?: PropertyType;
  status?:        PropertyStatus;
  min_area?:      number;
  max_area?:      number;
  is_featured?:   boolean;
  search?:        string;
  ordering?:      string;
  page?:          number;
}

// ── Chatbot ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:                string;
  role:              "user" | "assistant";
  content:           string;
  extracted_filters?: PropertyFilters | null;
  created_at:        string;
}

export interface ChatSession {
  id:         string;
  messages:   ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  session_id: string;
  message:    ChatMessage;
  filters:    PropertyFilters | null;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_properties:     number;
  available_properties: number;
  rented_properties:    number;
  featured_properties:  number;
  avg_price:            number;
  total_views:          number;
  total_users:          number;
  total_agents:         number;
  total_clients:        number;
  new_users_this_month: number;
  new_users_this_week:  number;
  api_calls_today:      number;
  api_calls_this_week:  number;
}

export interface PropertyStats {
  by_type:   { property_type: string; count: number; avg_price: number }[];
  by_city:   { city: string; count: number }[];
  by_status: { status: string; count: number }[];
}

export interface AuditLogEntry {
  id:          string;
  method:      string;
  path:        string;
  status_code: number;
  user:        string | null;
  ip_address:  string | null;
  duration_ms: number | null;
  created_at:  string;
}