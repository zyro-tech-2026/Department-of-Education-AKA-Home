import React from 'react';
import { Shield, LogOut, AlertTriangle, ExternalLink } from 'lucide-react';
import { SiteSettings, NavItem } from '../types.ts';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
  adminUserId?: string | null;
  onAdminLogout: () => void;
  settings?: SiteSettings;
  navItems?: NavItem[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  isAdmin,
  adminUserId,
  onAdminLogout,
  settings,
  navItems,
}) => {
  const brandName = settings?.logoText || 'Department of Education';
  const brandSubtext = settings?.logoSubtext || 'AKA Home · Official Repository';

  const defaultNavLinks: NavItem[] = [
    { id: 'home', label: 'Home', target: 'home', order: 1, enabled: true },
    { id: 'public-circular', label: 'Public Circular', target: 'public-circular', order: 2, enabled: true },
    { id: 'results', label: 'Result', target: 'results', order: 3, enabled: true },
    { id: 'contact', label: 'Contact', target: 'contact', order: 4, enabled: true },
  ];

  const linksToRender = (navItems && navItems.length > 0 ? navItems : defaultNavLinks)
    .filter((l) => l.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40">
      {/* Optional Emergency Alert Banner configured by admin */}
      {settings?.emergencyBanner?.enabled && settings.emergencyBanner.text && (
        <div className={`px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2 ${
          settings.emergencyBanner.level === 'alert'
            ? 'bg-[#DC2626] text-white'
            : settings.emergencyBanner.level === 'warning'
            ? 'bg-amber-800 text-white'
            : 'bg-[#1E3A8A] text-white'
        }`}>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{settings.emergencyBanner.text}</span>
        </div>
      )}

      {/* Top institutional identification banner */}
      <div className="bg-[#1E3A8A] text-white px-4 sm:px-8 py-2 text-xs flex flex-wrap justify-between items-center border-b border-[#1E3A8A]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">
            {brandName}
          </span>
          <span className="text-[#38BDF8]">·</span>
          <span className="text-blue-100 font-medium">AKA Home</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-blue-200">
          <span>Independent Institutional Portal</span>
          {isAdmin && (
            <>
              <span className="text-[#38BDF8]">|</span>
              <span className="text-amber-300 font-medium bg-[#2563EB] px-2 py-0.5 rounded shadow-2xs">
                Admin Session Active ({adminUserId || 'Authorized'})
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main navigation row following Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-20">
        {/* Zone 1: Brand mark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group transition-opacity hover:opacity-90 cursor-pointer flex items-center gap-3"
        >
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={brandName}
              className="w-10 h-10 object-contain rounded border border-[#E2E8F0]"
            />
          ) : null}
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E3A8A] font-serif">
              {brandName}
            </div>
            <div className="text-xs tracking-wider uppercase text-[#2563EB] font-semibold">
              {brandSubtext}
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#0F172A]">
          {linksToRender.map((link) => {
            const isActive =
              currentTab === link.target ||
              (link.target === 'public-circular' &&
                ['public-circular', 'notifications', 'circulars', 'orders'].includes(currentTab)) ||
              (link.target === 'results' && ['results', 'result'].includes(currentTab));

            if (link.isExternal) {
              return (
                <a
                  key={link.id}
                  href={link.target}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 text-[#475569] hover:text-[#2563EB] transition-colors inline-flex items-center gap-1"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                </a>
              );
            }
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.target)}
                className={`py-2 transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB] font-bold'
                    : 'border-transparent text-[#475569] hover:text-[#2563EB]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  currentTab === 'admin'
                    ? 'bg-[#2563EB] text-white ring-2 ring-[#38BDF8]'
                    : 'bg-[#1E3A8A] text-white hover:bg-[#2563EB]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                Admin CMS
              </button>
              <button
                onClick={onAdminLogout}
                title="Sign out of administrative console"
                className="p-2 text-xs font-medium text-[#475569] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-[#E2E8F0]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('admin')}
              className="px-3.5 py-2 text-xs font-semibold text-[#1E3A8A] hover:bg-[#F8FAFC] hover:text-[#2563EB] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
              Admin Portal
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs">
        {linksToRender.map((link) => {
          const isActive =
            currentTab === link.target ||
            (link.target === 'public-circular' &&
              ['public-circular', 'notifications', 'circulars', 'orders'].includes(currentTab)) ||
            (link.target === 'results' && ['results', 'result'].includes(currentTab));

          if (link.isExternal) {
            return (
              <a
                key={link.id}
                href={link.target}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 font-medium whitespace-nowrap rounded text-[#0F172A] hover:bg-white"
              >
                {link.label} ↗
              </a>
            );
          }
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.target)}
              className={`px-2.5 py-1.5 font-medium whitespace-nowrap cursor-pointer rounded ${
                isActive
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'text-[#475569] hover:bg-white hover:text-[#0F172A]'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
