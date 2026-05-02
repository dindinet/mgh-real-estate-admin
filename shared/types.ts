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
  id: string;
  ref: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  images: string[];
  location: string;
  created: number;
  lastEdited: number;
}