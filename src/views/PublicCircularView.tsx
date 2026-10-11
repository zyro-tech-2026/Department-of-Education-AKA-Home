import React, { useState } from 'react';
import {
  Bell,
  ScrollText,
  FileText,
  Search,
  Filter,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { InstitutionalDocument } from '../types.ts';
import { DocumentCard } from '../components/DocumentCard.tsx';

export type PublicCircularSubsection = 'notifications' | 'orders' | 'circulars';

interface PublicCircularViewProps {
  notifications: InstitutionalDocument[];
  circulars: InstitutionalDocument[];
  orders: InstitutionalDocument[];
  onViewDoc: (doc: InstitutionalDocument) => void;
  initialSubsection?: PublicCircularSubsection;
}

export const PublicCircularView: React.FC<PublicCircularViewProps> = ({
  notifications,
  circulars,
  orders,
  onViewDoc,
  initialSubsection = 'notifications',
}) => {
  const [activeSubsection, setActiveSubsection] = useState<PublicCircularSubsection>(initialSubsection);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Published counts
  const publishedNotifications = notifications.filter((d) => d.isPublished !== false);
  const publishedCirculars = circulars.filter((d) => d.isPublished !== false);
  const publishedOrders = orders.filter((d) => d.isPublished !== false);

  // Active dataset
  const activeList =
    activeSubsection === 'notifications'
      ? publishedNotifications
      : activeSubsection === 'circulars'
      ? publishedCirculars
      : publishedOrders;

  // Extract unique years for filtering
  const years = Array.from(
    new Set(
      activeList
        .map((d) => {
          if (!d.date) return null;
          const match = d.date.match(/\d{4}/);
          return match ? match[0] : null;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a));

  // Filtered list
  const filteredDocuments = activeList.filter((doc) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.number.toLowerCase().includes(q) ||
      (doc.description && doc.description.toLowerCase().includes(q));

    const matchesYear =
      yearFilter === 'ALL' || (doc.date && doc.date.includes(yearFilter));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (doc.status && doc.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesYear && matchesStatus;
  });

  const getSubsectionDetails = () => {
    switch (activeSubsection) {
      case 'notifications':
        return {
          title: 'Official Notifications',
          eyebrow: 'Public Announcements & Gazette Dispatches',
          description:
            'Administrative notifications, institutional policy announcements, examination schedules, and official notices issued by the Department of Education, AKA Home.',
          icon: <Bell className="w-5 h-5 text-[#2563EB]" />,
          emptyNotice: 'No published notifications match your filter criteria.',
        };
      case 'circulars':
        return {
          title: 'Administrative Circulars',
          eyebrow: 'Operational Memoranda & Directives',
          description:
            'Advisory memoranda, academic guidelines, curriculum frameworks, and administrative circulars circulated to member institutes.',
          icon: <ScrollText className="w-5 h-5 text-[#2563EB]" />,
          emptyNotice: 'No published circulars match your filter criteria.',
        };
      case 'orders':
        return {
          title: 'Executive Orders & Directives',
          eyebrow: 'Institutional Determinations & Records',
          description:
            'Executive determinations, financial sanctions, committee constitutions, and regulatory decisions maintained in the institutional archive.',
          icon: <FileText className="w-5 h-5 text-[#2563EB]" />,
          emptyNotice: 'No published executive orders match your filter criteria.',
        };
    }
  };

  const details = getSubsectionDetails();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Page Header */}
      <div className="pb-8 mb-8 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-xs text-[#2563EB] uppercase tracking-widest font-semibold mb-2">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span>Public Circular Repository</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A8A] font-serif tracking-tight">
              Public Circulars & Dispatches
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
              Centralized institutional catalog for official notifications, executive orders, and administrative circulars issued by Department of Education, AKA Home.
            </p>
          </div>
        </div>

        {/* 3 Main Subsections Tab Switcher */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setActiveSubsection('notifications');
              setSearchQuery('');
              setYearFilter('ALL');
              setStatusFilter('ALL');
            }}
            className={`cursor-pointer p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              activeSubsection === 'notifications'
                ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-sm'
                : 'bg-white/80 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-white text-[#475569]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  activeSubsection === 'notifications'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F8FAFC] text-[#1E3A8A] border border-[#E2E8F0]'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#0F172A]">Notification</div>
                <div className="text-xs text-[#475569]">Notices & Announcements</div>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                activeSubsection === 'notifications'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                  : 'bg-slate-100 text-[#475569]'
              }`}
            >
              {publishedNotifications.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubsection('orders');
              setSearchQuery('');
              setYearFilter('ALL');
              setStatusFilter('ALL');
            }}
            className={`cursor-pointer p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              activeSubsection === 'orders'
                ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-sm'
                : 'bg-white/80 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-white text-[#475569]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  activeSubsection === 'orders'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F8FAFC] text-[#1E3A8A] border border-[#E2E8F0]'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#0F172A]">Order</div>
                <div className="text-xs text-[#475569]">Executive Determinations</div>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                activeSubsection === 'orders'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                  : 'bg-slate-100 text-[#475569]'
              }`}
            >
              {publishedOrders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubsection('circulars');
              setSearchQuery('');
              setYearFilter('ALL');
              setStatusFilter('ALL');
            }}
            className={`cursor-pointer p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              activeSubsection === 'circulars'
                ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-sm'
                : 'bg-white/80 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-white text-[#475569]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  activeSubsection === 'circulars'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F8FAFC] text-[#1E3A8A] border border-[#E2E8F0]'
                }`}
              >
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#0F172A]">Circulars</div>
                <div className="text-xs text-[#475569]">Advisory Memoranda</div>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                activeSubsection === 'circulars'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                  : 'bg-slate-100 text-[#475569]'
              }`}
            >
              {publishedCirculars.length}
            </span>
          </button>
        </div>
      </div>

      {/* Active Subsection Subheader */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] mb-1">
              {details.eyebrow}
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A8A] font-serif flex items-center gap-2">
              {details.icon}
              {details.title}
            </h2>
            <p className="text-sm text-[#475569] mt-1.5 max-w-2xl">
              {details.description}
            </p>
          </div>
          <div className="text-xs text-[#475569] font-medium px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg self-start md:self-center">
            Showing <strong className="text-[#0F172A]">{filteredDocuments.length}</strong> of{' '}
            <strong className="text-[#0F172A]">{activeList.length}</strong> records
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${details.title.toLowerCase()} by title, number, or keyword...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-[#0F172A]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-[#0F172A]"
            >
              <option value="ALL">All Years ({years.length > 0 ? `${years[years.length - 1]}–${years[0]}` : 'Archive'})</option>
              {years.map((y) => (
                <option key={y} value={y!}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-[#0F172A]"
            >
              <option value="ALL">All Classifications</option>
              <option value="Active">Active Directives</option>
              <option value="Archived">Archived Records</option>
              <option value="Superseded">Superseded Notices</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              item={doc}
              onViewDoc={onViewDoc}
              isAdmin={false}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E3A8A]">No Records Found</h3>
          <p className="mt-2 text-sm text-[#475569]">
            {details.emptyNotice}
          </p>
          {(searchQuery || yearFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setYearFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="mt-5 px-4 py-2 text-xs font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-200"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
