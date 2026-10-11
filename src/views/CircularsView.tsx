import React, { useState } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { InstitutionalDocument } from '../types.ts';
import { DocumentCard } from '../components/DocumentCard.tsx';

interface CircularsViewProps {
  circulars: InstitutionalDocument[];
  onViewDoc: (item: InstitutionalDocument) => void;
}

export const CircularsView: React.FC<CircularsViewProps> = ({
  circulars,
  onViewDoc,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const years = Array.from(
    new Set(
      circulars
        .map((c) => (c.date ? c.date.split('-')[0] : ''))
        .filter(Boolean)
    )
  ).sort().reverse();

  const filtered = circulars.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear =
      selectedYear === 'all' || (item.date && item.date.startsWith(selectedYear));

    return matchesSearch && matchesYear;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Page Header */}
      <div className="pb-6 mb-8 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-xs text-[#2563EB] uppercase tracking-widest font-bold mb-1">
          <ScrollText className="w-3.5 h-3.5" />
          <span>Administrative Circulars</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-[#1E3A8A]">
          Circulars
        </h1>
        <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
          General circulars, administrative directives, guidance memoranda, and institutional protocols issued by Department of Education, AKA Home.
        </p>
      </div>

      {/* Filter and Search Bar */}
      {circulars.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars or ref no..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
            />
          </div>

          {years.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#475569] font-semibold">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="all">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {circulars.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center max-w-xl mx-auto my-8 shadow-2xs">
          <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full flex items-center justify-center mx-auto mb-3">
            <ScrollText className="w-6 h-6 text-[#2563EB]" />
          </div>
          <h2 className="text-base font-bold text-[#1E3A8A] mb-1">
            No circulars available.
          </h2>
          <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
            There are currently no administrative circulars published by Department of Education, AKA Home. Official circulars will appear here once published.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center shadow-2xs">
          <p className="text-[#0F172A] text-sm font-semibold">
            No circulars found matching your search criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedYear('all');
            }}
            className="mt-3 text-xs text-[#2563EB] hover:text-[#1E3A8A] underline font-bold cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <DocumentCard key={item.id} item={item} onViewDoc={onViewDoc} />
          ))}
        </div>
      )}
    </div>
  );
};
