
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  file: File;
  previewUrl: string;
  mimeType: string;
  base64Data: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
  groundingSources?: GroundingSource[];
  error?: boolean;
}

export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}

export interface AppConfig {
  model: GeminiModel;
  systemInstruction: string;
  useGrounding: boolean;
  thinkingBudget: number; // 0 for off
}

export type ProductCategory = 'beat' | 'sample_pack' | 'album' | 'collab' | 'merch';

export interface TrackStats {
  plays: number;
  sales: number;
  revenue: number;
}

export interface License {
  name: string;
  price: number;
  features: string[];
}

export interface Track {
  id: string | number;
  title: string;
  producer: string;
  bpm: number | string;
  key: string;
  price: number | string; // Base price (usually Basic License)
  mood?: string;
  tags?: string[];
  cover: string; 
  audio: string;
  description?: string;
  category: ProductCategory;
  stemsUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  amazonUrl?: string;
  stats?: TrackStats;
  selectedLicense?: License; // For cart items
}

export interface BlogPost {
  id: number | string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  isAiGenerated?: boolean;
}

// --- CMS & Auth Types ---

export interface PageConfig {
  heroImage: string;
  headline: string;
  subheadline: string;
  buttonText?: string;
}

export interface SiteContent {
  store: PageConfig;
  collabs: PageConfig;
  licenses: PageConfig;
  blog: PageConfig;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPro?: boolean;
  isAdmin?: boolean; // Added for dashboard access
  orders: number;
}
