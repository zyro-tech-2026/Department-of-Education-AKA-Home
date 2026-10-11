import React, { useState } from 'react';
import {
  Award,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  FileText,
  CheckCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { InstitutionalDocument } from '../types.ts';

interface ResultsViewProps {
  results: InstitutionalDocument[];
  onViewDoc: (doc: InstitutionalDocument) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onViewDoc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  const publishedResults = results.filter((r) => r.isPublished !== false);

  // Extract unique years
  const years = Array.from(
    new Set(
      publishedResults
        .map((r) => {
          if (!r.date) return null;
          const match = r.date.match(/\d{4}/);
          return match ? match[0] : null;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a));

  // Filtered results
  const filteredResults = publishedResults.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.number.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (item.category && item.category.toLowerCase() === categoryFilter.toLowerCase());

    const matchesYear =
      yearFilter === 'ALL' || (item.date && item.date.includes(yearFilter));

    return matchesSearch && matchesCategory && matchesYear;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Page Header */}
      <div className="pb-8 mb-8 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-xs text-[#2563EB] uppercase tracking-widest font-semibold mb-2">
          <Award className="w-4 h-4 text-[#2563EB]" />
          <span>Examination & Recruitment Results</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A8A] font-serif tracking-tight">
              Official Academic & Recruitment Results
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
              Verify and download official scorecards, merit lists, candidate selection outcomes, and annual board examination results published by Department of Education, AKA Home.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#1E3A8A] bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-lg font-medium">
            <CheckCircle className="w-4 h-4 text-[#2563EB]" />
            <span>Verified Gazette Publications</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Exam Title, Roll Series, Reference No., or Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-[#0F172A]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-[#0F172A]"
            >
              <option value="ALL">All Categories</option>
              <option value="examination">Board Examinations</option>
              <option value="recruitment">Faculty & Staff Recruitment</option>
              <option value="merit list">Merit & Talent Lists</option>
              <option value="screening">Equivalence & Screening</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-[#0F172A]"
            >
              <option value="ALL">All Academic Years</option>
              {years.map((y) => (
                <option key={y} value={y!}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick category pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#E2E8F0] text-xs">
          <span className="text-[#475569] font-medium mr-1">Quick Filter:</span>
          {['ALL', 'Examination', 'Recruitment', 'Merit List', 'Screening'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === 'ALL' ? 'ALL' : cat.toLowerCase())}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                (cat === 'ALL' && categoryFilter === 'ALL') ||
                categoryFilter.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length > 0 ? (
        <div className="space-y-4">
          {filteredResults.map((result) => {
            const hasAttachment = !!result.document;
            const categoryName = result.category || 'Examination';

            return (
              <div
                key={result.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl p-5 sm:p-6 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                      {result.number}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-[#F8FAFC] text-[#2563EB] border border-[#E2E8F0]">
                      {categoryName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {result.status || 'Declared'}
                    </span>
                    <span className="text-xs text-[#475569] flex items-center gap-1 ml-auto md:ml-2">
                      <Calendar className="w-3.5 h-3.5 text-[#475569]" />
                      {result.date}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1E3A8A] hover:text-[#2563EB] transition-colors">
                    {result.title}
                  </h3>

                  {result.description && (
                    <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">
                      {result.description}
                    </p>
                  )}

                  {hasAttachment && (
                    <div className="flex items-center gap-2 text-xs text-[#475569] pt-1">
                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span className="font-mono text-xs text-[#0F172A]">
                        {result.document?.originalName}
                      </span>
                      <span>·</span>
                      <span>
                        {(result.document!.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  {hasAttachment ? (
                    <>
                      <button
                        onClick={() => onViewDoc(result)}
                        className="px-4 py-2 text-xs font-semibold text-[#1E3A8A] bg-[#F8FAFC] hover:bg-blue-50 hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                      <a
                        href={`/api/documents/${result.document!.filename}/download`}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E3A8A] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={() => onViewDoc(result)}
                      className="px-4 py-2 text-xs font-semibold text-[#1E3A8A] bg-[#F8FAFC] hover:bg-blue-50 hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Details</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E3A8A]">No Results Found</h3>
          <p className="mt-2 text-sm text-[#475569]">
            No published examination or recruitment results match your current search filters.
          </p>
          {(searchQuery || categoryFilter !== 'ALL' || yearFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setYearFilter('ALL');
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
