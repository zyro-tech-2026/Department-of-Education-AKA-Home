# Department of Education — AKA Home
## Institutional Document Repository & Content Management System (CMS)

Official standalone institutional document repository and content management system for **Department of Education, AKA Home**.

> **Notice:** This application is an independent institutional document repository and content management system. It is not connected to any government department, public authority, or external state portal.

---

## 1. Features

### Public Website (4 Primary Sections)
- **Home**: Institutional presentation featuring editable kicker, headings, descriptions, action buttons, active notice broadcasting, dynamic statistics counters, and preview streams of notifications, circulars, orders, and examination results.
- **Public Circular**: Comprehensive repository divided into three dedicated subsections:
  - **Notification**: Official public notices and gazette announcements with search and reference filters.
  - **Order**: Executive directives and institutional determinations with status workflows (`Active`, `Archived`, `Superseded`).
  - **Circulars**: Advisory memoranda and standard operating guidelines with instant preview and download.
- **Result**: Dedicated examination and recruitment results portal featuring search by roll number/reference, category filters (`Examination`, `Recruitment`, `Merit List`, `Screening`), and verified document/scorecard downloads.
- **Contact**: Institutional directory displaying office location, email, telephone, operating hours, transit directions, and official advisory notice.

### Full Administrative Content Management System (CMS)
- **Protected Access**: Two authorized administrative accounts:
  - User ID: `itbdoe` (IT Branch Administration)
  - User ID: `doeadmin` (DoE Executive Administration)
- **Security & Render Configuration**: Admin passwords are never published in source code or README. Store credentials securely in Render environment variables (`ADMIN_ITBDOE_PASSWORD`, `ADMIN_DOEADMIN_PASSWORD`).
- **Dashboard Overview**: Track total, published, and draft counts across Notifications, Circulars, Orders, Results, and Media assets.
- **Complete Document Management**: Add, edit, delete, publish, and unpublish notifications, orders, circulars, and results with attachment upload (PDF, DOCX, etc.).
- **Home Page Content Editor**:
  - Edit website title, subtitle/tagline, hero heading, hero description, and action button labels/targets.
  - Configure announcement notice banners (badge text, notice message, optional destination link).
  - Manage statistics counters and upload/assign hero images.
- **Header & Navigation Management**:
  - Reorder navigation items dynamically with move up/down controls.
  - Add new internal tabs or external links.
  - Edit menu labels and toggle link visibility on the live site.
- **Document Management (Notifications, Circulars, Orders)**:
  - Add, edit, and permanently delete records with irreversible confirmation protection.
  - **Publish / Unpublish (Draft)**: Toggle visibility between public and draft state so records can be prepared in advance before going live.
  - Update status classification (`Active`, `Archived`, `Superseded`, `Draft`).
  - Attach, preview, replace, or detach uploaded documents (PDF, DOC, DOCX, TXT, images up to 35MB).
- **About Page Editor**:
  - Customize institutional charter heading, subtitle, narrative, mission, vision, and core values.
- **Contact Directory Management**:
  - Update postal location, email correspondence, phone numbers, operating hours, and location transit directions with instant public synchronization.
- **Footer & Links Management**:
  - Edit department branding, subtitle, tagline, copyright text, legal disclaimers, and important links.
- **Media Library & Document Manager**:
  - Upload multiple files (PDFs, DOC, DOCX, PNG, JPG, JPEG, WebP, SVG).
  - Inspect file sizes, upload timestamps, and direct URLs (`/api/documents/:filename`).
  - One-click copy URL to easily integrate assets into website content.
  - Replace files on disk while retaining identical URL references.
  - Permanently delete media files with confirmation modals.
- **Global Site Settings**:
  - Configure website title (HTML `<title>` & SEO), metadata descriptions, logo text, logo image URL, and theme color palettes (`Navy Blue + Alabaster`, `Deep Slate + Whisper White`, `Royal Navy + Ivory`).
  - Broadcast global emergency announcement banners with severity levels (`Info`, `Warning`, `Critical Alert`).

---

## 2. Project Folder Structure

```
├── data/
│   └── db.json               # Persistent JSON storage for documents, CMS content & settings
├── uploads/                  # Persistent filesystem directory for uploaded documents and media
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Institutional navigation header with CMS sync
│   │   ├── Footer.tsx        # Institutional footer with CMS sync
│   │   ├── DocumentCard.tsx  # Document display card with unboxed metadata discipline & publish status
│   │   ├── DocumentFormModal.tsx # Add/Edit modal form with publish toggle & file validation
│   │   ├── DocumentViewerModal.tsx # Inline PDF and document modal viewer
│   │   └── DeleteConfirmModal.tsx  # Confirmation dialog for irreversible deletion
│   ├── views/
│   │   ├── HomeView.tsx          # Public Home page with CMS content integration
│   │   ├── NotificationsView.tsx # Public Notifications repository
│   │   ├── CircularsView.tsx     # Public Circulars repository
│   │   ├── OrdersView.tsx        # Public Orders / Records repository
│   │   ├── AboutView.tsx         # Public About page
│   │   ├── ContactView.tsx       # Public Contact page
│   │   └── admin/
│   │       ├── AdminLoginView.tsx     # Secure admin login form
│   │       └── AdminDashboardView.tsx # Complete Administrative CMS Console & Media Manager
│   ├── types.ts              # TypeScript schemas for documents, CMS content, nav & settings
│   ├── api.ts                # Client API layer for public & authenticated CMS endpoints
│   ├── App.tsx               # Root application router and global state
│   ├── main.tsx              # React DOM entry point
│   └── index.css             # Tailwind CSS configuration and typography
├── server.ts                 # Full-stack Express backend server, CMS APIs & Vite middleware
├── package.json              # Project scripts and dependencies
├── vite.config.ts            # Vite bundler configuration
└── tsconfig.json             # TypeScript compiler settings
```

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend / API**: Express 4, Node.js v22
- **Data & File Storage**: Local JSON persistent database (`data/db.json`) + Multer disk storage for PDF/documents/media (`uploads/`)
- **Authentication**: Cryptographically random session tokens with Bearer token authentication middleware for all administrative operations.

---

## 4. Instructions to Run Locally

### Prerequisites
- Node.js version 20 or higher (Node 22 recommended)
- npm or bun

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with the Express API and Vite client running simultaneously.

### Step 3: Accessing the Application
- Public portal: `http://localhost:3000`
- To log in to the administrative CMS, click **"Admin Portal"** in the top navigation bar or the footer, and sign in with authorized administrator credentials.

---

## 5. Instructions to Deploy

### Step 1: Build the Production Bundle
```bash
npm run build
```
This compiles the client SPA into the `dist/` directory.

### Step 2: Start the Production Server
```bash
npm start
```
`server.ts` will automatically detect `process.env.NODE_ENV === 'production'` (or when run after `build`) and serve the optimized static assets from `dist/` while providing all `/api/*` endpoints.

### Persistent Volumes
When deploying to container environments (Docker, Render, Google Cloud Run, AWS ECS, etc.), mount persistent volumes to `/data` and `/uploads` to ensure documents, media assets, and CMS content persist across container restarts.
