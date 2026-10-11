import React from 'react';
import { Lock, ExternalLink } from 'lucide-react';
import { FooterContent } from '../types.ts';

interface FooterProps {
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
  footerContent?: FooterContent;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, isAdmin, footerContent }) => {
  const departmentName = footerContent?.departmentName || 'Department of Education';
  const subTitle = footerContent?.subTitle || 'AKA Home · Administrative Repository';
  const tagline =
    footerContent?.tagline ||
    'Centralized institutional catalog for official notifications, circulars, executive directives, and verified educational correspondence.';
  const disclaimer =
    footerContent?.disclaimer ||
    'This website is an independent institutional document repository for Department of Education, AKA Home. It is not connected to any government department, public authority, or external state portal.';
  const copyrightText =
    footerContent?.copyrightText ||
    `© ${new Date().getFullYear()} Department of Education, AKA Home. All institutional rights reserved.`;

  const importantLinks = footerContent?.importantLinks && footerContent.importantLinks.length > 0
    ? footerContent.importantLinks
    : [
        { label: 'Home', url: 'home' },
        { label: 'Notifications', url: 'notifications' },
        { label: 'Circulars', url: 'circulars' },
        { label: 'Orders', url: 'orders' },
        { label: 'About', url: 'about' },
        { label: 'Contact', url: 'contact' },
      ];

  const handleLinkClick = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(url);
    }
  };

  return (
    <footer className="border-t border-[#1E3A8A] bg-[#1E3A8A] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-blue-800/80">
          {/* Col 1: Institutional identification */}
          <div className="md:col-span-2">
            <h3 className="text-white text-lg font-bold font-serif mb-2 tracking-wide">
              {departmentName}
            </h3>
            <p className="text-blue-200 text-sm font-semibold mb-3">
              {subTitle}
            </p>
            <p className="text-blue-100/90 text-xs leading-relaxed max-w-md">
              {tagline}
            </p>
            <div className="mt-4 p-3 bg-blue-900/60 border border-[#38BDF8]/40 rounded-lg text-[11px] text-blue-100 leading-normal">
              <span className="font-bold text-white">Legal Notice:</span> {disclaimer}
            </div>
          </div>

          {/* Col 2: Navigation / Important links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#38BDF8] font-bold mb-3">
              Important Links
            </h4>
            <ul className="space-y-2 text-sm">
              {importantLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link.url)}
                    className="hover:text-white transition-colors cursor-pointer text-blue-100 hover:underline text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Administrative Access & Social links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#38BDF8] font-bold mb-3">
              Administration
            </h4>
            <p className="text-xs text-blue-100/80 mb-3 leading-relaxed">
              Authorized personnel only. Access Content Management System (CMS) and document repository.
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg border border-[#38BDF8]/40 transition-colors cursor-pointer shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              {isAdmin ? 'Admin CMS Console' : 'Administrator Sign In'}
            </button>

            {footerContent?.socialLinks && footerContent.socialLinks.length > 0 && (
              <div className="mt-5 pt-4 border-t border-blue-800/80">
                <div className="text-[11px] uppercase tracking-wider text-[#38BDF8] font-semibold mb-2">
                  Institutional Feeds
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {footerContent.socialLinks.map((soc, idx) => (
                    <a
                      key={idx}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-100 hover:text-white underline"
                    >
                      {soc.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-blue-200 gap-4">
          <div>
            {copyrightText}
          </div>
          <div className="flex items-center gap-4 text-xs text-blue-300">
            <span>Official Records Access</span>
            <span>·</span>
            <span>Document Security Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
