import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { InstitutionalDocument } from '../types.ts';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: InstitutionalDocument | null;
  sectionLabel: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  sectionLabel,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-[#E2E8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 text-[#DC2626] rounded-full shrink-0 border border-red-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#1E3A8A] mb-1">
              Delete {sectionLabel}?
            </h3>
            <p className="text-xs text-[#475569] mb-3 leading-relaxed">
              Are you sure you want to permanently delete this {sectionLabel.toLowerCase()}? This action cannot be reversed and will remove the document file from persistent storage.
            </p>

            <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] mb-4 text-xs">
              <div className="font-bold text-[#1E3A8A] mb-0.5 truncate">
                {item.title}
              </div>
              <div className="font-mono text-[#2563EB] mb-1 font-semibold">
                Ref: {item.number}
              </div>
              {item.document && (
                <div className="text-[11px] text-[#475569] truncate">
                  Attached file: {item.document.originalName}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] bg-white border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
