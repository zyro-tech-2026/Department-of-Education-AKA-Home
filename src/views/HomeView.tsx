import React from 'react';
import { ArrowRight, Bell, FileText, ScrollText, Mail, ShieldAlert, AlertCircle, Info, ExternalLink, Award } from 'lucide-react';
import { InstitutionalDocument, HomeContent } from '../types.ts';
import { DocumentCard } from '../components/DocumentCard.tsx';

interface HomeViewProps {
  notifications: InstitutionalDocument[];
  circulars: InstitutionalDocument[];
  orders: InstitutionalDocument[];
  results?: InstitutionalDocument[];
  onNavigate: (tab: string) => void;
  onViewDoc: (item: InstitutionalDocument) => void;
  homeContent?: HomeContent;
}

export const HomeView: React.FC<HomeViewProps> = ({
  notifications,
  circulars,
  orders,
  results = [],
  onNavigate,
  onViewDoc,
  homeContent,
}) => {
  const kicker = homeContent?.heroKicker || 'Institutional Document Repository';
  const heading = homeContent?.heroHeading || 'Department of Education';
  const subtitle = homeContent?.heroSubtitle || 'AKA Home';
  const description =
    homeContent?.heroDescription ||
    'The Department of Education, AKA Home is an independent educational administration dedicated to academic governance, institutional standards, curriculum coordination, and administrative integrity. This portal serves as the centralized repository for all official notifications, administrative circulars, executive orders, and institutional communications.';

  const primaryBtnText = homeContent?.heroButtons?.primaryText || 'View Notifications';
  const primaryBtnTarget = homeContent?.heroButtons?.primaryTarget || 'notifications';
  const secondaryBtnText = homeContent?.heroButtons?.secondaryText || 'Administrative Circulars';
  const secondaryBtnTarget = homeContent?.heroButtons?.secondaryTarget || 'circulars';

  const welcomeHeading = homeContent?.welcomeHeading || 'Institutional Repository & Directives';
  const welcomeText =
    homeContent?.welcomeText ||
    'All documents published in this repository are maintained by the administrative office of Department of Education, AKA Home. For clarification on published records or inquiries, navigate to the Contact section.';

  const notice = homeContent?.noticeBanner;

  return (
    <div className="space-y-12 pb-16 bg-[#F8FAFC]">
      {/* Notice Banner if enabled by admin */}
      {notice?.enabled && notice.message && (
        <div className="bg-blue-50/80 border-b border-[#E2E8F0] py-3 px-4 sm:px-8 text-xs text-[#0F172A]">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#2563EB] text-white font-semibold rounded text-[11px] tracking-wide shadow-2xs">
                {notice.badgeText || 'NOTICE'}
              </span>
              <span className="font-medium text-[#0F172A]">{notice.message}</span>
            </div>
            {notice.linkTarget && (
              <button
                onClick={() => onNavigate(notice.linkTarget!)}
                className="font-bold text-[#2563EB] hover:text-[#1E3A8A] cursor-pointer inline-flex items-center gap-1 underline"
              >
                <span>{notice.linkText || 'Read more'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Institutional Hero Banner */}
      <section className="bg-white border-b border-[#E2E8F0] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className={`${homeContent?.heroImageUrl ? 'lg:col-span-8' : 'lg:col-span-12 max-w-3xl'}`}>
              <div className="text-xs font-bold uppercase tracking-widest text-[#2563EB] mb-2">
                {kicker}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[#1E3A8A] tracking-tight mb-3">
                {heading}
              </h1>
              <div className="text-xl sm:text-2xl font-serif text-[#2563EB] italic mb-6">
                {subtitle}
              </div>
              <p className="text-[#475569] text-sm sm:text-base leading-relaxed mb-8">
                {description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                {primaryBtnText && (
                  <button
                    onClick={() => onNavigate(primaryBtnTarget)}
                    className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
                  >
                    <span>{primaryBtnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {secondaryBtnText && (
                  <button
                    onClick={() => onNavigate(secondaryBtnTarget)}
                    className="px-5 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#1E3A8A] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>{secondaryBtnText}</span>
                  </button>
                )}
              </div>

              {/* Quick Action Navigation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={() => onNavigate('notifications')}
                  className="p-3.5 bg-white hover:bg-blue-50/40 border border-[#E2E8F0] hover:border-[#38BDF8] rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <Bell className="w-4 h-4 text-[#2563EB] mb-2" />
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                    Notifications
                  </div>
                  <div className="text-[11px] text-[#475569] mt-0.5">
                    {notifications.length} {notifications.length === 1 ? 'record' : 'records'}
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('circulars')}
                  className="p-3.5 bg-white hover:bg-blue-50/40 border border-[#E2E8F0] hover:border-[#38BDF8] rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <ScrollText className="w-4 h-4 text-[#2563EB] mb-2" />
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                    Circulars
                  </div>
                  <div className="text-[11px] text-[#475569] mt-0.5">
                    {circulars.length} {circulars.length === 1 ? 'record' : 'records'}
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('orders')}
                  className="p-3.5 bg-white hover:bg-blue-50/40 border border-[#E2E8F0] hover:border-[#38BDF8] rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-[#2563EB] mb-2" />
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                    Orders
                  </div>
                  <div className="text-[11px] text-[#475569] mt-0.5">
                    {orders.length} {orders.length === 1 ? 'record' : 'records'}
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('results')}
                  className="p-3.5 bg-white hover:bg-blue-50/40 border border-[#E2E8F0] hover:border-[#38BDF8] rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <Award className="w-4 h-4 text-[#2563EB] mb-2" />
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">
                    Results
                  </div>
                  <div className="text-[11px] text-[#475569] mt-0.5">
                    {results.length} {results.length === 1 ? 'record' : 'records'}
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Hero Image */}
            {homeContent?.heroImageUrl && (
              <div className="lg:col-span-4">
                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs bg-[#F8FAFC] p-2">
                  <img
                    src={homeContent.heroImageUrl}
                    alt={heading}
                    className="w-full h-auto max-h-72 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Editable Stats Counters if configured */}
      {homeContent?.stats && homeContent.stats.some((s) => s.enabled) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-2xs">
            {homeContent.stats.filter((s) => s.enabled).map((st) => (
              <div key={st.id} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#1E3A8A]">
                  {st.value}
                </div>
                <div className="text-xs text-[#475569] mt-1 font-semibold">
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 3 Sections Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section 1: Notifications */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1E3A8A]">
                Notifications
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Official notices and administrative announcements
              </p>
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1E3A8A] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
              <p className="text-[#0F172A] text-sm font-semibold">
                No notifications available.
              </p>
              <p className="text-[#475569] text-xs mt-1">
                Official notices will appear here once published by the administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notifications.slice(0, 3).map((item) => (
                <DocumentCard key={item.id} item={item} onViewDoc={onViewDoc} />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Circulars */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1E3A8A]">
                Circulars
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                General regulatory circulars and advisory memoranda
              </p>
            </div>
            <button
              onClick={() => onNavigate('circulars')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1E3A8A] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all circulars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {circulars.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
              <p className="text-[#0F172A] text-sm font-semibold">
                No circulars available.
              </p>
              <p className="text-[#475569] text-xs mt-1">
                Official circulars will appear here once published by the administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circulars.slice(0, 3).map((item) => (
                <DocumentCard key={item.id} item={item} onViewDoc={onViewDoc} />
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Orders */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1E3A8A]">
                Orders
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Executive orders, directives, and administrative decisions
              </p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1E3A8A] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
              <p className="text-[#0F172A] text-sm font-semibold">
                No orders available.
              </p>
              <p className="text-[#475569] text-xs mt-1">
                Executive orders will appear here once published by the administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.slice(0, 3).map((item) => (
                <DocumentCard key={item.id} item={item} onViewDoc={onViewDoc} />
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Examination & Recruitment Results */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1E3A8A]">
                Examination & Recruitment Results
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Official merit lists, scorecards, and candidate determinations
              </p>
            </div>
            <button
              onClick={() => onNavigate('results')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1E3A8A] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {results.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
              <p className="text-[#0F172A] text-sm font-semibold">
                No examination results declared yet.
              </p>
              <p className="text-[#475569] text-xs mt-1">
                Official results will appear here once declared by the examination board.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.slice(0, 3).map((item) => (
                <DocumentCard key={item.id} item={item} onViewDoc={onViewDoc} />
              ))}
            </div>
          )}
        </div>

        {/* Institutional notice banner / welcome text */}
        <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl space-y-2 text-xs text-[#475569] shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-[#1E3A8A] text-sm font-serif">
            <Info className="w-4 h-4 text-[#2563EB]" />
            <span>{welcomeHeading}</span>
          </div>
          <p className="leading-relaxed">
            {welcomeText}
          </p>
        </div>
      </div>
    </div>
  );
};
