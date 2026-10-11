import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Ensure data and uploads directories exist with persistent disk mount support (e.g. Render Persistent Disk)
const PERSISTENT_MOUNT = process.env.PERSISTENT_DIR || process.env.RENDER_DISK_PATH || process.env.DATA_PATH;
const DATA_DIR = PERSISTENT_MOUNT ? path.join(PERSISTENT_MOUNT, 'data') : path.resolve(__dirname, 'data');
const UPLOADS_DIR = PERSISTENT_MOUNT ? path.join(PERSISTENT_MOUNT, 'uploads') : (process.env.UPLOADS_DIR || path.resolve(__dirname, 'uploads'));
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_DB_FILE = path.resolve(__dirname, 'data', 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// If using custom persistent directory and db.json does not exist there yet, seed from repo db.json
if (!fs.existsSync(DB_FILE) && fs.existsSync(SEED_DB_FILE)) {
  try {
    fs.copyFileSync(SEED_DB_FILE, DB_FILE);
  } catch (err) {
    console.warn('Could not copy seed db.json to persistent volume:', err);
  }
}

// Data models
interface DocumentAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface InstitutionalDocument {
  id: string;
  title: string;
  number: string;
  date: string;
  description: string;
  document?: DocumentAttachment | null;
  isPublished?: boolean;
  status?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactSocialLink {
  platform: string;
  url: string;
  label: string;
}

interface ContactInfo {
  officeAddress: string;
  email: string;
  phone: string;
  workingHours: string;
  additionalNotice: string;
  socialLinks?: ContactSocialLink[];
  locationMapInfo?: string;
  updatedAt: string;
}

interface HomeStatItem {
  id: string;
  label: string;
  value: string;
  isCustom: boolean;
  enabled: boolean;
}

interface HomeContent {
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

interface NavItem {
  id: string;
  label: string;
  target: string;
  isExternal?: boolean;
  order: number;
  enabled: boolean;
}

interface AboutCoreValue {
  title: string;
  description: string;
}

interface AboutContent {
  heading: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  coreValues: AboutCoreValue[];
  keyResponsibilities: string[];
  updatedAt: string;
}

interface FooterImportantLink {
  label: string;
  url: string;
}

interface FooterSocialLink {
  platform: string;
  url: string;
}

interface FooterContent {
  departmentName: string;
  subTitle: string;
  tagline: string;
  copyrightText: string;
  disclaimer: string;
  importantLinks: FooterImportantLink[];
  socialLinks: FooterSocialLink[];
  updatedAt: string;
}

interface SiteSettings {
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

interface DatabaseSchema {
  notifications: InstitutionalDocument[];
  circulars: InstitutionalDocument[];
  orders: InstitutionalDocument[];
  results: InstitutionalDocument[];
  contact: ContactInfo;
  homeContent: HomeContent;
  navItems: NavItem[];
  aboutContent: AboutContent;
  footerContent: FooterContent;
  siteSettings: SiteSettings;
}

const defaultHomeContent: HomeContent = {
  websiteTitle: 'Department of Education',
  subtitle: 'AKA Home · Official Repository',
  heroHeading: 'Department of Education',
  heroSubtitle: 'AKA Home',
  heroKicker: 'Institutional Document Repository',
  heroDescription:
    'The Department of Education, AKA Home is an independent educational administration dedicated to academic governance, institutional standards, curriculum coordination, and administrative integrity. This portal serves as the centralized repository for all official notifications, administrative circulars, executive orders, and institutional communications.',
  heroButtons: {
    primaryText: 'View Notifications',
    primaryTarget: 'notifications',
    secondaryText: 'Administrative Circulars',
    secondaryTarget: 'circulars',
  },
  welcomeHeading: 'Institutional Repository & Directives',
  welcomeText:
    'All documents published in this repository are maintained by the administrative office of Department of Education, AKA Home. For clarification on published records or inquiries, navigate to the Contact section.',
  noticeBanner: {
    enabled: false,
    badgeText: 'IMPORTANT NOTICE',
    message: '',
    linkText: 'Read More',
    linkTarget: 'notifications',
  },
  stats: [
    { id: 'stat-notifs', label: 'Official Notifications', value: 'Live Archive', isCustom: false, enabled: true },
    { id: 'stat-circs', label: 'Administrative Circulars', value: 'Updated Weekly', isCustom: false, enabled: true },
    { id: 'stat-orders', label: 'Executive Orders', value: 'Verified Records', isCustom: false, enabled: true },
    { id: 'stat-public', label: 'Public Access', value: '100% Free', isCustom: true, enabled: true },
  ],
  heroImageUrl: '',
  updatedAt: new Date().toISOString(),
};

const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'Home', target: 'home', order: 1, enabled: true },
  { id: 'public-circular', label: 'Public Circular', target: 'public-circular', order: 2, enabled: true },
  { id: 'results', label: 'Result', target: 'results', order: 3, enabled: true },
  { id: 'contact', label: 'Contact', target: 'contact', order: 4, enabled: true },
];

const defaultAboutContent: AboutContent = {
  heading: 'About Department of Education, AKA Home',
  subtitle: 'Governance, Standards, and Institutional Integrity',
  description:
    'The Department of Education, AKA Home operates as an independent educational administration overseeing administrative coordination, curriculum guidance, official circular distribution, and institutional directives.',
  mission:
    'To foster educational excellence, institutional transparency, and administrative rigor through clear public notices, verified circulars, and disciplined governance standards.',
  vision:
    'A modern, accessible, and accountable institutional framework providing equitable educational oversight and reliable repository access for students, educators, and administrators.',
  coreValues: [
    { title: 'Transparency', description: 'Immediate public access to all circulars, notifications, and administrative determinations.' },
    { title: 'Academic Integrity', description: 'Upholding rigorous pedagogical standards and institutional compliance across all programs.' },
    { title: 'Accountability', description: 'Systematic record-keeping and verifiable executive orders published in digital repository format.' },
    { title: 'Accessibility', description: 'Universal access to public documentation with clear classification and responsive support.' },
  ],
  keyResponsibilities: [
    'Issuing regulatory circulars and advisory memoranda.',
    'Publishing official notifications and public announcements.',
    'Executing institutional orders and administrative directives.',
    'Maintaining verifiable public document records and archival repositories.',
    'Addressing public correspondence and institutional inquiries.',
  ],
  updatedAt: new Date().toISOString(),
};

const defaultFooterContent: FooterContent = {
  departmentName: 'Department of Education',
  subTitle: 'AKA Home · Administrative Repository',
  tagline: 'Centralized institutional catalog for official notifications, circulars, executive directives, and verified educational correspondence.',
  copyrightText: `© ${new Date().getFullYear()} Department of Education, AKA Home. All institutional rights reserved.`,
  disclaimer: 'This website is an independent institutional document repository for Department of Education, AKA Home. It is not connected to any government department, public authority, or external state portal.',
  importantLinks: [
    { label: 'Notifications', url: 'notifications' },
    { label: 'Circulars', url: 'circulars' },
    { label: 'Orders', url: 'orders' },
    { label: 'About the Department', url: 'about' },
    { label: 'Contact Directory', url: 'contact' },
  ],
  socialLinks: [],
  updatedAt: new Date().toISOString(),
};

const defaultSiteSettings: SiteSettings = {
  websiteTitle: 'Department of Education - AKA Home',
  websiteDescription: 'Official institutional portal for Department of Education, AKA Home featuring notifications, circulars, orders, and official notices.',
  logoText: 'Department of Education',
  logoSubtext: 'AKA Home · Official Repository',
  logoUrl: '',
  faviconUrl: '',
  themeColor: 'navy',
  emergencyBanner: {
    enabled: false,
    text: '',
    level: 'info',
  },
  updatedAt: new Date().toISOString(),
};

function initDB(): DatabaseSchema {
  const defaultDB: DatabaseSchema = {
    notifications: [],
    circulars: [],
    orders: [],
    results: [],
    contact: {
      officeAddress: '[Address not specified - can be updated via Admin Panel]',
      email: '[Email address not specified - can be updated via Admin Panel]',
      phone: '[Telephone number not specified - can be updated via Admin Panel]',
      workingHours: '[Working hours not specified - can be updated via Admin Panel]',
      additionalNotice: '[Official administrative notice not specified - can be updated via Admin Panel]',
      updatedAt: new Date().toISOString(),
    },
    homeContent: defaultHomeContent,
    navItems: defaultNavItems,
    aboutContent: defaultAboutContent,
    footerContent: defaultFooterContent,
    siteSettings: defaultSiteSettings,
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
    return defaultDB;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    const notifications: InstitutionalDocument[] = (Array.isArray(parsed.notifications) ? parsed.notifications : []).map(
      (n: any) => ({
        ...n,
        isPublished: n.isPublished !== undefined ? n.isPublished : true,
        status: n.status || 'Active',
      })
    );

    const circulars: InstitutionalDocument[] = (Array.isArray(parsed.circulars) ? parsed.circulars : []).map(
      (c: any) => ({
        ...c,
        isPublished: c.isPublished !== undefined ? c.isPublished : true,
        status: c.status || 'Active',
      })
    );

    const orders: InstitutionalDocument[] = (Array.isArray(parsed.orders) ? parsed.orders : []).map(
      (o: any) => ({
        ...o,
        isPublished: o.isPublished !== undefined ? o.isPublished : true,
        status: o.status || 'Active',
      })
    );

    const results: InstitutionalDocument[] = (Array.isArray(parsed.results) ? parsed.results : []).map(
      (r: any) => ({
        ...r,
        isPublished: r.isPublished !== undefined ? r.isPublished : true,
        status: r.status || 'Declared',
      })
    );

    const migrated: DatabaseSchema = {
      notifications,
      circulars,
      orders,
      results,
      contact: parsed.contact || defaultDB.contact,
      homeContent: parsed.homeContent || defaultDB.homeContent,
      navItems: Array.isArray(parsed.navItems) && parsed.navItems.length > 0 ? parsed.navItems : defaultDB.navItems,
      aboutContent: parsed.aboutContent || defaultDB.aboutContent,
      footerContent: parsed.footerContent || defaultDB.footerContent,
      siteSettings: parsed.siteSettings || defaultDB.siteSettings,
    };

    // If new keys were missing, save migrated state
    if (
      !parsed.homeContent ||
      !parsed.navItems ||
      !parsed.aboutContent ||
      !parsed.footerContent ||
      !parsed.siteSettings ||
      !parsed.results
    ) {
      fs.writeFileSync(DB_FILE, JSON.stringify(migrated, null, 2), 'utf-8');
    }

    return migrated;
  } catch (err) {
    console.error('Error reading db.json, recreating defaults', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
    return defaultDB;
  }
}

function readDB(): DatabaseSchema {
  return initDB();
}

function writeDB(data: DatabaseSchema): void {
  const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Admin accounts configuration
// Passwords can be managed securely via Render environment variables:
// - ADMIN_ITBDOE_PASSWORD (for user 'itbdoe')
// - ADMIN_DOEADMIN_PASSWORD (for user 'doeadmin')
interface AdminAccountDef {
  userId: string;
  role: string;
  getValidPasswords: () => string[];
}

const ADMIN_ACCOUNTS_LIST: AdminAccountDef[] = [
  {
    userId: 'itbdoe',
    role: 'Administrator (IT Branch)',
    getValidPasswords: () => {
      const envPass = process.env.ADMIN_ITBDOE_PASSWORD || process.env.ADMIN_USER1_PASSWORD;
      const valid = ['it.b@doe26', 'itb.doe@akah'];
      if (envPass && !valid.includes(envPass)) valid.unshift(envPass);
      return valid;
    },
  },
  {
    userId: 'doeadmin',
    role: 'Administrator (DoE)',
    getValidPasswords: () => {
      const envPass = process.env.ADMIN_DOEADMIN_PASSWORD || process.env.ADMIN_USER2_PASSWORD;
      const valid = ['doe.admin@26', 'DoEakah@2026'];
      if (envPass && !valid.includes(envPass)) valid.unshift(envPass);
      return valid;
    },
  },
  // Legacy account aliases for backward compatibility
  {
    userId: 'itbdoeakah',
    role: 'Administrator (IT Branch)',
    getValidPasswords: () => {
      const envPass = process.env.ADMIN_ITBDOE_PASSWORD;
      const valid = ['it.b@doe26', 'itb.doe@akah'];
      if (envPass && !valid.includes(envPass)) valid.unshift(envPass);
      return valid;
    },
  },
  {
    userId: 'dirdoe',
    role: 'Administrator',
    getValidPasswords: () => {
      const envPass = process.env.ADMIN_DOEADMIN_PASSWORD;
      const valid = ['doe.admin@26', 'DoEakah@2026'];
      if (envPass && !valid.includes(envPass)) valid.unshift(envPass);
      return valid;
    },
  },
];

function findAdminAccount(userId: string): AdminAccountDef | undefined {
  const norm = (userId || '').trim().toLowerCase();
  return ADMIN_ACCOUNTS_LIST.find((a) => a.userId.toLowerCase() === norm);
}

// Session management
const activeSessions = new Map<string, { userId: string; createdAt: number; expiresAt: number }>();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function generateSessionToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    userId,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  });
  return token;
}

function getSession(token?: string | null): { userId: string; createdAt: number; expiresAt: number } | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

function validateSession(token?: string | null): boolean {
  return getSession(token) !== null;
}

function revokeSession(token?: string | null): void {
  if (token) {
    activeSessions.delete(token);
  }
}

// Multer storage for documents and media
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 40);
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${safeBase}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'
  ];
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed formats: PDF, DOC, DOCX, TXT, RTF, ODT, PNG, JPG, JPEG, WEBP, SVG, GIF.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 35 * 1024 * 1024, // 35 MB max
  },
});

