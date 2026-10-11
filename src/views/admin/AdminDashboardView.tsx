import React, { useState, useEffect } from 'react';
import {
  Bell,
  ScrollText,
  FileText,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
  LogOut,
  ExternalLink,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  FileUp,
  RefreshCw,
  LayoutDashboard,
  Home,
  Menu,
  BookOpen,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Globe,
  FileX,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  Layers,
  FolderOpen,
  User,
  ShieldCheck,
  Clock,
  Filter,
  CheckSquare,
  Sparkles,
  Award,
} from 'lucide-react';
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
} from '../../types.ts';
import { DocumentFormModal } from '../../components/DocumentFormModal.tsx';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.tsx';
import { DocumentViewerModal } from '../../components/DocumentViewerModal.tsx';

interface AdminDashboardViewProps {
  stats: AdminStats;
  notifications: InstitutionalDocument[];
  circulars: InstitutionalDocument[];
  orders: InstitutionalDocument[];
  results?: InstitutionalDocument[];
  contactInfo: ContactInfo;
  homeContent: HomeContent;
  navItems: NavItem[];
  aboutContent: AboutContent;
  footerContent: FooterContent;
  siteSettings: SiteSettings;
  mediaFiles: MediaFileItem[];
  adminUserId?: string | null;
  onLogout: () => void;
  onBackToPublic: () => void;
  onCreateDoc: (section: DocumentSectionType, formData: FormData) => Promise<void>;
  onUpdateDoc: (section: DocumentSectionType, id: string, formData: FormData) => Promise<void>;
  onTogglePublishDoc: (section: DocumentSectionType, id: string) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: string) => Promise<void>;
  onDeleteDoc: (section: DocumentSectionType, id: string) => Promise<void>;
  onUpdateHomeContent: (data: Partial<HomeContent>) => Promise<void>;
  onUpdateNavItems: (items: NavItem[]) => Promise<void>;
  onUpdateAboutContent: (data: Partial<AboutContent>) => Promise<void>;
  onUpdateContact: (data: Partial<ContactInfo>) => Promise<void>;
  onUpdateFooterContent: (data: Partial<FooterContent>) => Promise<void>;
  onUpdateSiteSettings: (data: Partial<SiteSettings>) => Promise<void>;
  onUploadMedia: (files: File[]) => Promise<void>;
  onDeleteMedia: (filename: string) => Promise<void>;
  onReplaceMedia: (filename: string, file: File) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  notifications,
  circulars,
  orders,
  results = [],
  contactInfo,
  homeContent,
  navItems,
  aboutContent,
  footerContent,
  siteSettings,
  mediaFiles,
  adminUserId,
  onLogout,
  onBackToPublic,
  onCreateDoc,
  onUpdateDoc,
  onTogglePublishDoc,
  onUpdateOrderStatus,
  onDeleteDoc,
  onUpdateHomeContent,
  onUpdateNavItems,
  onUpdateAboutContent,
  onUpdateContact,
  onUpdateFooterContent,
  onUpdateSiteSettings,
  onUploadMedia,
  onDeleteMedia,
  onReplaceMedia,
  onRefreshData,
}) => {
  type AdminTabType =
    | 'overview'
    | 'home'
    | 'about'
    | 'nav'
    | 'notifications'
    | 'circulars'
    | 'documents'
    | 'orders'
    | 'results'
    | 'media'
    | 'contact'
    | 'footer'
    | 'settings'
    | 'profile';

  const [adminTab, setAdminTab] = useState<AdminTabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Global success & error banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  // Modal states for documents
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DocumentSectionType>('notifications');
  const [editingItem, setEditingItem] = useState<InstitutionalDocument | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InstitutionalDocument | null>(null);
  const [deleteSection, setDeleteSection] = useState<DocumentSectionType>('notifications');
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Delete modal
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  // Document viewer state
  const [viewingDoc, setViewingDoc] = useState<InstitutionalDocument | null>(null);

  // Documents tab filters
  const [docFilterSection, setDocFilterSection] = useState<'all' | 'notifications' | 'circulars' | 'orders' | 'results'>('all');
  const [docFilterPublish, setDocFilterPublish] = useState<'all' | 'published' | 'draft'>('all');

  // Media tab filter & view mode
  const [mediaFilterType, setMediaFilterType] = useState<'all' | 'images' | 'documents'>('all');
  const [mediaViewMode, setMediaViewMode] = useState<'grid' | 'table'>('grid');

  // --- Local Form States ---
  const [homeForm, setHomeForm] = useState<HomeContent>(homeContent);
  const [isSavingHome, setIsSavingHome] = useState(false);

  const [navList, setNavList] = useState<NavItem[]>(navItems);
  const [isSavingNav, setIsSavingNav] = useState(false);

  const [aboutForm, setAboutForm] = useState<AboutContent>(aboutContent);
  const [isSavingAbout, setIsSavingAbout] = useState(false);

  const [contactForm, setContactForm] = useState<ContactInfo>(contactInfo);
  const [isSavingContact, setIsSavingContact] = useState(false);

  const [footerForm, setFooterForm] = useState<FooterContent>(footerContent);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sync state when props change
  useEffect(() => { setHomeForm(homeContent); }, [homeContent]);
  useEffect(() => { setNavList(navItems); }, [navItems]);
  useEffect(() => { setAboutForm(aboutContent); }, [aboutContent]);
  useEffect(() => { setContactForm(contactInfo); }, [contactInfo]);
  useEffect(() => { setFooterForm(footerContent); }, [footerContent]);
  useEffect(() => { setSettingsForm(siteSettings); }, [siteSettings]);

  // Handlers for Document Add/Edit/Publish
  const handleOpenAdd = (section: DocumentSectionType) => {
    setActiveSection(section);
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (section: DocumentSectionType, item: InstitutionalDocument) => {
    setActiveSection(section);
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await onUpdateDoc(activeSection, editingItem.id, formData);
        showSuccess(`${getSectionLabel(activeSection)} updated successfully.`);
      } else {
        await onCreateDoc(activeSection, formData);
        showSuccess(`${getSectionLabel(activeSection)} published successfully.`);
      }
      setIsFormModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      showError(err.message || 'Action failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (section: DocumentSectionType, item: InstitutionalDocument) => {
    setDeleteSection(section);
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteDoc(deleteSection, itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      showSuccess(`${getSectionLabel(deleteSection)} deleted successfully.`);
    } catch (err: any) {
      showError(err.message || 'Delete operation failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (section: DocumentSectionType, item: InstitutionalDocument) => {
    try {
      await onTogglePublishDoc(section, item.id);
      showSuccess(
        `${getSectionLabel(section)} ${item.isPublished !== false ? 'unpublished to draft' : 'published to public'}.`
      );
    } catch (err: any) {
      showError(err.message || 'Failed to toggle publication status');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await onUpdateOrderStatus(orderId, newStatus);
      showSuccess(`Order status updated to ${newStatus}.`);
    } catch (err: any) {
      showError(err.message || 'Failed to update order status');
    }
  };

  // Section label helper
  const getSectionLabel = (type: DocumentSectionType) => {
    if (type === 'notifications') return 'Notification';
    if (type === 'circulars') return 'Circular';
    if (type === 'orders') return 'Order';
    return 'Result';
  };

  // Filter items for current list tab
  const getFilteredItems = (items: InstitutionalDocument[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.number.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
    );
  };

  // Copy URL helper
  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Media upload handler
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      try {
        await onUploadMedia(files);
        showSuccess(`${files.length} file(s) uploaded to media library.`);
      } catch (err: any) {
        showError(err.message || 'Media upload failed');
      }
    }
  };

  const handleMediaDeleteConfirm = async () => {
    if (!mediaToDelete) return;
    setIsDeletingMedia(true);
    try {
      await onDeleteMedia(mediaToDelete);
      setMediaToDelete(null);
      showSuccess('Media file deleted from storage.');
    } catch (err: any) {
      showError(err.message || 'Failed to delete media file');
    } finally {
      setIsDeletingMedia(false);
    }
  };

  // Navigation menu item helpers
  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navList.length) return;
    const newItems = [...navList];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    newItems.forEach((it, idx) => (it.order = idx + 1));
    setNavList(newItems);
  };

  const handleAddNavItem = () => {
    const newId = `nav_${Date.now()}`;
    const newItem: NavItem = {
      id: newId,
      label: 'New Link',
      target: 'home',
      isExternal: false,
      order: navList.length + 1,
      enabled: true,
    };
    setNavList([...navList, newItem]);
  };

  const handleRemoveNavItem = (id: string) => {
    const updated = navList.filter((it) => it.id !== id).map((it, idx) => ({ ...it, order: idx + 1 }));
    setNavList(updated);
  };

  // Unified all documents list
  const allDocumentsList: Array<{ item: InstitutionalDocument; section: DocumentSectionType }> = [
    ...notifications.map((item) => ({ item, section: 'notifications' as DocumentSectionType })),
    ...circulars.map((item) => ({ item, section: 'circulars' as DocumentSectionType })),
    ...orders.map((item) => ({ item, section: 'orders' as DocumentSectionType })),
    ...results.map((item) => ({ item, section: 'results' as DocumentSectionType })),
  ].sort((a, b) => new Date(b.item.date).getTime() - new Date(a.item.date).getTime());

  const filteredUnifiedDocs = allDocumentsList.filter(({ item, section }) => {
    if (docFilterSection !== 'all' && section !== docFilterSection) return false;
    if (docFilterPublish === 'published' && item.isPublished === false) return false;
    if (docFilterPublish === 'draft' && item.isPublished !== false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.number.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-[#0F172A]">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#1E3A8A] text-white border-r border-blue-900 flex flex-col shrink-0 select-none">
        {/* Sidebar Brand Lockup */}
        <div className="p-5 border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2563EB] rounded-lg text-white shadow-xs">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">
                Administrative CMS
              </div>
              <div className="text-[11px] text-blue-200">
                User: <span className="text-amber-300 font-mono font-bold">{adminUserId || 'Authorized'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Tabs Menu */}
        <nav className="p-3 space-y-1 text-xs font-semibold flex-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-blue-300 px-3 py-1">
            General
          </div>

          <button
            onClick={() => setAdminTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'overview'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-200" />
            <span>Dashboard Overview</span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-blue-300 px-3 pt-3 py-1">
            Document Repository
          </div>

          <button
            onClick={() => setAdminTab('documents')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'documents'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4 text-blue-200" />
              <span>All Documents</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-950/60 text-[#38BDF8] rounded">
              {allDocumentsList.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('notifications')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'notifications'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-blue-200" />
              <span>Notifications</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-950/60 text-[#38BDF8] rounded">
              {stats.totalNotifications}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('circulars')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'circulars'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ScrollText className="w-4 h-4 text-blue-200" />
              <span>Circulars</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-950/60 text-[#38BDF8] rounded">
              {stats.totalCirculars}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'orders'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Orders / Records</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-950/60 text-[#38BDF8] rounded">
              {stats.totalOrders}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('results')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'results'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-blue-200" />
              <span>Results & Merit</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-950/60 text-[#38BDF8] rounded">
              {stats.totalResults ?? results.length}
            </span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-blue-300 px-3 pt-3 py-1">
            Website Content & Pages
          </div>

          <button
            onClick={() => setAdminTab('home')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'home'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <Home className="w-4 h-4 text-blue-200" />
            <span>Home Page Content</span>
          </button>

          <button
            onClick={() => setAdminTab('nav')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'nav'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <Menu className="w-4 h-4 text-blue-200" />
            <span>Navigation Menu</span>
          </button>

          <button
            onClick={() => setAdminTab('about')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'about'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-200" />
            <span>About Page Content</span>
          </button>

          <button
            onClick={() => setAdminTab('contact')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'contact'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <Mail className="w-4 h-4 text-blue-200" />
            <span>Contact Directory</span>
          </button>

          <button
            onClick={() => setAdminTab('footer')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'footer'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-200" />
            <span>Footer & Legal Notice</span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-blue-300 px-3 pt-3 py-1">
            Media, System & Profile
          </div>

          <button
            onClick={() => setAdminTab('media')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'media'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-blue-200" />
              <span>Media Library</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-950/60 text-[#38BDF8] rounded">
              {mediaFiles.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'settings'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-blue-200" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setAdminTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
              adminTab === 'profile'
                ? 'bg-[#2563EB] text-white font-bold border-l-4 border-l-[#38BDF8]'
                : 'text-blue-100/80 hover:text-white hover:bg-[#2563EB]/40'
            }`}
          >
            <User className="w-4 h-4 text-amber-300" />
            <span>Admin Profile</span>
          </button>
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-blue-900 space-y-1">
          <button
            onClick={onBackToPublic}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-100 hover:text-white hover:bg-[#2563EB] rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-300 hover:text-white hover:bg-red-900/60 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({adminUserId || 'Admin'})</span>
          </button>
        </div>
      </aside>

      {/* Main Admin CMS Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl overflow-y-auto">
        {/* Success / Error Alerts */}
        {successBanner && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
        )}
        {errorBanner && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-900 text-xs rounded-lg flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-[#E2E8F0] bg-white p-5 rounded-xl border shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#1E3A8A]">
              Department of Education · AKA Home
            </h1>
            <p className="text-xs text-[#0F172A]/70 font-semibold mt-0.5">
              Full Institutional Content Management System (CMS) · Theme: Royal Blue + White + Soft Sky Blue
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onRefreshData()}
              title="Refresh database state"
              className="p-2 text-[#1E3A8A] hover:bg-[#F8FAFC] bg-white border border-[#E2E8F0] rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenAdd('notifications')}
              className="px-3 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Notification</span>
            </button>
            <button
              onClick={() => handleOpenAdd('circulars')}
              className="px-3 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Circular</span>
            </button>
            <button
              onClick={() => handleOpenAdd('orders')}
              className="px-3 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Order</span>
            </button>
            <button
              onClick={() => handleOpenAdd('results')}
              className="px-3 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Result</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW / DASHBOARD */}
        {adminTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                    Notifications
                  </span>
                  <div className="p-1.5 bg-[#F8FAFC] rounded-lg text-[#2563EB]">
                    <Bell className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#1E3A8A]">
                  {stats.totalNotifications}
                </div>
                <div className="text-[11px] text-[#0F172A]/60 mt-1 font-medium">
                  {stats.publishedNotifications ?? stats.totalNotifications} published · {stats.draftNotifications ?? 0} drafts
                </div>
                <button
                  onClick={() => setAdminTab('notifications')}
                  className="mt-3 text-xs text-[#2563EB] hover:text-[#1E3A8A] font-bold underline cursor-pointer block"
                >
                  Manage notifications →
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                    Circulars
                  </span>
                  <div className="p-1.5 bg-[#F8FAFC] rounded-lg text-[#2563EB]">
                    <ScrollText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#1E3A8A]">
                  {stats.totalCirculars}
                </div>
                <div className="text-[11px] text-[#0F172A]/60 mt-1 font-medium">
                  {stats.publishedCirculars ?? stats.totalCirculars} published · {stats.draftCirculars ?? 0} drafts
                </div>
                <button
                  onClick={() => setAdminTab('circulars')}
                  className="mt-3 text-xs text-[#2563EB] hover:text-[#1E3A8A] font-bold underline cursor-pointer block"
                >
                  Manage circulars →
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                    Executive Orders
                  </span>
                  <div className="p-1.5 bg-[#F8FAFC] rounded-lg text-[#2563EB]">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#1E3A8A]">
                  {stats.totalOrders}
                </div>
                <div className="text-[11px] text-[#0F172A]/60 mt-1 font-medium">
                  {stats.publishedOrders ?? stats.totalOrders} published · {stats.draftOrders ?? 0} drafts
                </div>
                <button
                  onClick={() => setAdminTab('orders')}
                  className="mt-3 text-xs text-[#2563EB] hover:text-[#1E3A8A] font-bold underline cursor-pointer block"
                >
                  Manage orders →
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                    Results & Merit
                  </span>
                  <div className="p-1.5 bg-[#F8FAFC] rounded-lg text-[#2563EB]">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#1E3A8A]">
                  {stats.totalResults ?? results.length}
                </div>
                <div className="text-[11px] text-[#0F172A]/60 mt-1 font-medium">
                  {stats.publishedResults ?? results.length} published · {stats.draftResults ?? 0} drafts
                </div>
                <button
                  onClick={() => setAdminTab('results')}
                  className="mt-3 text-xs text-[#2563EB] hover:text-[#1E3A8A] font-bold underline cursor-pointer block"
                >
                  Manage results →
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                    Media Library
                  </span>
                  <div className="p-1.5 bg-[#F8FAFC] rounded-lg text-[#2563EB]">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-[#1E3A8A]">
                  {mediaFiles.length}
                </div>
                <div className="text-[11px] text-[#0F172A]/60 mt-1 font-medium">
                  Uploaded files & document attachments
                </div>
                <button
                  onClick={() => setAdminTab('media')}
                  className="mt-3 text-xs text-[#2563EB] hover:text-[#1E3A8A] font-bold underline cursor-pointer block"
                >
                  Manage media library →
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E3A8A] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <span>Quick Actions & Short-cuts</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => handleOpenAdd('notifications')}
                  className="p-3 text-center border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <Bell className="w-5 h-5 text-[#2563EB] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-[#1E3A8A]">New Notification</div>
                </button>
                <button
                  onClick={() => handleOpenAdd('circulars')}
                  className="p-3 text-center border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <ScrollText className="w-5 h-5 text-[#2563EB] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-[#1E3A8A]">New Circular</div>
                </button>
                <button
                  onClick={() => handleOpenAdd('orders')}
                  className="p-3 text-center border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <FileText className="w-5 h-5 text-[#2563EB] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-[#1E3A8A]">New Order</div>
                </button>
                <button
                  onClick={() => setAdminTab('home')}
                  className="p-3 text-center border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <Home className="w-5 h-5 text-[#2563EB] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-[#1E3A8A]">Edit Homepage</div>
                </button>
                <button
                  onClick={() => setAdminTab('media')}
                  className="p-3 text-center border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <FileUp className="w-5 h-5 text-[#2563EB] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-[#1E3A8A]">Upload Media</div>
                </button>
                <button
                  onClick={() => setAdminTab('settings')}
                  className="p-3 text-center border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <SettingsIcon className="w-5 h-5 text-[#2563EB] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-[#1E3A8A]">Site Settings</div>
                </button>
              </div>
            </div>

            {/* System & Deployment Status Card */}
            <div className="bg-[#1E3A8A] text-white rounded-xl p-6 border border-blue-900 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                      System Status: Operational & Ready
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-serif text-white">
                    Node.js & Express Production Backend
                  </h3>
                  <p className="text-xs text-blue-100/80 mt-1 max-w-xl">
                    Deployed architecture supports GitHub → Render → Node.js/Express. File uploads are persisted to <code className="bg-[#2563EB] px-1.5 py-0.5 rounded text-amber-300">/uploads</code> and database state is kept in <code className="bg-[#2563EB] px-1.5 py-0.5 rounded text-amber-300">/data/db.json</code>.
                  </p>
                </div>
                <div className="bg-[#2563EB] p-4 rounded-xl border border-[#2563EB] text-xs space-y-1.5 min-w-[220px]">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Session User:</span>
                    <span className="font-bold text-amber-300">{adminUserId || 'Authorized'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Theme Palette:</span>
                    <span className="font-bold text-white">Royal Blue + White + Soft Sky Blue</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Total Records:</span>
                    <span className="font-bold text-white">{allDocumentsList.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Items Preview */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0]">
                <h2 className="text-base font-bold font-serif text-[#1E3A8A]">
                  Recent Document Activities
                </h2>
                <button
                  onClick={() => setAdminTab('documents')}
                  className="text-xs font-bold text-[#2563EB] hover:text-[#1E3A8A] underline cursor-pointer"
                >
                  View full repository ({allDocumentsList.length}) →
                </button>
              </div>

              {allDocumentsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#0F172A]/60">
                  No documents in repository yet. Use the buttons above to publish your first notification, circular, or order.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {allDocumentsList.slice(0, 6).map(({ item, section }) => (
                    <div key={item.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          section === 'notifications'
                            ? 'bg-blue-100 text-[#1E3A8A]'
                            : section === 'circulars'
                            ? 'bg-indigo-100 text-[#2563EB]'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {getSectionLabel(section)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-[#1E3A8A] truncate max-w-md">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#0F172A]/60 flex items-center gap-2">
                            <span className="font-mono text-[#2563EB]">{item.number}</span>
                            <span>·</span>
                            <span>{item.date}</span>
                            {item.document && (
                              <>
                                <span>·</span>
                                <span className="text-[#2563EB] font-semibold">{item.document.originalName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.document && (
                          <button
                            onClick={() => setViewingDoc(item)}
                            className="p-1.5 text-[#2563EB] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(section, item)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#1E3A8A] bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CENTRAL DOCUMENTS REPOSITORY */}
        {adminTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Centralized Document Repository
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Unified catalog of all notifications, circulars, and executive orders published by Department of Education, AKA Home.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenAdd('notifications')}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Notification
                  </button>
                  <button
                    onClick={() => handleOpenAdd('circulars')}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Circular
                  </button>
                  <button
                    onClick={() => handleOpenAdd('orders')}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Order
                  </button>
                  <button
                    onClick={() => handleOpenAdd('results')}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Result
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl mb-6">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ref no, title or text..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#1E3A8A]">Category:</span>
                    <select
                      value={docFilterSection}
                      onChange={(e) => setDocFilterSection(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium"
                    >
                      <option value="all">All Categories</option>
                      <option value="notifications">Notifications Only</option>
                      <option value="circulars">Circulars Only</option>
                      <option value="orders">Orders Only</option>
                      <option value="results">Results Only</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#1E3A8A]">Status:</span>
                    <select
                      value={docFilterPublish}
                      onChange={(e) => setDocFilterPublish(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium"
                    >
                      <option value="all">All States</option>
                      <option value="published">Published Only</option>
                      <option value="draft">Drafts Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              {filteredUnifiedDocs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#0F172A]/60">
                  No documents found matching the filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#1E3A8A] uppercase font-bold tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">Type</th>
                        <th className="p-3">Ref Number</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Attachment</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredUnifiedDocs.map(({ item, section }) => (
                        <tr key={item.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              section === 'notifications'
                                ? 'bg-blue-100 text-[#1E3A8A]'
                                : section === 'circulars'
                                ? 'bg-indigo-100 text-[#2563EB]'
                                : section === 'orders'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-purple-100 text-purple-900'
                            }`}>
                              {getSectionLabel(section)}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#2563EB]">
                            {item.number}
                          </td>
                          <td className="p-3 font-semibold text-[#1E3A8A] max-w-xs truncate">
                            {item.title}
                          </td>
                          <td className="p-3 text-[#0F172A]/70">
                            {item.date}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.isPublished !== false
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {item.isPublished !== false ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-3">
                            {item.document ? (
                              <div className="flex items-center gap-1.5 text-[#2563EB] font-semibold">
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[120px]">{item.document.originalName}</span>
                              </div>
                            ) : (
                              <span className="text-[#0F172A]/40 italic">None</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            {item.document && (
                              <button
                                onClick={() => setViewingDoc(item)}
                                className="p-1.5 text-[#2563EB] hover:bg-white border border-[#E2E8F0] rounded cursor-pointer"
                                title="View Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleTogglePublish(section, item)}
                              className="p-1.5 text-[#2563EB] hover:bg-white border border-[#E2E8F0] rounded cursor-pointer"
                              title={item.isPublished !== false ? 'Unpublish' : 'Publish'}
                            >
                              {item.isPublished !== false ? <FileX className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(section, item)}
                              className="p-1.5 text-[#1E3A8A] hover:bg-white border border-[#E2E8F0] rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(section, item)}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {adminTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Notifications Management
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Publish public notifications, announcements, and official bulletins.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd('notifications')}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Add Notification</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notifications by title or number..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* List */}
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#0F172A]/60">
                  No notifications recorded yet. Click &quot;Add Notification&quot; to publish your first announcement.
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredItems(notifications).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:border-[#2563EB] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span className="font-mono font-bold text-[#2563EB]">{item.number}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className="text-[#0F172A]/60">{item.date}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            item.isPublished !== false
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.isPublished !== false ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1E3A8A]">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-[#0F172A]/70 mt-1 line-clamp-2 max-w-2xl">
                            {item.description}
                          </p>
                        )}
                        {item.document && (
                          <div className="text-[11px] text-[#2563EB] font-semibold mt-1 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{item.document.originalName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {item.document && (
                          <button
                            onClick={() => setViewingDoc(item)}
                            className="p-1.5 text-[#2563EB] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePublish('notifications', item)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                          title={item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        >
                          {item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit('notifications', item)}
                          className="p-1.5 text-[#1E3A8A] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete('notifications', item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CIRCULARS */}
        {adminTab === 'circulars' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Circulars Management
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Publish administrative circulars, guidelines, and advisory memoranda.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd('circulars')}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Add Circular</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search circulars by subject or number..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* List */}
              {circulars.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#0F172A]/60">
                  No circulars recorded yet. Click &quot;Add Circular&quot; to publish your first administrative circular.
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredItems(circulars).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:border-[#2563EB] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span className="font-mono font-bold text-[#2563EB]">{item.number}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className="text-[#0F172A]/60">{item.date}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            item.isPublished !== false
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.isPublished !== false ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1E3A8A]">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-[#0F172A]/70 mt-1 line-clamp-2 max-w-2xl">
                            {item.description}
                          </p>
                        )}
                        {item.document && (
                          <div className="text-[11px] text-[#2563EB] font-semibold mt-1 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{item.document.originalName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {item.document && (
                          <button
                            onClick={() => setViewingDoc(item)}
                            className="p-1.5 text-[#2563EB] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePublish('circulars', item)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                          title={item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        >
                          {item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit('circulars', item)}
                          className="p-1.5 text-[#1E3A8A] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete('circulars', item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS / RECORDS */}
        {adminTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Executive Orders & Records Management
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Track executive directives, institutional orders, determinations, and status workflows.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd('orders')}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Add Order</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders by number, title, or status..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* List */}
              {orders.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#0F172A]/60">
                  No executive orders recorded yet. Click &quot;Add Order&quot; to issue your first record.
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredItems(orders).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:border-[#2563EB] transition-colors"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                          <span className="font-mono font-bold text-[#2563EB]">{item.number}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className="text-[#0F172A]/60">{item.date}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            item.isPublished !== false
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.isPublished !== false ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1E3A8A]">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-[#0F172A]/70 mt-1 line-clamp-2 max-w-2xl">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[11px] font-bold text-[#1E3A8A]">Status:</span>
                          <select
                            value={item.status || 'Active'}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="text-xs px-2 py-0.5 border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#0F172A] font-semibold"
                          >
                            <option value="Active">Active</option>
                            <option value="In Review">In Review</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                            <option value="Superseded">Superseded</option>
                            <option value="Draft">Draft</option>
                          </select>
                          {item.document && (
                            <span className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{item.document.originalName}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {item.document && (
                          <button
                            onClick={() => setViewingDoc(item)}
                            className="p-1.5 text-[#2563EB] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePublish('orders', item)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                          title={item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        >
                          {item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit('orders', item)}
                          className="p-1.5 text-[#1E3A8A] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete('orders', item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5B: RESULTS MANAGEMENT */}
        {adminTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Examination & Recruitment Results Management
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Publish, update, and manage official scorecards, merit lists, candidate selections, and examination outcomes.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd('results')}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Add Result</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search results by number, title, category, or status..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* List */}
              {results.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#0F172A]/60">
                  No examination results recorded yet. Click &quot;Add Result&quot; to publish your first examination or recruitment result.
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredItems(results).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:border-[#2563EB] transition-colors"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                          <span className="font-mono font-bold text-[#2563EB]">{item.number}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className="text-[#0F172A]/60">{item.date}</span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className="text-xs px-2 py-0.2 rounded font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                            {item.category || 'Examination'}
                          </span>
                          <span className="text-[#E2E8F0]">·</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            item.isPublished !== false
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.isPublished !== false ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1E3A8A]">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-[#0F172A]/70 mt-1 line-clamp-2 max-w-2xl">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[11px] font-bold text-[#1E3A8A]">Status:</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-semibold">
                            {item.status || 'Declared'}
                          </span>
                          {item.document && (
                            <span className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{item.document.originalName}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {item.document && (
                          <button
                            onClick={() => setViewingDoc(item)}
                            className="p-1.5 text-[#2563EB] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePublish('results', item)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                          title={item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        >
                          {item.isPublished !== false ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit('results', item)}
                          className="p-1.5 text-[#1E3A8A] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete('results', item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: HOME PAGE EDITOR */}
        {adminTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Home Page Content Editor
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Customize titles, hero heading, descriptions, buttons, announcement banner, and statistics.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setIsSavingHome(true);
                    try {
                      await onUpdateHomeContent(homeForm);
                      showSuccess('Home page content updated and live on website.');
                    } catch (err: any) {
                      showError(err.message || 'Failed to save home content');
                    } finally {
                      setIsSavingHome(false);
                    }
                  }}
                  disabled={isSavingHome}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {isSavingHome ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>

              {/* Basic brand title & subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Website Title
                  </label>
                  <input
                    type="text"
                    value={homeForm.websiteTitle}
                    onChange={(e) => setHomeForm({ ...homeForm, websiteTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Subtitle / Repository Label
                  </label>
                  <input
                    type="text"
                    value={homeForm.subtitle}
                    onChange={(e) => setHomeForm({ ...homeForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Hero Banner Section */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Hero Banner Presentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                      Kicker Text
                    </label>
                    <input
                      type="text"
                      value={homeForm.heroKicker}
                      onChange={(e) => setHomeForm({ ...homeForm, heroKicker: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                      Hero Heading
                    </label>
                    <input
                      type="text"
                      value={homeForm.heroHeading}
                      onChange={(e) => setHomeForm({ ...homeForm, heroHeading: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                      Hero Subtitle (Italic)
                    </label>
                    <input
                      type="text"
                      value={homeForm.heroSubtitle}
                      onChange={(e) => setHomeForm({ ...homeForm, heroSubtitle: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                    Hero Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={homeForm.heroDescription}
                    onChange={(e) => setHomeForm({ ...homeForm, heroDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                  />
                </div>

                {/* Hero Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg space-y-2">
                    <span className="text-[11px] font-bold text-[#1E3A8A]">Primary Button</span>
                    <input
                      type="text"
                      placeholder="Button Label"
                      value={homeForm.heroButtons?.primaryText || ''}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          heroButtons: { ...homeForm.heroButtons, primaryText: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded"
                    />
                    <input
                      type="text"
                      placeholder="Target Tab (e.g. notifications)"
                      value={homeForm.heroButtons?.primaryTarget || ''}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          heroButtons: { ...homeForm.heroButtons, primaryTarget: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded"
                    />
                  </div>

                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg space-y-2">
                    <span className="text-[11px] font-bold text-[#1E3A8A]">Secondary Button</span>
                    <input
                      type="text"
                      placeholder="Button Label"
                      value={homeForm.heroButtons?.secondaryText || ''}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          heroButtons: { ...homeForm.heroButtons, secondaryText: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded"
                    />
                    <input
                      type="text"
                      placeholder="Target Tab (e.g. circulars)"
                      value={homeForm.heroButtons?.secondaryTarget || ''}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          heroButtons: { ...homeForm.heroButtons, secondaryTarget: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded"
                    />
                  </div>
                </div>

                {/* Hero Image URL */}
                <div>
                  <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                    Optional Hero Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={homeForm.heroImageUrl || ''}
                      onChange={(e) => setHomeForm({ ...homeForm, heroImageUrl: e.target.value })}
                      placeholder="e.g. /api/documents/banner_123.jpg or https://..."
                      className="flex-1 px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                    />
                    {mediaFiles.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setHomeForm({ ...homeForm, heroImageUrl: e.target.value });
                          }
                        }}
                        className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                      >
                        <option value="">Pick from Media...</option>
                        {mediaFiles.filter(m => m.isImage).map((m, idx) => (
                          <option key={idx} value={m.url}>
                            {m.originalName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Welcome / Institutional Directives Box
                </h3>
                <div>
                  <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                    Welcome Heading
                  </label>
                  <input
                    type="text"
                    value={homeForm.welcomeHeading}
                    onChange={(e) => setHomeForm({ ...homeForm, welcomeHeading: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                    Welcome Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={homeForm.welcomeText}
                    onChange={(e) => setHomeForm({ ...homeForm, welcomeText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Homepage Notice Banner
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={homeForm.noticeBanner?.enabled || false}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          noticeBanner: {
                            ...homeForm.noticeBanner,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#2563EB]"
                    />
                    <span>Enable Announcement Banner</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={homeForm.noticeBanner?.badgeText || ''}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          noticeBanner: { ...homeForm.noticeBanner, badgeText: e.target.value },
                        })
                      }
                      placeholder="e.g. NOTICE"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">Announcement Message</label>
                    <input
                      type="text"
                      value={homeForm.noticeBanner?.message || ''}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          noticeBanner: { ...homeForm.noticeBanner, message: e.target.value },
                        })
                      }
                      placeholder="Official announcement message displayed at top of homepage..."
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">Link Target</label>
                    <input
                      type="text"
                      value={homeForm.noticeBanner?.linkTarget || ''}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          noticeBanner: { ...homeForm.noticeBanner, linkTarget: e.target.value },
                        })
                      }
                      placeholder="e.g. notifications"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics Counters */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Key Institutional Statistics & Counters
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newStat = {
                        id: `stat_${Date.now()}`,
                        label: 'New Counter',
                        value: '100+',
                        isCustom: true,
                        enabled: true,
                      };
                      setHomeForm({
                        ...homeForm,
                        stats: [...(homeForm.stats || []), newStat],
                      });
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-[#1E3A8A] bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    + Add Counter
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(homeForm.stats || []).map((st, idx) => (
                    <div key={st.id || idx} className="p-3 bg-white border border-[#E2E8F0] rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={st.enabled}
                            onChange={(e) => {
                              const updated = [...homeForm.stats];
                              updated[idx].enabled = e.target.checked;
                              setHomeForm({ ...homeForm, stats: updated });
                            }}
                            className="accent-[#2563EB]"
                          />
                          <span>Visible</span>
                        </label>
                        {st.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = homeForm.stats.filter((_, i) => i !== idx);
                              setHomeForm({ ...homeForm, stats: updated });
                            }}
                            className="text-red-600 hover:text-red-800 text-[11px] font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => {
                          const updated = [...homeForm.stats];
                          updated[idx].value = e.target.value;
                          setHomeForm({ ...homeForm, stats: updated });
                        }}
                        placeholder="Counter Value"
                        className="w-full px-2 py-1 text-xs font-mono font-bold border border-[#E2E8F0] rounded text-[#1E3A8A]"
                      />
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => {
                          const updated = [...homeForm.stats];
                          updated[idx].label = e.target.value;
                          setHomeForm({ ...homeForm, stats: updated });
                        }}
                        placeholder="Counter Label"
                        className="w-full px-2 py-1 text-[11px] border border-[#E2E8F0] rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ABOUT PAGE EDITOR */}
        {adminTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    About Page Content Editor
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Manage institutional charter, mission, vision, values, and responsibilities.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setIsSavingAbout(true);
                    try {
                      await onUpdateAboutContent(aboutForm);
                      showSuccess('About page content updated.');
                    } catch (err: any) {
                      showError(err.message || 'Failed to update about content');
                    } finally {
                      setIsSavingAbout(false);
                    }
                  }}
                  disabled={isSavingAbout}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSavingAbout ? 'Saving...' : 'Save About Page'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={aboutForm.heading}
                    onChange={(e) => setAboutForm({ ...aboutForm, heading: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={aboutForm.subtitle}
                    onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                  Institutional Mandate / Description
                </label>
                <textarea
                  rows={4}
                  value={aboutForm.description}
                  onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    value={aboutForm.mission}
                    onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Vision Statement
                  </label>
                  <textarea
                    rows={3}
                    value={aboutForm.vision}
                    onChange={(e) => setAboutForm({ ...aboutForm, vision: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              {/* Core Values */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Institutional Core Values
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setAboutForm({
                        ...aboutForm,
                        coreValues: [
                          ...aboutForm.coreValues,
                          { title: 'New Core Value', description: 'Description of the institutional value.' },
                        ],
                      });
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-[#1E3A8A] bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    + Add Value
                  </button>
                </div>

                <div className="space-y-2">
                  {aboutForm.coreValues.map((val, idx) => (
                    <div key={idx} className="p-3 bg-white border border-[#E2E8F0] rounded-lg flex gap-3 items-start">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={val.title}
                          onChange={(e) => {
                            const updated = [...aboutForm.coreValues];
                            updated[idx].title = e.target.value;
                            setAboutForm({ ...aboutForm, coreValues: updated });
                          }}
                          className="w-full px-2.5 py-1 text-xs font-bold border border-[#E2E8F0] rounded text-[#1E3A8A]"
                        />
                        <textarea
                          rows={2}
                          value={val.description}
                          onChange={(e) => {
                            const updated = [...aboutForm.coreValues];
                            updated[idx].description = e.target.value;
                            setAboutForm({ ...aboutForm, coreValues: updated });
                          }}
                          className="w-full px-2.5 py-1 text-xs border border-[#E2E8F0] rounded text-[#0F172A]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = aboutForm.coreValues.filter((_, i) => i !== idx);
                          setAboutForm({ ...aboutForm, coreValues: updated });
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete value"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: NAVIGATION MENU */}
        {adminTab === 'nav' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Navigation Menu Manager
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Reorder, rename, add, remove, and toggle visibility of header navigation links.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddNavItem}
                    className="px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#1E3A8A] hover:bg-[#F8FAFC] rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Add Link
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingNav(true);
                      try {
                        await onUpdateNavItems(navList);
                        showSuccess('Navigation menu updated successfully.');
                      } catch (err: any) {
                        showError(err.message || 'Failed to update navigation');
                      } finally {
                        setIsSavingNav(false);
                      }
                    }}
                    disabled={isSavingNav}
                    className="px-5 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    {isSavingNav ? 'Saving...' : 'Save Navigation'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {navList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveNavItem(idx, 'up')}
                          className="p-1 text-[#1E3A8A] hover:bg-white disabled:opacity-20 rounded cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === navList.length - 1}
                          onClick={() => handleMoveNavItem(idx, 'down')}
                          className="p-1 text-[#1E3A8A] hover:bg-white disabled:opacity-20 rounded cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#2563EB] w-6">
                        #{item.order}
                      </span>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...navList];
                          updated[idx].label = e.target.value;
                          setNavList(updated);
                        }}
                        placeholder="Link Label"
                        className="px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg font-bold text-[#1E3A8A]"
                      />
                      <input
                        type="text"
                        value={item.target}
                        onChange={(e) => {
                          const updated = [...navList];
                          updated[idx].target = e.target.value;
                          setNavList(updated);
                        }}
                        placeholder="Target Path (e.g. notifications)"
                        className="px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                      />
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => {
                            const updated = [...navList];
                            updated[idx].enabled = e.target.checked;
                            setNavList(updated);
                          }}
                          className="accent-[#2563EB]"
                        />
                        <span>Visible</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isExternal || false}
                          onChange={(e) => {
                            const updated = [...navList];
                            updated[idx].isExternal = e.target.checked;
                            setNavList(updated);
                          }}
                          className="accent-[#2563EB]"
                        />
                        <span>External ↗</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveNavItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: MEDIA LIBRARY */}
        {adminTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Media & Document Library
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Upload, copy URLs, replace, or delete files stored on the server.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 shadow-xs">
                    <FileUp className="w-4 h-4 text-amber-300" />
                    <span>Upload Media File(s)</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* View options & Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMediaFilterType('all')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      mediaFilterType === 'all'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-white text-[#0F172A] border border-[#E2E8F0]'
                    }`}
                  >
                    All ({mediaFiles.length})
                  </button>
                  <button
                    onClick={() => setMediaFilterType('images')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      mediaFilterType === 'images'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-white text-[#0F172A] border border-[#E2E8F0]'
                    }`}
                  >
                    Images ({mediaFiles.filter(m => m.isImage).length})
                  </button>
                  <button
                    onClick={() => setMediaFilterType('documents')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      mediaFilterType === 'documents'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-white text-[#0F172A] border border-[#E2E8F0]'
                    }`}
                  >
                    Documents ({mediaFiles.filter(m => !m.isImage).length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMediaViewMode('grid')}
                    className={`px-2.5 py-1 text-xs font-bold rounded ${
                      mediaViewMode === 'grid' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#0F172A]'
                    }`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setMediaViewMode('table')}
                    className={`px-2.5 py-1 text-xs font-bold rounded ${
                      mediaViewMode === 'table' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#0F172A]'
                    }`}
                  >
                    Table View
                  </button>
                </div>
              </div>

              {/* Media Content */}
              {mediaFiles.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#0F172A]/60 border-2 border-dashed border-[#E2E8F0] rounded-xl">
                  <ImageIcon className="w-10 h-10 text-[#2563EB] mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-[#1E3A8A]">No media uploaded yet.</p>
                  <p className="mt-1">Upload images, logos, or documents to use throughout your portal.</p>
                </div>
              ) : mediaViewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaFiles
                    .filter((m) => {
                      if (mediaFilterType === 'images') return m.isImage;
                      if (mediaFilterType === 'documents') return !m.isImage;
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.filename}
                        className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-[#2563EB] transition-colors"
                      >
                        <div className="h-32 bg-[#F8FAFC] flex items-center justify-center overflow-hidden border-b border-[#E2E8F0]">
                          {item.isImage ? (
                            <img
                              src={item.url}
                              alt={item.originalName}
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <FileText className="w-10 h-10 text-[#2563EB]" />
                          )}
                        </div>

                        <div className="p-3">
                          <div className="font-bold text-xs text-[#1E3A8A] truncate" title={item.originalName}>
                            {item.originalName}
                          </div>
                          <div className="text-[10px] text-[#0F172A]/60 mt-0.5">
                            {(item.size / 1024).toFixed(1)} KB · {new Date(item.uploadedAt).toLocaleDateString()}
                          </div>

                          <div className="mt-3 flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyUrl(item.url)}
                              className="flex-1 py-1 px-2 text-[11px] font-bold bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1E3A8A] rounded border border-[#E2E8F0] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {copiedUrl === item.url ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedUrl === item.url ? 'Copied' : 'Copy URL'}</span>
                            </button>

                            <button
                              onClick={() => setMediaToDelete(item.filename)}
                              className="p-1 text-red-600 hover:bg-red-50 border border-red-200 rounded cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#1E3A8A] uppercase font-bold tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">File Name</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Uploaded</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {mediaFiles
                        .filter((m) => {
                          if (mediaFilterType === 'images') return m.isImage;
                          if (mediaFilterType === 'documents') return !m.isImage;
                          return true;
                        })
                        .map((item) => (
                          <tr key={item.filename} className="hover:bg-[#F8FAFC]/60">
                            <td className="p-3 font-semibold text-[#1E3A8A] flex items-center gap-2">
                              {item.isImage ? <ImageIcon className="w-4 h-4 text-[#2563EB]" /> : <FileText className="w-4 h-4 text-[#2563EB]" />}
                              <span className="truncate max-w-xs">{item.originalName}</span>
                            </td>
                            <td className="p-3 font-mono">{(item.size / 1024).toFixed(1)} KB</td>
                            <td className="p-3 text-[#0F172A]/70">{item.mimeType}</td>
                            <td className="p-3">{new Date(item.uploadedAt).toLocaleDateString()}</td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleCopyUrl(item.url)}
                                className="px-2 py-1 text-[11px] font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded hover:bg-[#E2E8F0] cursor-pointer"
                              >
                                {copiedUrl === item.url ? 'Copied' : 'Copy URL'}
                              </button>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 text-[11px] font-bold bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC]"
                              >
                                View ↗
                              </a>
                              <button
                                onClick={() => setMediaToDelete(item.filename)}
                                className="p-1 text-red-600 hover:bg-red-50 border border-red-200 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: CONTACT PAGE */}
        {adminTab === 'contact' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Contact Directory Editor
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Edit institutional address, phone, email, working hours, and correspondence notice.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setIsSavingContact(true);
                    try {
                      await onUpdateContact(contactForm);
                      showSuccess('Contact directory updated.');
                    } catch (err: any) {
                      showError(err.message || 'Failed to update contact info');
                    } finally {
                      setIsSavingContact(false);
                    }
                  }}
                  disabled={isSavingContact}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSavingContact ? 'Saving...' : 'Save Contact Directory'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                  Office Location Address
                </label>
                <textarea
                  rows={2}
                  value={contactForm.officeAddress}
                  onChange={(e) => setContactForm({ ...contactForm, officeAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Email Correspondence
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Telephone Number
                  </label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={contactForm.workingHours}
                    onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Transit / Location Notes
                  </label>
                  <input
                    type="text"
                    value={contactForm.locationMapInfo || ''}
                    onChange={(e) => setContactForm({ ...contactForm, locationMapInfo: e.target.value })}
                    placeholder="Directions or landmark..."
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                  Administrative Communication Notice (Nodal Officer Notice)
                </label>
                <textarea
                  rows={2}
                  value={contactForm.additionalNotice}
                  onChange={(e) => setContactForm({ ...contactForm, additionalNotice: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: FOOTER */}
        {adminTab === 'footer' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Footer & Legal Notices Editor
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Customize footer branding, copyright notice, legal disclaimer, and quick links.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setIsSavingFooter(true);
                    try {
                      await onUpdateFooterContent(footerForm);
                      showSuccess('Footer content updated.');
                    } catch (err: any) {
                      showError(err.message || 'Failed to update footer');
                    } finally {
                      setIsSavingFooter(false);
                    }
                  }}
                  disabled={isSavingFooter}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSavingFooter ? 'Saving...' : 'Save Footer Content'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Department Title
                  </label>
                  <input
                    type="text"
                    value={footerForm.departmentName}
                    onChange={(e) => setFooterForm({ ...footerForm, departmentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={footerForm.subTitle}
                    onChange={(e) => setFooterForm({ ...footerForm, subTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                  Tagline / Overview Text
                </label>
                <textarea
                  rows={2}
                  value={footerForm.tagline}
                  onChange={(e) => setFooterForm({ ...footerForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                  Institutional Disclaimer Notice
                </label>
                <textarea
                  rows={2}
                  value={footerForm.disclaimer}
                  onChange={(e) => setFooterForm({ ...footerForm, disclaimer: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={footerForm.copyrightText}
                  onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: SITE SETTINGS */}
        {adminTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                    Portal Branding & Site Settings
                  </h2>
                  <p className="text-xs text-[#0F172A]/70">
                    Configure institutional branding, logo image, favicon, and emergency alert banners.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setIsSavingSettings(true);
                    try {
                      await onUpdateSiteSettings(settingsForm);
                      showSuccess('Site settings updated.');
                    } catch (err: any) {
                      showError(err.message || 'Failed to update settings');
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }}
                  disabled={isSavingSettings}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Site Settings'}
                </button>
              </div>

              {/* Palette Confirmation */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-2">
                  Active Institutional Theme: Royal Blue + White + Soft Sky Blue
                </h3>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#2563EB] border border-[#E2E8F0]"></span>
                    <span className="font-mono text-[11px]">Primary Royal Blue (#2563EB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#1E3A8A] border border-[#E2E8F0]"></span>
                    <span className="font-mono text-[11px]">Dark Blue (#1E3A8A)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#38BDF8] border border-[#E2E8F0]"></span>
                    <span className="font-mono text-[11px]">Accent Sky Blue (#38BDF8)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#FFFFFF] border border-[#E2E8F0]"></span>
                    <span className="font-mono text-[11px]">White (#FFFFFF)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Browser Title & SEO Tag
                  </label>
                  <input
                    type="text"
                    value={settingsForm.websiteTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    value={settingsForm.websiteDescription}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Header Brand Text
                  </label>
                  <input
                    type="text"
                    value={settingsForm.logoText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                    Header Subtext
                  </label>
                  <input
                    type="text"
                    value={settingsForm.logoSubtext}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoSubtext: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                  Logo Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsForm.logoUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    placeholder="URL to institutional mark / emblem image..."
                    className="flex-1 px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg"
                  />
                  {mediaFiles.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setSettingsForm({ ...settingsForm, logoUrl: e.target.value });
                        }
                      }}
                      className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                    >
                      <option value="">Pick from Media...</option>
                      {mediaFiles.filter(m => m.isImage).map((m, idx) => (
                        <option key={idx} value={m.url}>{m.originalName}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Emergency Banner Settings */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Emergency System Banner
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.emergencyBanner?.enabled || false}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          emergencyBanner: {
                            ...settingsForm.emergencyBanner,
                            enabled: e.target.checked,
                            text: settingsForm.emergencyBanner?.text || '',
                            level: settingsForm.emergencyBanner?.level || 'info',
                          },
                        })
                      }
                      className="accent-[#2563EB]"
                    />
                    <span>Show Emergency Top Banner</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                      Alert Level
                    </label>
                    <select
                      value={settingsForm.emergencyBanner?.level || 'info'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          emergencyBanner: {
                            ...settingsForm.emergencyBanner!,
                            level: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="info">Info (Royal Blue)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="alert">Critical Alert (Red)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#2563EB] mb-1">
                      Banner Message
                    </label>
                    <input
                      type="text"
                      value={settingsForm.emergencyBanner?.text || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          emergencyBanner: {
                            ...settingsForm.emergencyBanner!,
                            text: e.target.value,
                          },
                        })
                      }
                      placeholder="Emergency alert message shown above main header..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: ADMIN PROFILE */}
        {adminTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
                  Administrator Profile & Security Console
                </h2>
                <p className="text-xs text-[#0F172A]/70">
                  Authenticated session information, authorized administrator directory, and cryptographic token status.
                </p>
              </div>

              {/* Active Admin Details */}
              <div className="p-6 bg-[#1E3A8A] text-white rounded-xl border border-blue-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2563EB] border border-[#38BDF8] flex items-center justify-center text-amber-300 font-bold text-xl font-mono">
                    {adminUserId ? adminUserId.substring(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Active Administrator</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-500 font-semibold">
                        Session Verified
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {adminUserId || 'Authorized User'}
                    </div>
                    <div className="text-xs text-blue-200 mt-0.5">
                      {adminUserId === 'itbdoeakah' ? 'Administrator (IT Branch)' : 'Primary Institutional Administrator'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Sign Out Now
                  </button>
                </div>
              </div>

              {/* Registered Administrator Accounts Directory */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Authorized Administrative Accounts (Backend Configured)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                        <span className="font-mono font-bold text-sm text-[#1E3A8A]">dirdoe</span>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        Primary Admin
                      </span>
                    </div>
                    <p className="text-xs text-[#0F172A]/70">
                      Director of Education administrative account. Full document and CMS governance rights.
                    </p>
                    <div className="text-[11px] text-[#0F172A]/60 flex items-center gap-2 pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>24-Hour Cryptographic Session Expiry</span>
                    </div>
                  </div>

                  <div className="p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                        <span className="font-mono font-bold text-sm text-[#1E3A8A]">itbdoeakah</span>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                        IT Branch Admin
                      </span>
                    </div>
                    <p className="text-xs text-[#0F172A]/70">
                      IT Branch institutional administrator account. Portal infrastructure, document upload, and settings access.
                    </p>
                    <div className="text-[11px] text-[#0F172A]/60 flex items-center gap-2 pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>24-Hour Cryptographic Session Expiry</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Policy Information */}
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-2 text-xs text-[#0F172A]/75">
                <div className="font-bold text-[#1E3A8A] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#2563EB]" />
                  <span>Security & Integrity Guidelines</span>
                </div>
                <p className="leading-relaxed">
                  All administrative actions (uploading circulars, issuing notifications, deleting orders) are protected by cryptographic session tokens checked on every Express API route. Only authenticated administrators can modify database contents or upload files.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Document Form Modal */}
      <DocumentFormModal
        isOpen={isFormModalOpen}
        section={activeSection}
        sectionLabel={getSectionLabel(activeSection)}
        itemToEdit={editingItem}
        isSaving={isSaving}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Global Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        item={itemToDelete}
        sectionLabel={getSectionLabel(deleteSection)}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Media Delete Confirm Modal */}
      {mediaToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setMediaToDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#E2E8F0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-700 rounded-full shrink-0 border border-red-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#1E3A8A] mb-1">
                  Delete Media File?
                </h3>
                <p className="text-xs text-[#0F172A]/70 mb-3 leading-relaxed">
                  Are you sure you want to delete <code className="font-bold text-[#1E3A8A]">{mediaToDelete}</code> from persistent storage? This action cannot be reversed.
                </p>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setMediaToDelete(null)}
                    disabled={isDeletingMedia}
                    className="px-4 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleMediaDeleteConfirm}
                    disabled={isDeletingMedia}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    {isDeletingMedia ? 'Deleting...' : 'Delete File'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Document Viewer Modal */}
      <DocumentViewerModal
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </div>
  );
};
