import React from 'react';
import { Download, Eye, Edit2, Trash2, Globe, FileX } from 'lucide-react';
import { InstitutionalDocument } from '../types.ts';

interface DocumentCardProps {
  item: InstitutionalDocument;
  onViewDoc: (item: InstitutionalDocument) => void;
  isAdmin?: boolean;
  onEdit?: (item: InstitutionalDocument) => void;
  onDelete?: (item: InstitutionalDocument) => void;
  onTogglePublish?: (item: InstitutionalDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  item,
  onViewDoc,
  isAdmin = false,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const hasDoc = Boolean(item.document);
  const isPdf = item.document?.mimeType?.includes('pdf') || item.document?.filename.toLowerCase().endsWith('.pdf');
  const isPublished = item.isPublished !== false;

  return (
    <div className={`bg-white border rounded-xl p-5 transition-all hover:shadow-md flex flex-col justify-between ${
      isAdmin && !isPublished ? 'border-amber-400 bg-amber-50/30' : 'border-[#E2E8F0] hover:border-[#2563EB]'
    }`}>
      <div>
        {/* Unboxed metadata row (Zero-pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] mb-2">
          <span className="font-mono font-bold text-[#1E3A8A]">
            {item.number}
          </span>
          <span aria-hidden="true" className="text-[#E2E8F0]">·</span>
          <span>{item.date}</span>
          {hasDoc && (
            <>
              <span aria-hidden="true" className="text-[#E2E8F0]">·</span>
              <span className="text-[#2563EB] font-semibold">
                {isPdf ? 'Official PDF' : 'Document'} ({formatFileSize(item.document!.size)})
              </span>
            </>
          )}
          {isAdmin && (
            <>
              <span aria-hidden="true" className="text-[#E2E8F0]">·</span>
              <span className={`font-semibold ${isPublished ? 'text-[#16A34A]' : 'text-amber-700'}`}>
                {isPublished ? 'Published' : 'Draft (Unpublished)'}
              </span>
            </>
          )}
          {item.status && item.status !== 'Active' && (
            <>
              <span aria-hidden="true" className="text-[#E2E8F0]">·</span>
              <span className="text-[#1E3A8A] font-medium italic">
                {item.status}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mb-2 leading-snug">
          {item.title}
        </h3>

        {/* Description */}
        {item.description ? (
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-4 line-clamp-3">
            {item.description}
          </p>
        ) : (
          <p className="text-xs text-[#475569]/60 italic mb-4">
            No additional summary provided. Refer to attached official document.
          </p>
        )}
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Document actions */}
        <div className="flex items-center gap-2">
          {hasDoc ? (
            <>
              <button
                type="button"
                onClick={() => onViewDoc(item)}
                className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white rounded-lg font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Document</span>
              </button>
              <a
                href={`/api/documents/${encodeURIComponent(item.document!.filename)}/download`}
                download={item.document!.originalName}
                className="px-3 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#1E3A8A] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                title={`Download ${item.document!.originalName}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </>
          ) : (
            <span className="text-xs text-[#475569] italic">
              Notice only (no attachment)
            </span>
          )}
        </div>

        {/* Admin management actions */}
        {isAdmin && (
          <div className="flex items-center gap-1.5">
            {onTogglePublish && (
              <button
                type="button"
                onClick={() => onTogglePublish(item)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 ${
                  isPublished
                    ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                    : 'text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title={isPublished ? 'Unpublish (make draft)' : 'Publish to public portal'}
              >
                {isPublished ? <FileX className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="px-2.5 py-1 text-xs font-semibold text-[#1E3A8A] bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Edit document details"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="px-2.5 py-1 text-xs font-semibold text-[#DC2626] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Permanently delete document"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
