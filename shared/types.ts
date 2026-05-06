export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  user_id: number;
  email: string;
  pwd?: string;
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
  propid: number;
  DE: string | null;
  FR: string | null;
  NL: string | null;
  aircon: boolean;
  area: string | null;
  balconies: boolean;
  baths: number | null;
  beach: boolean;
  beds: number | null;
  created: string | null;
  description: string | null;
  display: boolean;
  finca: boolean;
  fireplace: boolean;
  frequency: string | null;
  furnished: string | null;
  golf: boolean;
  heating: boolean;
  images: string | null;
  kdate: string | null;
  kitchen: 'open' | 'separate' | null;
  kref: string | null;
  kyeroPrime: boolean;
  lastedited: string | null;
  leasehold: boolean;
  living: number | null;
  location: string | null;
  luxury: boolean;
  moredetails: string | null;
  notrain: boolean;
  offplan: boolean;
  originalprice: number | null;
  penthouse: boolean;
  plot: number | null;
  pool: 'No' | 'private' | 'community' | null;
  price: number | null;
  province: string | null;
  ptype: string | null;
  ref: string | null;
  rental: boolean;
  salestage: 0 | 1 | 2;
  solarium: boolean;
  topsix: boolean;
  town: string | null;
  utility: boolean;
}