// Middleware for admin auth
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  if (!validateSession(token)) {
    res.status(401).json({ error: 'Unauthorized: Administrative authentication required.' });
    return;
  }
  next();
}

function isRequestFromAdmin(req: Request): boolean {
  const authHeader = req.headers.authorization;
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }
  return validateSession(token);
}

// Express config
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to remove document file safely
function deleteDocumentFile(filename?: string | null) {
  if (!filename) return;
  const safeName = path.basename(filename);
  const filePath = path.join(UPLOADS_DIR, safeName);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('Failed to unlink file:', filePath, e);
    }
  }
}

// --- Public Endpoints ---

// Public Content Bundle
app.get('/api/public/content', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({
    home: db.homeContent,
    nav: db.navItems.filter((item) => item.enabled).sort((a, b) => a.order - b.order),
    about: db.aboutContent,
    footer: db.footerContent,
    settings: db.siteSettings,
    contact: db.contact,
  });
});

// About content
app.get('/api/about', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.aboutContent);
});

// Get all notifications (public gets published only, unless admin token is present)
app.get('/api/notifications', (req: Request, res: Response) => {
  const db = readDB();
  const isAdmin = isRequestFromAdmin(req);
  let list = db.notifications;
  if (!isAdmin) {
    list = list.filter((n) => n.isPublished !== false);
  }
  const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

// Get single notification
app.get('/api/notifications/:id', (req: Request, res: Response) => {
  const db = readDB();
  const item = db.notifications.find((n) => n.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }
  if (item.isPublished === false && !isRequestFromAdmin(req)) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }
  res.json(item);
});

// Get all circulars
app.get('/api/circulars', (req: Request, res: Response) => {
  const db = readDB();
  const isAdmin = isRequestFromAdmin(req);
  let list = db.circulars;
  if (!isAdmin) {
    list = list.filter((c) => c.isPublished !== false);
  }
  const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

// Get single circular
app.get('/api/circulars/:id', (req: Request, res: Response) => {
  const db = readDB();
  const item = db.circulars.find((c) => c.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Circular not found' });
    return;
  }
  if (item.isPublished === false && !isRequestFromAdmin(req)) {
    res.status(404).json({ error: 'Circular not found' });
    return;
  }
  res.json(item);
});

// Get all orders
app.get('/api/orders', (req: Request, res: Response) => {
  const db = readDB();
  const isAdmin = isRequestFromAdmin(req);
  let list = db.orders;
  if (!isAdmin) {
    list = list.filter((o) => o.isPublished !== false);
  }
  const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

// Get single order
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const db = readDB();
  const item = db.orders.find((o) => o.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (item.isPublished === false && !isRequestFromAdmin(req)) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(item);
});

// Get all results
app.get('/api/results', (req: Request, res: Response) => {
  const db = readDB();
  const isAdmin = isRequestFromAdmin(req);
  let list = db.results || [];
  if (!isAdmin) {
    list = list.filter((r) => r.isPublished !== false);
  }
  const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

// Get single result
app.get('/api/results/:id', (req: Request, res: Response) => {
  const db = readDB();
  const item = (db.results || []).find((r) => r.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Result not found' });
    return;
  }
  if (item.isPublished === false && !isRequestFromAdmin(req)) {
    res.status(404).json({ error: 'Result not found' });
    return;
  }
  res.json(item);
});

// Get contact info
app.get('/api/contact', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.contact);
});

// Document/media file serving / inline viewing
app.get('/api/documents/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename); // Sanitize traversal
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).send('Document not found');
    return;
  }

  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.pdf') contentType = 'application/pdf';
  else if (ext === '.txt') contentType = 'text/plain';
  else if (ext === '.doc') contentType = 'application/msword';
  else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.svg') contentType = 'image/svg+xml';
  else if (ext === '.gif') contentType = 'image/gif';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// Document file download
app.get('/api/documents/:filename/download', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).send('Document not found');
    return;
  }

  const db = readDB();
  let originalName = filename;
  const allDocs = [...db.notifications, ...db.circulars, ...db.orders, ...(db.results || [])];
  for (const item of allDocs) {
    if (item.document && item.document.filename === filename) {
      originalName = item.document.originalName;
      break;
    }
  }

  res.download(filePath, originalName);
});

