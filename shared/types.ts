export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
export interface Property {
  // Core Identifiers
  id: string; // Internal UUID
  ref: string; // Public Unique Reference (e.g. MGH-101)
  kref: string; // External/Legacy Reference
  // Basic Details
  title: string;
  ptype: string; // Villa, Apartment, etc.
  province: string;
  town: string;
  location: string;
  area: string;
  // Pricing
  price: number;
  originalprice: number;
  frequency: string; // Monthly, Weekly (for rentals)
  // Specifications
  beds: number;
  baths: number;
  living: number; // Living area sqm
  plot: number; // Plot size sqm
  // Media & Descriptions
  images: string[];
  description: string;
  moredetails: string;
  // Status Flags
  display: boolean;
  salestage: number; // 0: For Sale, 1: Reserved, 2: Sold
  // Feature Flags
  rental: boolean;
  finca: boolean;
  penthouse: boolean;
  luxury: boolean;
  offplan: boolean;
  leasehold: boolean;
  golf: boolean;
  beach: boolean;
  aircon: boolean;
  pool: boolean;
  fireplace: boolean;
  heating: boolean;
  solarium: boolean;
  balconies: boolean;
  furnished: boolean;
  kitchen: boolean;
  utility: boolean;
  notrain: boolean;
  topsix: boolean;
  kyeroPrime: boolean;
  // Localization
  DE: string;
  FR: string;
  NL: string;
  // Timestamps (Stored as ISO Strings)
  created: string;
  kdate: string; // Alternative date field
  lastEdited: string;
}