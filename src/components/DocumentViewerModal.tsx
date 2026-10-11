import React from 'react';
import { X, Download, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { InstitutionalDocument } from '../types.ts';

interface DocumentViewerModalProps {
  document: InstitutionalDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  onClose,
}) => {
  if (!document || !document.document) return null;

  const doc = document.document;
  const isPdf = doc.mimeType?.includes('pdf') || doc.filename.toLowerCase().endsWith('.pdf');
  const fileUrl = `/api/documents/${encodeURIComponent(doc.filename)}`;
  const downloadUrl = `/api/documents/${encodeURIComponent(doc.filename)}/download`;

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-[#E2E8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-5 py-3.5 bg-[#1E3A8A] text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <FileText className="w-5 h-5 text-[#38BDF8] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate text-white">
                {document.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <span className="font-mono font-semibold text-amber-300">{document.number}</span>
                <span>·</span>
                <span>{document.date}</span>
                <span>·</span>
                <span>{formatFileSize(doc.size)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={downloadUrl}
              download={doc.originalName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors border border-[#38BDF8]/40"
              title="Download original document"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors border border-[#38BDF8]/40"
              title="Open full document in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close document viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content viewer body */}
        <div className="flex-1 bg-[#F8FAFC] p-2 sm:p-4 overflow-hidden flex flex-col items-center justify-center">
          {isPdf ? (
            <iframe
              src={`${fileUrl}#view=FitH`}
              title={document.title}
              className="w-full h-full border border-[#E2E8F0] rounded-lg bg-white shadow-xs"
            />
          ) : (
            <div className="max-w-md text-center p-8 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1E3A8A] mb-1">
                {doc.originalName}
              </h3>
              <p className="text-xs text-[#475569] mb-4">
                This document ({doc.mimeType || 'binary'}) cannot be previewed directly inside the embedded frame.
              </p>
              <div className="flex justify-center gap-3">
                <a
                  href={downloadUrl}
                  download={doc.originalName}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download File ({formatFileSize(doc.size)})
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-5 py-2.5 bg-white border-t border-[#E2E8F0] text-xs text-[#475569] flex flex-wrap justify-between items-center gap-2">
          <div className="truncate">
            <span className="font-bold text-[#1E3A8A]">Original File:</span> {doc.originalName}
          </div>
          <div className="text-[11px] text-[#475569]/70">
            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