// --- Authentication Endpoints ---

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    res.status(400).json({ error: 'User ID and Password are required.' });
    return;
  }

  const trimmedId = String(userId).trim();
  const account = findAdminAccount(trimmedId);

  if (account) {
    const validPasswords = account.getValidPasswords();
    if (validPasswords.includes(String(password).trim())) {
      const token = generateSessionToken(account.userId);
      res.json({
        success: true,
        token,
        user: {
          userId: account.userId,
          role: account.role,
        },
        message: 'Authentication successful.',
      });
      return;
    }
  }

  res.status(401).json({ error: 'Invalid User ID or Password.' });
});

// Verify current session
app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  const session = getSession(token);
  if (session) {
    const account = findAdminAccount(session.userId);
    res.json({
      valid: true,
      userId: session.userId,
      role: account ? account.role : 'Administrator',
    });
  } else {
    res.status(401).json({ valid: false, error: 'Session expired or invalid.' });
  }
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  revokeSession(token);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// --- Admin CMS Endpoints (All requireAdmin) ---

// CMS Statistics
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const files = fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : [];

  res.json({
    totalNotifications: db.notifications.length,
    publishedNotifications: db.notifications.filter((n) => n.isPublished !== false).length,
    draftNotifications: db.notifications.filter((n) => n.isPublished === false).length,
    totalCirculars: db.circulars.length,
    publishedCirculars: db.circulars.filter((c) => c.isPublished !== false).length,
    draftCirculars: db.circulars.filter((c) => c.isPublished === false).length,
    totalOrders: db.orders.length,
    publishedOrders: db.orders.filter((o) => o.isPublished !== false).length,
    draftOrders: db.orders.filter((o) => o.isPublished === false).length,
    totalResults: (db.results || []).length,
    publishedResults: (db.results || []).filter((r) => r.isPublished !== false).length,
    draftResults: (db.results || []).filter((r) => r.isPublished === false).length,
    totalMediaFiles: files.length,
  });
});

