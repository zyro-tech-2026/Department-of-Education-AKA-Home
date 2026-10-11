import React from 'react';
import { MapPin, Mail, Phone, Clock, FileCheck, Info, Shield, Share2, Compass } from 'lucide-react';
import { ContactInfo } from '../types.ts';

interface ContactViewProps {
  contactInfo: ContactInfo;
  onNavigateToAdmin?: () => void;
  isAdmin?: boolean;
}

export const ContactView: React.FC<ContactViewProps> = ({
  contactInfo,
  onNavigateToAdmin,
  isAdmin = false,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-xs text-[#2563EB] uppercase tracking-widest font-bold mb-1">
          <Mail className="w-3.5 h-3.5" />
          <span>Institutional Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-[#1E3A8A]">
          Contact Information
        </h1>
        <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
          Official administrative communication details for the Department of Education, AKA Home.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Contact details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6 shadow-2xs">
            <h2 className="text-lg font-bold font-serif text-[#1E3A8A] pb-3 border-b border-[#E2E8F0]">
              Administrative Office Details
            </h2>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#2563EB] shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#2563EB]">
                  Office Location
                </h3>
                <p className="text-sm text-[#0F172A] font-semibold mt-1 leading-relaxed whitespace-pre-line">
                  {contactInfo.officeAddress}
                </p>
              </div>
            </div>

            {/* Location / Map Info if available */}
            {contactInfo.locationMapInfo && (
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#2563EB] shrink-0 mt-0.5">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#2563EB]">
                    Location & Transit Directions
                  </h3>
                  <p className="text-sm text-[#475569] mt-1 leading-relaxed whitespace-pre-line">
                    {contactInfo.locationMapInfo}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#2563EB] shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#2563EB]">
                  Email Correspondence
                </h3>
                <p className="text-sm text-[#1E3A8A] font-semibold mt-1">
                  {contactInfo.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#2563EB] shrink-0 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#2563EB]">
                  Telephone Contact
                </h3>
                <p className="text-sm text-[#1E3A8A] font-mono font-bold mt-1">
                  {contactInfo.phone}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#2563EB] shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#2563EB]">
                  Working Hours
                </h3>
                <p className="text-sm text-[#0F172A] font-semibold mt-1">
                  {contactInfo.workingHours}
                </p>
              </div>
            </div>

            {/* Social Media Links if configured */}
            {contactInfo.socialLinks && contactInfo.socialLinks.length > 0 && (
              <div className="flex items-start gap-4 pt-4 border-t border-[#E2E8F0]">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#2563EB] shrink-0 mt-0.5">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#2563EB] mb-2">
                    Official Feeds & External Channels
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {contactInfo.socialLinks.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-blue-50 text-[#1E3A8A] border border-[#E2E8F0] rounded-lg font-semibold transition-colors"
                      >
                        {s.label || s.platform}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Official Advisory / Notice */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#1E3A8A] mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Administrative Communication Notice</span>
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">
              {contactInfo.additionalNotice}
            </p>
          </div>
        </div>

        {/* Right col: Administrative notes & edit prompt for admin */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#2563EB]" />
              <span>Administrative Verification</span>
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed mb-4">
              All official inquiries regarding circulars, notifications, and directives should be addressed to the Department of Education, AKA Home administrative division.
            </p>
            <div className="text-[11px] text-[#475569]/70 border-t border-[#E2E8F0] pt-3">
              Last updated: {new Date(contactInfo.updatedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Admin editing shortcut */}
          <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 text-[#1E3A8A] text-xs font-bold mb-1">
              <Shield className="w-4 h-4 text-[#2563EB]" />
              <span>Administration Notice</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed mb-3">
              Contact details shown on this page can be updated by the authorized administrator via the secure Admin CMS Console.
            </p>
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="w-full py-2.5 px-3 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center shadow-sm"
              >
                {isAdmin ? 'Edit Contact Info in Admin CMS' : 'Sign in as Administrator'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
