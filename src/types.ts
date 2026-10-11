export interface DocumentAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface InstitutionalDocument {
  id: string;
  title: string;
  number: string;
  date: string;
  description: string;
  document?: DocumentAttachment | null;
  isPublished?: boolean;
  status?: string; // 'Active' | 'Archived' | 'Superseded' | 'Draft' | 'Declared'
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface ContactInfo {
  officeAddress: string;
  email: string;
  phone: string;
  workingHours: string;
  additionalNotice: string;
  socialLinks?: ContactSocialLink[];
  locationMapInfo?: string;
  updatedAt: string;
}

export interface HomeStatItem {
  id: string;
  label: string;
  value: string;
  isCustom: boolean;
  enabled: boolean;
}

export interface HomeContent {
  websiteTitle: string;
  subtitle: string;
  heroHeading: string;
  heroSubtitle: string;
  heroKicker: string;
  heroDescription: string;
  heroButtons: {
    primaryText: string;
    primaryTarget: string;
    secondaryText: string;
    secondaryTarget: string;
  };
  welcomeHeading: string;
  welcomeText: string;
  noticeBanner: {
    enabled: boolean;
    badgeText: string;
    message: string;
    linkText?: string;
    linkTarget?: string;
  };
  stats: HomeStatItem[];
  heroImageUrl?: string;
  updatedAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  target: string;
  isExternal?: boolean;
  order: number;
  enabled: boolean;
}

export interface AboutCoreValue {
  title: string;
  description: string;
}

export interface AboutContent {
  heading: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  coreValues: AboutCoreValue[];
  keyResponsibilities: string[];
  updatedAt: string;
}

export interface FooterImportantLink {
  label: string;
  url: string;
}

export interface FooterSocialLink {
  platform: string;
  url: string;
}

export interface FooterContent {
  departmentName: string;
  subTitle: string;
  tagline: string;
  copyrightText: string;
  disclaimer: string;
  importantLinks: FooterImportantLink[];
  socialLinks: FooterSocialLink[];
  updatedAt: string;
}

export interface SiteSettings {
  websiteTitle: string;
  websiteDescription: string;
  logoText: string;
  logoSubtext: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeColor: 'navy' | 'slate' | 'royal-blue';
  emergencyBanner?: {
    enabled: boolean;
    text: string;
    level: 'info' | 'warning' | 'alert';
  };
  updatedAt: string;
}

export interface MediaFileItem {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
  isImage: boolean;
}

export type DocumentSectionType = 'notifications' | 'circulars' | 'orders' | 'results';

export interface AdminStats {
  totalNotifications: number;
  publishedNotifications?: number;
  draftNotifications?: number;
  totalCirculars: number;
  publishedCirculars?: number;
  draftCirculars?: number;
  totalOrders: number;
  publishedOrders?: number;
  draftOrders?: number;
  totalResults?: number;
  publishedResults?: number;
  draftResults?: number;
  totalMediaFiles?: number;
}