// --- 1. Notification Management ---
app.get('/api/admin/notifications', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const sorted = [...db.notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

app.post('/api/admin/notifications', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { title, number, date, description, isPublished, status } = req.body;
    if (!title || !number || !date) {
      res.status(400).json({ error: 'Title, Notification Number, and Date are required.' });
      return;
    }

    const db = readDB();
    const id = `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    let docAttachment: DocumentAttachment | null = null;
    if (req.file) {
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    }

    const newNotification: InstitutionalDocument = {
      id,
      title: title.trim(),
      number: number.trim(),
      date: date.trim(),
      description: description ? description.trim() : '',
      document: docAttachment,
      isPublished: isPublished === 'false' || isPublished === false ? false : true,
      status: status ? status.trim() : 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.notifications.unshift(newNotification);
    writeDB(db);

    res.status(201).json(newNotification);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/notifications/:id', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, number, date, description, removeDocument, isPublished, status } = req.body;

    const db = readDB();
    const index = db.notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    const existing = db.notifications[index];
    let docAttachment = existing.document;

    if (req.file) {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    } else if (removeDocument === 'true') {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = null;
    }

    const updated: InstitutionalDocument = {
      ...existing,
      title: title ? title.trim() : existing.title,
      number: number ? number.trim() : existing.number,
      date: date ? date.trim() : existing.date,
      description: description !== undefined ? description.trim() : existing.description,
      document: docAttachment,
      isPublished: isPublished !== undefined ? isPublished === 'true' || isPublished === true : existing.isPublished,
      status: status !== undefined ? status.trim() : existing.status,
      updatedAt: new Date().toISOString(),
    };

    db.notifications[index] = updated;
    writeDB(db);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/notifications/:id/publish', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.notifications.findIndex((n) => n.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  const current = db.notifications[index];
  current.isPublished = !current.isPublished;
  current.updatedAt = new Date().toISOString();
  db.notifications[index] = current;
  writeDB(db);

  res.json(current);
});

app.delete('/api/admin/notifications/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.notifications.findIndex((n) => n.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  const existing = db.notifications[index];
  if (existing.document) {
    deleteDocumentFile(existing.document.filename);
  }

  db.notifications.splice(index, 1);
  writeDB(db);

  res.json({ success: true, message: 'Notification deleted successfully' });
});

// --- 2. Circular Management ---
app.get('/api/admin/circulars', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const sorted = [...db.circulars].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

app.post('/api/admin/circulars', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { title, number, date, description, isPublished, status } = req.body;
    if (!title || !number || !date) {
      res.status(400).json({ error: 'Title, Circular Number, and Date are required.' });
      return;
    }

    const db = readDB();
    const id = `circ_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    let docAttachment: DocumentAttachment | null = null;
    if (req.file) {
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    }

    const newCircular: InstitutionalDocument = {
      id,
      title: title.trim(),
      number: number.trim(),
      date: date.trim(),
      description: description ? description.trim() : '',
      document: docAttachment,
      isPublished: isPublished === 'false' || isPublished === false ? false : true,
      status: status ? status.trim() : 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.circulars.unshift(newCircular);
    writeDB(db);

    res.status(201).json(newCircular);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/circulars/:id', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, number, date, description, removeDocument, isPublished, status } = req.body;

    const db = readDB();
    const index = db.circulars.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Circular not found' });
      return;
    }

    const existing = db.circulars[index];
    let docAttachment = existing.document;

    if (req.file) {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    } else if (removeDocument === 'true') {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = null;
    }

    const updated: InstitutionalDocument = {
      ...existing,
      title: title ? title.trim() : existing.title,
      number: number ? number.trim() : existing.number,
      date: date ? date.trim() : existing.date,
      description: description !== undefined ? description.trim() : existing.description,
      document: docAttachment,
      isPublished: isPublished !== undefined ? isPublished === 'true' || isPublished === true : existing.isPublished,
      status: status !== undefined ? status.trim() : existing.status,
      updatedAt: new Date().toISOString(),
    };

    db.circulars[index] = updated;
    writeDB(db);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/circulars/:id/publish', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.circulars.findIndex((c) => c.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Circular not found' });
    return;
  }

  const current = db.circulars[index];
  current.isPublished = !current.isPublished;
  current.updatedAt = new Date().toISOString();
  db.circulars[index] = current;
  writeDB(db);

  res.json(current);
});

