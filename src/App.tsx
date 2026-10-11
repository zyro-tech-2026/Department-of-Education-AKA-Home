import React, { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getCirculars,
  getOrders,
  getResults,
  getPublicBundle,
  adminLogin,
  verifyAdminSession,
  adminLogout,
  getAdminStats,
  createDocument,
  updateDocument,
  togglePublishDocument,
  updateOrderStatus,
  deleteDocument,
  updateAdminHomeContent,
  updateAdminNavItems,
  updateAdminAboutContent,
  updateContactInfo,
  updateAdminFooterContent,
  updateAdminSettings,
  getAdminMedia,
  uploadAdminMedia,
  deleteAdminMedia,
  replaceAdminMedia,
} from './api.ts';
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
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { DocumentViewerModal } from './components/DocumentViewerModal.tsx';
import { HomeView } from './views/HomeView.tsx';
import { PublicCircularView } from './views/PublicCircularView.tsx';
import { ResultsView } from './views/ResultsView.tsx';
import { AboutView } from './views/AboutView.tsx';
import { ContactView } from './views/ContactView.tsx';
import { AdminLoginView } from './views/admin/AdminLoginView.tsx';
import { AdminDashboardView } from './views/admin/AdminDashboardView.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Document states
  const [notifications, setNotifications] = useState<InstitutionalDocument[]>([]);
  const [circulars, setCirculars] = useState<InstitutionalDocument[]>([]);
  const [orders, setOrders] = useState<InstitutionalDocument[]>([]);
  const [results, setResults] = useState<InstitutionalDocument[]>([]);

  // CMS Content states
  const [homeContent, setHomeContent] = useState<HomeContent>({
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
  });

  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: 'home', label: 'Home', target: 'home', order: 1, enabled: true },
    { id: 'public-circular', label: 'Public Circular', target: 'public-circular', order: 2, enabled: true },
    { id: 'results', label: 'Result', target: 'results', order: 3, enabled: true },
    { id: 'contact', label: 'Contact', target: 'contact', order: 4, enabled: true },
  ]);

  const [aboutContent, setAboutContent] = useState<AboutContent>({
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
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    officeAddress: '[Address not specified - can be updated via Admin Panel]',
    email: '[Email address not specified - can be updated via Admin Panel]',
    phone: '[Telephone number not specified - can be updated via Admin Panel]',
    workingHours: '[Working hours not specified - can be updated via Admin Panel]',
    additionalNotice: '[Official administrative notice not specified - can be updated via Admin Panel]',
    updatedAt: new Date().toISOString(),
  });

  const [footerContent, setFooterContent] = useState<FooterContent>({
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
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
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
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFileItem[]>([]);

  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalNotifications: 0,
    totalCirculars: 0,
    totalOrders: 0,
    totalMediaFiles: 0,
  });

  // Global document viewer modal state
  const [activeViewerDoc, setActiveViewerDoc] = useState<InstitutionalDocument | null>(null);

  // Load all public data & CMS content
  const loadPublicData = useCallback(async () => {
    try {
      const [bundle, notifs, circs, ords, resList] = await Promise.all([
        getPublicBundle().catch(() => null),
        getNotifications().catch(() => []),
        getCirculars().catch(() => []),
        getOrders().catch(() => []),
        getResults().catch(() => []),
      ]);

      if (bundle) {
        if (bundle.home) setHomeContent(bundle.home);
        if (bundle.nav && bundle.nav.length > 0) setNavItems(bundle.nav);
        if (bundle.about) setAboutContent(bundle.about);
        if (bundle.footer) setFooterContent(bundle.footer);
        if (bundle.settings) setSiteSettings(bundle.settings);
        if (bundle.contact) setContactInfo(bundle.contact);
      }

      setNotifications(notifs);
      setCirculars(circs);
      setOrders(ords);
      setResults(resList);

      setAdminStats({
        totalNotifications: notifs.length,
        totalCirculars: circs.length,
        totalOrders: ords.length,
        totalResults: resList.length,
      });
    } catch (err) {
      console.error('Failed to load portal data:', err);
    }
  }, []);

  // Load admin-specific data when authenticated
  const loadAdminSpecificData = useCallback(async () => {
    try {
      const [statsRes, mediaRes] = await Promise.all([
        getAdminStats().catch(() => null),
        getAdminMedia().catch(() => []),
      ]);
      if (statsRes) setAdminStats(statsRes);
      setMediaFiles(mediaRes);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    }
  }, []);

  // Check existing session
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await verifyAdminSession();
      setIsAdminAuthenticated(auth.valid);
      setAdminUserId(auth.userId || null);
      setIsCheckingAuth(false);
      if (auth.valid) {
        loadAdminSpecificData();
      }
    };
    checkAuth();
    loadPublicData();
  }, [loadPublicData, loadAdminSpecificData]);

  // Handler for admin login
  const handleAdminLogin = async (userId: string, pass: string) => {
    const res = await adminLogin(userId, pass);
    setIsAdminAuthenticated(true);
    setAdminUserId(res.user?.userId || userId);
    setCurrentTab('admin');
    await Promise.all([loadPublicData(), loadAdminSpecificData()]);
  };

  // Handler for admin logout
  const handleAdminLogout = async () => {
    await adminLogout();
    setIsAdminAuthenticated(false);
    setAdminUserId(null);
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  // Admin Document operations
  const handleCreateDocument = async (section: DocumentSectionType, formData: FormData) => {
    await createDocument(section, formData);
    await Promise.all([loadPublicData(), loadAdminSpecificData()]);
  };

  const handleUpdateDocument = async (
    section: DocumentSectionType,
    id: string,
    formData: FormData
  ) => {
    await updateDocument(section, id, formData);
    await Promise.all([loadPublicData(), loadAdminSpecificData()]);
  };

  const handleTogglePublish = async (section: DocumentSectionType, id: string) => {
    await togglePublishDocument(section, id);
    await Promise.all([loadPublicData(), loadAdminSpecificData()]);
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    await Promise.all([loadPublicData(), loadAdminSpecificData()]);
  };

  const handleDeleteDocument = async (section: DocumentSectionType, id: string) => {
    await deleteDocument(section, id);
    await Promise.all([loadPublicData(), loadAdminSpecificData()]);
  };

  // Admin CMS Content operations
  const handleUpdateHomeContent = async (data: Partial<HomeContent>) => {
    const updated = await updateAdminHomeContent(data);
    setHomeContent(updated);
  };

  const handleUpdateNavItems = async (items: NavItem[]) => {
    const updated = await updateAdminNavItems(items);
    setNavItems(updated);
  };

  const handleUpdateAboutContent = async (data: Partial<AboutContent>) => {
    const updated = await updateAdminAboutContent(data);
    setAboutContent(updated);
  };

  const handleUpdateContact = async (data: Partial<ContactInfo>) => {
    const updated = await updateContactInfo(data);
    setContactInfo(updated);
  };

  const handleUpdateFooterContent = async (data: Partial<FooterContent>) => {
    const updated = await updateAdminFooterContent(data);
    setFooterContent(updated);
  };

  const handleUpdateSiteSettings = async (data: Partial<SiteSettings>) => {
    const updated = await updateAdminSettings(data);
    setSiteSettings(updated);
  };

  // Admin Media operations
  const handleUploadMedia = async (files: File[]) => {
    await uploadAdminMedia(files);
    await loadAdminSpecificData();
  };

  const handleDeleteMedia = async (filename: string) => {
    await deleteAdminMedia(filename);
    await loadAdminSpecificData();
  };

  const handleReplaceMedia = async (filename: string, file: File) => {
    await replaceAdminMedia(filename, file);
    await loadAdminSpecificData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-white">
      {/* If currentTab is 'admin' and authenticated, render the dedicated Admin Console */}
      {currentTab === 'admin' && isAdminAuthenticated ? (
        <AdminDashboardView
          stats={adminStats}
          notifications={notifications}
          circulars={circulars}
          orders={orders}
          results={results}
          contactInfo={contactInfo}
          homeContent={homeContent}
          navItems={navItems}
          aboutContent={aboutContent}
          footerContent={footerContent}
          siteSettings={siteSettings}
          mediaFiles={mediaFiles}
          adminUserId={adminUserId}
          onLogout={handleAdminLogout}
          onBackToPublic={() => setCurrentTab('home')}
          onCreateDoc={handleCreateDocument}
          onUpdateDoc={handleUpdateDocument}
          onTogglePublishDoc={handleTogglePublish}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteDoc={handleDeleteDocument}
          onUpdateHomeContent={handleUpdateHomeContent}
          onUpdateNavItems={handleUpdateNavItems}
          onUpdateAboutContent={handleUpdateAboutContent}
          onUpdateContact={handleUpdateContact}
          onUpdateFooterContent={handleUpdateFooterContent}
          onUpdateSiteSettings={handleUpdateSiteSettings}
          onUploadMedia={handleUploadMedia}
          onDeleteMedia={handleDeleteMedia}
          onReplaceMedia={handleReplaceMedia}
          onRefreshData={async () => {
            await Promise.all([loadPublicData(), loadAdminSpecificData()]);
          }}
        />
      ) : currentTab === 'admin' && !isAdminAuthenticated ? (
        /* If user is trying to access admin without credentials, show login */
        <div className="min-h-screen flex flex-col">
          <Header
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            isAdmin={isAdminAuthenticated}
            adminUserId={adminUserId}
            onAdminLogout={handleAdminLogout}
            settings={siteSettings}
            navItems={navItems}
          />
          <main className="flex-1 flex items-center justify-center">
            <AdminLoginView
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
                setCurrentTab('admin');
              }}
              onBackToPublic={() => setCurrentTab('home')}
              onLogin={handleAdminLogin}
            />
          </main>
          <Footer
            onNavigate={setCurrentTab}
            isAdmin={isAdminAuthenticated}
            footerContent={footerContent}
          />
        </div>
      ) : (
        /* Public Website Views */
        <>
          <Header
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            isAdmin={isAdminAuthenticated}
            adminUserId={adminUserId}
            onAdminLogout={handleAdminLogout}
            settings={siteSettings}
            navItems={navItems}
          />

          <main className="flex-1">
            {currentTab === 'home' && (
              <HomeView
                notifications={notifications}
                circulars={circulars}
                orders={orders}
                results={results}
                onNavigate={setCurrentTab}
                onViewDoc={setActiveViewerDoc}
                homeContent={homeContent}
              />
            )}

            {currentTab === 'public-circular' && (
              <PublicCircularView
                notifications={notifications}
                circulars={circulars}
                orders={orders}
                onViewDoc={setActiveViewerDoc}
                initialSubsection="notifications"
              />
            )}

            {currentTab === 'notifications' && (
              <PublicCircularView
                notifications={notifications}
                circulars={circulars}
                orders={orders}
                onViewDoc={setActiveViewerDoc}
                initialSubsection="notifications"
              />
            )}

            {currentTab === 'circulars' && (
              <PublicCircularView
                notifications={notifications}
                circulars={circulars}
                orders={orders}
                onViewDoc={setActiveViewerDoc}
                initialSubsection="circulars"
              />
            )}

            {currentTab === 'orders' && (
              <PublicCircularView
                notifications={notifications}
                circulars={circulars}
                orders={orders}
                onViewDoc={setActiveViewerDoc}
                initialSubsection="orders"
              />
            )}

            {(currentTab === 'results' || currentTab === 'result') && (
              <ResultsView
                results={results}
                onViewDoc={setActiveViewerDoc}
              />
            )}

            {currentTab === 'about' && (
              <AboutView
                aboutContent={aboutContent}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'contact' && (
              <ContactView
                contactInfo={contactInfo}
                isAdmin={isAdminAuthenticated}
                onNavigateToAdmin={() => setCurrentTab('admin')}
              />
            )}
          </main>

          <Footer
            onNavigate={setCurrentTab}
            isAdmin={isAdminAuthenticated}
            footerContent={footerContent}
          />
        </>
      )}

      {/* Global Document Viewer Modal for public views */}
      <DocumentViewerModal
        document={activeViewerDoc}
        onClose={() => setActiveViewerDoc(null)}
      />
    </div>
  );
}
