export type Locale = 'en' | 'zh';
export type Localized<T> = Record<Locale, T>;

export type ServiceType = 'kitchen' | 'bathroom' | 'whole-house' | 'basement' | 'cabinet' | 'commercial';

export interface Project {
  slug: string;
  title: Localized<string>;
  description: Localized<string>;
  project_story?: Localized<string>;
  excerpt?: Localized<string>;
  service_type: ServiceType;
  category: Localized<string>;
  location_city: string;
  budget_range?: string;
  duration?: Localized<string>;
  space_type?: Localized<string>;
  images: { src: string; alt: Localized<string>; is_before?: boolean }[];
  hero_image: string;
  service_scope?: Localized<string[]>;
  challenge?: Localized<string>;
  solution?: Localized<string>;
  published_at?: Date;
  featured?: boolean;
  badge?: Localized<string>;
}

export interface Service {
  slug: ServiceType;
  title: Localized<string>;
  description: Localized<string>;
  long_description?: Localized<string>;
  icon?: string;
  image?: string;
}

export interface ServiceArea {
  slug: string;
  name: Localized<string>;
  description?: Localized<string>;
}

export interface Testimonial {
  id: string;
  name: string;
  text: Localized<string>;
  rating: number;
  location: string;
}

export interface BlogPost {
  slug: string;
  title: Localized<string>;
  excerpt?: Localized<string>;
  content?: Localized<string>;
  published_at?: Date;
  url?: string;
}

export interface GalleryItem {
  image: string;
  title: Localized<string>;
  category: string;
}

export interface Company {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
  quoteUrl: string;
  experience: string;
  yearsExperience: string;
  teamSize: number;
  warranty: string;
  liabilityCoverage: string;
  rating: string;
  ratingSource: string;
}

export interface Showroom {
  address: string;
  appointmentText: Localized<string>;
  phone: string;
  email: string;
}

export interface AboutSections {
  ourJourney: Localized<string>;
  whatWeOffer: Localized<string>;
  ourValues: Localized<string>;
  whyChooseUs: Localized<string>;
  letsBuildTogether: Localized<string>;
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'youtube';
  url: string;
  label: string;
}