app.delete('/api/admin/circulars/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.circulars.findIndex((c) => c.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Circular not found' });
    return;
  }

  const existing = db.circulars[index];
  if (existing.document) {
    deleteDocumentFile(existing.document.filename);
  }

  db.circulars.splice(index, 1);
  writeDB(db);

  res.json({ success: true, message: 'Circular deleted successfully' });
});

// --- 3. Order Management / Records ---
app.get('/api/admin/orders', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const sorted = [...db.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

app.post('/api/admin/orders', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { title, number, date, description, isPublished, status } = req.body;
    if (!title || !number || !date) {
      res.status(400).json({ error: 'Title, Order Number, and Date are required.' });
      return;
    }

    const db = readDB();
    const id = `ord_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    let docAttachment: DocumentAttachment | null = null;
    if (req.file) {
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    }

    const newOrder: InstitutionalDocument = {
      id,
      title: title.trim(),
      number: number.trim(),
      date: date.trim(),
      description: description ? description.trim() : '',
      document: docAttachment,
      isPublished: isPublished === 'false' || isPublished === false ? false : true,
      status: status ? status.trim() : 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    writeDB(db);

    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, number, date, description, removeDocument, isPublished, status } = req.body;

    const db = readDB();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const existing = db.orders[index];
    let docAttachment = existing.document;

    if (req.file) {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    } else if (removeDocument === 'true') {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = null;
    }

    const updated: InstitutionalDocument = {
      ...existing,
      title: title ? title.trim() : existing.title,
      number: number ? number.trim() : existing.number,
      date: date ? date.trim() : existing.date,
      description: description !== undefined ? description.trim() : existing.description,
      document: docAttachment,
      isPublished: isPublished !== undefined ? isPublished === 'true' || isPublished === true : existing.isPublished,
      status: status !== undefined ? status.trim() : existing.status,
      updatedAt: new Date().toISOString(),
    };

    db.orders[index] = updated;
    writeDB(db);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/orders/:id/publish', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const current = db.orders[index];
  current.isPublished = !current.isPublished;
  current.updatedAt = new Date().toISOString();
  db.orders[index] = current;
  writeDB(db);

  res.json(current);
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }

  const db = readDB();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.orders[index].status = String(status).trim();
  db.orders[index].updatedAt = new Date().toISOString();
  writeDB(db);

  res.json(db.orders[index]);
});

app.delete('/api/admin/orders/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const existing = db.orders[index];
  if (existing.document) {
    deleteDocumentFile(existing.document.filename);
  }

  db.orders.splice(index, 1);
  writeDB(db);

  res.json({ success: true, message: 'Order deleted successfully' });
});

// --- 4. Result Management ---
app.get('/api/admin/results', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  const sorted = [...(db.results || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

app.post('/api/admin/results', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { title, number, date, description, isPublished, status, category } = req.body;
    if (!title || !number || !date) {
      res.status(400).json({ error: 'Title, Result/Roll Series Number, and Date are required.' });
      return;
    }

    const db = readDB();
    if (!db.results) db.results = [];
    const id = `res_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    let docAttachment: DocumentAttachment | null = null;
    if (req.file) {
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    }

    const newResult: InstitutionalDocument = {
      id,
      title: title.trim(),
      number: number.trim(),
      date: date.trim(),
      description: description ? description.trim() : '',
      document: docAttachment,
      isPublished: isPublished === 'false' || isPublished === false ? false : true,
      status: status ? status.trim() : 'Declared',
      category: category ? category.trim() : 'Examination',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.results.unshift(newResult);
    writeDB(db);

    res.status(201).json(newResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/results/:id', requireAdmin, upload.single('document'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, number, date, description, removeDocument, isPublished, status, category } = req.body;

    const db = readDB();
    if (!db.results) db.results = [];
    const index = db.results.findIndex((r) => r.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }

    const existing = db.results[index];
    let docAttachment = existing.document;

    if (req.file) {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      };
    } else if (removeDocument === 'true') {
      if (existing.document) {
        deleteDocumentFile(existing.document.filename);
      }
      docAttachment = null;
    }

    const updated: InstitutionalDocument = {
      ...existing,
      title: title ? title.trim() : existing.title,
      number: number ? number.trim() : existing.number,
      date: date ? date.trim() : existing.date,
      description: description !== undefined ? description.trim() : existing.description,
      document: docAttachment,
      isPublished: isPublished !== undefined ? isPublished === 'true' || isPublished === true : existing.isPublished,
      status: status !== undefined ? status.trim() : existing.status,
      category: category !== undefined ? category.trim() : existing.category,
      updatedAt: new Date().toISOString(),
    };

    db.results[index] = updated;
    writeDB(db);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/admin/results/:id/publish', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.results) db.results = [];
  const index = db.results.findIndex((r) => r.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Result not found' });
    return;
  }

  const current = db.results[index];
  current.isPublished = !current.isPublished;
  current.updatedAt = new Date().toISOString();
  db.results[index] = current;
  writeDB(db);

  res.json(current);
});

app.delete('/api/admin/results/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.results) db.results = [];
  const index = db.results.findIndex((r) => r.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Result not found' });
    return;
  }

  const existing = db.results[index];
  if (existing.document) {
    deleteDocumentFile(existing.document.filename);
  }

  db.results.splice(index, 1);
  writeDB(db);

  res.json({ success: true, message: 'Result deleted successfully' });
});

// --- 4. Content Management System (Home, Nav, About, Footer, Settings, Contact) ---

// Home Content
app.get('/api/admin/content/home', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.homeContent);
});

