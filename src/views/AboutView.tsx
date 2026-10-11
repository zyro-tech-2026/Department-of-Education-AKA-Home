import React from 'react';
import { BookOpen, Target, Compass, Award, CheckCircle2 } from 'lucide-react';
import { AboutContent } from '../types.ts';

interface AboutViewProps {
  aboutContent?: AboutContent;
  onNavigate: (tab: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ aboutContent, onNavigate }) => {
  const heading = aboutContent?.heading || 'About Department of Education, AKA Home';
  const subtitle = aboutContent?.subtitle || 'Governance, Standards, and Institutional Integrity';
  const description =
    aboutContent?.description ||
    'The Department of Education, AKA Home operates as an independent educational administration overseeing administrative coordination, curriculum guidance, official circular distribution, and institutional directives.';
  const mission =
    aboutContent?.mission ||
    'To foster educational excellence, institutional transparency, and administrative rigor through clear public notices, verified circulars, and disciplined governance standards.';
  const vision =
    aboutContent?.vision ||
    'A modern, accessible, and accountable institutional framework providing equitable educational oversight and reliable repository access for students, educators, and administrators.';

  const coreValues = aboutContent?.coreValues || [
    { title: 'Transparency', description: 'Immediate public access to all circulars, notifications, and administrative determinations.' },
    { title: 'Academic Integrity', description: 'Upholding rigorous pedagogical standards and institutional compliance across all programs.' },
    { title: 'Accountability', description: 'Systematic record-keeping and verifiable executive orders published in digital repository format.' },
    { title: 'Accessibility', description: 'Universal access to public documentation with clear classification and responsive support.' },
  ];

  const responsibilities = aboutContent?.keyResponsibilities || [
    'Issuing regulatory circulars and advisory memoranda.',
    'Publishing official notifications and public announcements.',
    'Executing institutional orders and administrative directives.',
    'Maintaining verifiable public document records and archival repositories.',
    'Addressing public correspondence and institutional inquiries.',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-xs text-[#2563EB] uppercase tracking-widest font-bold mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Institutional Charter</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-[#1E3A8A]">
          {heading}
        </h1>
        <p className="text-base text-[#2563EB] mt-2 font-serif italic max-w-2xl font-semibold">
          {subtitle}
        </p>
      </div>

      {/* Main Narrative */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-10 space-y-6 shadow-2xs">
        <h2 className="text-lg font-bold font-serif text-[#1E3A8A] border-b border-[#E2E8F0] pb-3">
          Institutional Mandate
        </h2>
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-4xl whitespace-pre-line">
          {description}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-3 shadow-2xs">
          <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E3A8A] w-fit">
            <Target className="w-5 h-5 text-[#2563EB]" />
          </div>
          <h3 className="text-base font-bold font-serif text-[#1E3A8A]">
            Our Mission
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
            {mission}
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-3 shadow-2xs">
          <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E3A8A] w-fit">
            <Compass className="w-5 h-5 text-[#2563EB]" />
          </div>
          <h3 className="text-base font-bold font-serif text-[#1E3A8A]">
            Our Vision
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
            {vision}
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-lg font-bold font-serif text-[#1E3A8A]">
            Institutional Values
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreValues.map((val, idx) => (
            <div key={idx} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-2xs">
              <div className="font-bold text-[#1E3A8A] text-sm mb-1.5">
                {val.title}
              </div>
              <div className="text-xs text-[#475569] leading-relaxed">
                {val.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Responsibilities */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E3A8A]">
          Core Responsibilities & Repository Functions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-[#475569]">
          {responsibilities.map((resp, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <span>{resp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
