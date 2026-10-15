export type AppointmentStatus = 'new' | 'confirmed' | 'done' | 'cancelled';

export interface Appointment {
  id: string;
  created: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  doctor: string;
  date: string;
  time: string;
  note?: string;
  status: AppointmentStatus;
}

export interface BannerData {
  id: string;
  badge?: string;
  heading: string;
  text: string;
  cta?: string;
  active: boolean;
  created?: string;
}

export interface ClinicPost {
  id: string;
  title: string;
  date?: string;
  body: string;
  created?: string;
}

export interface ClinicSettings {
  phone?: string;
  whatsapp?: string;
  hours?: string;
  address?: string;
  admin_hash?: string;
}

export interface AppStoreData {
  appointments: Appointment[];
  banners: BannerData[];
  posts: ClinicPost[];
  settings: ClinicSettings;
}

export interface Article {
  slug: string;
  title: string;
  category: 'implants' | 'rct' | 'braces' | 'gums' | 'crowns' | 'kids' | 'cosmetic' | 'emergency' | 'prevention';
  categoryLabel: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  caption?: string;
  summary: string;
  featured?: boolean;
  sections: {
    heading?: string;
    paragraphs?: string[];
    bullets?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    callout?: {
      text: string;
      linkText: string;
      linkPage: string;
    };
  }[];
}

export interface Treatment {
  id: string;
  title: string;
  image: string;
  description: string;
  costLine: string;
  guideSlug?: string;
  guideTitle?: string;
}

export interface Doctor {
  name: string;
  title: string;
  credentials: string;
  image: string;
  bio: string;
}

export interface GalleryItem {
  image: string;
  title: string;
  caption: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type PageRoute = 
  | 'home' 
  | 'services' 
  | 'doctors' 
  | 'gallery' 
  | 'blog' 
  | 'contact' 
  | 'faq' 
  | 'privacy' 
  | 'admin'
  | { type: 'article'; slug: string };