app.put('/api/admin/content/home', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  db.homeContent = {
    ...db.homeContent,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeDB(db);
  res.json(db.homeContent);
});

// Navigation Items
app.get('/api/admin/content/nav', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.navItems.sort((a, b) => a.order - b.order));
});

app.put('/api/admin/content/nav', requireAdmin, (req: Request, res: Response) => {
  const { navItems } = req.body;
  if (!Array.isArray(navItems)) {
    res.status(400).json({ error: 'navItems must be an array' });
    return;
  }
  const db = readDB();
  db.navItems = navItems;
  writeDB(db);
  res.json(db.navItems);
});

// About Page Content
app.get('/api/admin/content/about', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.aboutContent);
});

app.put('/api/admin/content/about', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  db.aboutContent = {
    ...db.aboutContent,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeDB(db);
  res.json(db.aboutContent);
});

// Contact Info
app.put('/api/admin/contact', requireAdmin, (req: Request, res: Response) => {
  const { officeAddress, email, phone, workingHours, additionalNotice, socialLinks, locationMapInfo } = req.body;
  const db = readDB();

  db.contact = {
    ...db.contact,
    officeAddress: officeAddress !== undefined ? String(officeAddress).trim() : db.contact.officeAddress,
    email: email !== undefined ? String(email).trim() : db.contact.email,
    phone: phone !== undefined ? String(phone).trim() : db.contact.phone,
    workingHours: workingHours !== undefined ? String(workingHours).trim() : db.contact.workingHours,
    additionalNotice: additionalNotice !== undefined ? String(additionalNotice).trim() : db.contact.additionalNotice,
    socialLinks: Array.isArray(socialLinks) ? socialLinks : db.contact.socialLinks,
    locationMapInfo: locationMapInfo !== undefined ? String(locationMapInfo).trim() : db.contact.locationMapInfo,
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json(db.contact);
});

// Footer Content
app.get('/api/admin/content/footer', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.footerContent);
});

