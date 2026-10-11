import {
  InstitutionalDocument,
  ContactInfo,
  DocumentSectionType,
  AdminStats,
  HomeContent,
  NavItem,
  AboutContent,
  FooterContent,
  SiteSettings,
  MediaFileItem,
} from './types.ts';

const TOKEN_KEY = 'doe_admin_session_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// --- Public API Methods ---
export async function getPublicBundle(): Promise<{
  home: HomeContent;
  nav: NavItem[];
  about: AboutContent;
  footer: FooterContent;
  settings: SiteSettings;
  contact: ContactInfo;
}> {
  const res = await fetch('/api/public/content');
  if (!res.ok) throw new Error('Failed to load public portal content');
  return res.json();
}

export async function getNotifications(): Promise<InstitutionalDocument[]> {
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/notifications', { headers });
  if (!res.ok) throw new Error('Failed to load notifications');
  return res.json();
}

export async function getCirculars(): Promise<InstitutionalDocument[]> {
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/circulars', { headers });
  if (!res.ok) throw new Error('Failed to load circulars');
  return res.json();
}

export async function getOrders(): Promise<InstitutionalDocument[]> {
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/orders', { headers });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

export async function getResults(): Promise<InstitutionalDocument[]> {
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/results', { headers });
  if (!res.ok) throw new Error('Failed to load results');
  return res.json();
}

export async function getContactInfo(): Promise<ContactInfo> {
  const res = await fetch('/api/contact');
  if (!res.ok) throw new Error('Failed to load contact information');
  return res.json();
}

export async function getAboutContent(): Promise<AboutContent> {
  const res = await fetch('/api/about');
  if (!res.ok) throw new Error('Failed to load about content');
  return res.json();
}

// --- Admin Authentication ---
export async function adminLogin(
  userId: string,
  password: string
): Promise<{ token: string; user: { userId: string; role: string } }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }

  setStoredToken(data.token);
  return data;
}

export async function verifyAdminSession(): Promise<{ valid: boolean; userId?: string; role?: string }> {
  const token = getStoredToken();
  if (!token) return { valid: false };

  try {
    const res = await fetch('/api/admin/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      removeStoredToken();
      return { valid: false };
    }
    const data = await res.json();
    return { valid: !!data.valid, userId: data.userId, role: data.role };
  } catch {
    return { valid: false };
  }
}

export async function adminLogout(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  removeStoredToken();
}

// --- Admin CMS Methods ---
export async function getAdminStats(): Promise<AdminStats> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch administrative statistics');
  return res.json();
}

// Admin Document Operations (Notifications, Circulars, Orders)
export async function getAdminDocuments(section: DocumentSectionType): Promise<InstitutionalDocument[]> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`/api/admin/${section}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to load ${section}`);
  return res.json();
}

export async function createDocument(
  section: DocumentSectionType,
  formData: FormData
): Promise<InstitutionalDocument> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`/api/admin/${section}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to create ${section.slice(0, -1)}`);
  return data;
}

export async function updateDocument(
  section: DocumentSectionType,
  id: string,
  formData: FormData
): Promise<InstitutionalDocument> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`/api/admin/${section}/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to update ${section.slice(0, -1)}`);
  return data;
}

export async function togglePublishDocument(
  section: DocumentSectionType,
  id: string
): Promise<InstitutionalDocument> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`/api/admin/${section}/${id}/publish`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to update publishing status`);
  return data;
}

export async function updateOrderStatus(id: string, status: string): Promise<InstitutionalDocument> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`/api/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update order status');
  return data;
}

export async function deleteDocument(
  section: DocumentSectionType,
  id: string
): Promise<void> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`/api/admin/${section}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to delete ${section.slice(0, -1)}`);
}

// Content Management APIs
export async function getAdminHomeContent(): Promise<HomeContent> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/home', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load home page content');
  return res.json();
}

export async function updateAdminHomeContent(data: Partial<HomeContent>): Promise<HomeContent> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/home', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to save home content');
  return result;
}

export async function getAdminNavItems(): Promise<NavItem[]> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/nav', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load navigation items');
  return res.json();
}

export async function updateAdminNavItems(navItems: NavItem[]): Promise<NavItem[]> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/nav', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ navItems }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to save navigation menu');
  return result;
}

export async function getAdminAboutContent(): Promise<AboutContent> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/about', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load about content');
  return res.json();
}

export async function updateAdminAboutContent(data: Partial<AboutContent>): Promise<AboutContent> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/about', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to save about content');
  return result;
}

export async function updateContactInfo(contactData: Partial<ContactInfo>): Promise<ContactInfo> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/contact', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update contact information');
  return data;
}

export async function getAdminFooterContent(): Promise<FooterContent> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/footer', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load footer content');
  return res.json();
}

export async function updateAdminFooterContent(data: Partial<FooterContent>): Promise<FooterContent> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/footer', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to save footer content');
  return result;
}

export async function getAdminSettings(): Promise<SiteSettings> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load site settings');
  return res.json();
}

export async function updateAdminSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/content/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to save site settings');
  return result;
}

// Media Library Operations
export async function getAdminMedia(): Promise<MediaFileItem[]> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch('/api/admin/media', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load media files');
  return res.json();
}

export async function uploadAdminMedia(files: File[]): Promise<MediaFileItem[]> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await fetch('/api/admin/media', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to upload media files');
  return result;
}

export async function deleteAdminMedia(filename: string): Promise<void> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`/api/admin/media/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to delete file');
}

export async function replaceAdminMedia(filename: string, file: File): Promise<MediaFileItem> {
  const token = getStoredToken();
  if (!token) throw new Error('Unauthorized');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/admin/media/${encodeURIComponent(filename)}/replace`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to replace file');
  return result;
}