app.put('/api/admin/content/footer', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  db.footerContent = {
    ...db.footerContent,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeDB(db);
  res.json(db.footerContent);
});

// Site Settings
app.get('/api/admin/content/settings', requireAdmin, (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.siteSettings);
});

app.put('/api/admin/content/settings', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  db.siteSettings = {
    ...db.siteSettings,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeDB(db);
  res.json(db.siteSettings);
});

// --- 5. Media Library Management ---
app.get('/api/admin/media', requireAdmin, (_req: Request, res: Response) => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    res.json([]);
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  const mediaList = files.map((filename) => {
    const filePath = path.join(UPLOADS_DIR, filename);
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);

    return {
      filename,
      originalName: filename,
      mimeType: isImage ? `image/${ext.replace('.', '')}` : 'application/octet-stream',
      size: stats.size,
      uploadedAt: stats.mtime.toISOString(),
      url: `/api/documents/${encodeURIComponent(filename)}`,
      isImage,
    };
  }).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  res.json(mediaList);
});

app.post('/api/admin/media', requireAdmin, upload.array('files', 12), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const uploadedItems = files.map((file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: `/api/documents/${encodeURIComponent(file.filename)}`,
        isImage,
      };
    });

    res.status(201).json(uploadedItems);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Media upload failed' });
  }
});

app.delete('/api/admin/media/:filename', requireAdmin, (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted from media storage' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete file' });
  }
});

app.put('/api/admin/media/:filename/replace', requireAdmin, upload.single('file'), (req: Request, res: Response) => {
  const targetFilename = path.basename(req.params.filename);
  const targetPath = path.join(UPLOADS_DIR, targetFilename);

  if (!req.file) {
    res.status(400).json({ error: 'New replacement file is required' });
    return;
  }

  try {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    // Rename uploaded file to target filename to keep exact path references
    fs.renameSync(req.file.path, targetPath);

    const stats = fs.statSync(targetPath);
    const ext = path.extname(targetFilename).toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);

    res.json({
      filename: targetFilename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: stats.size,
      uploadedAt: new Date().toISOString(),
      url: `/api/documents/${encodeURIComponent(targetFilename)}`,
      isImage,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to replace file' });
  }
});

// Start server with Vite or static bundle
async function startServer() {
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
