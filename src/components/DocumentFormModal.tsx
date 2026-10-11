import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Globe, FileX } from 'lucide-react';
import { InstitutionalDocument, DocumentSectionType } from '../types.ts';

interface DocumentFormModalProps {
  isOpen: boolean;
  section: DocumentSectionType;
  sectionLabel: string;
  itemToEdit: InstitutionalDocument | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  section,
  sectionLabel,
  itemToEdit,
  isSaving,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [status, setStatus] = useState('Active');
  const [category, setCategory] = useState('Examination');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeDocument, setRemoveDocument] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setNumber(itemToEdit.number);
      setDate(itemToEdit.date);
      setDescription(itemToEdit.description || '');
      setIsPublished(itemToEdit.isPublished !== false);
      setStatus(itemToEdit.status || (section === 'results' ? 'Declared' : 'Active'));
      setCategory(itemToEdit.category || 'Examination');
      setSelectedFile(null);
      setRemoveDocument(false);
    } else {
      // New item defaults
      setTitle('');
      const year = new Date().getFullYear();
      let prefix = 'DOE/DOC';
      if (section === 'notifications') prefix = `DOE/NOTIF/${year}/`;
      else if (section === 'circulars') prefix = `DOE/CIR/${year}/`;
      else if (section === 'orders') prefix = `DOE/ORD/${year}/`;
      else if (section === 'results') prefix = `DOE/RES/${year}/`;

      setNumber(prefix);
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setIsPublished(true);
      setStatus(section === 'results' ? 'Declared' : 'Active');
      setCategory('Examination');
      setSelectedFile(null);
      setRemoveDocument(false);
    }
    setErrorMessage(null);
  }, [itemToEdit, section, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = [
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        '.png', '.jpg', '.jpeg', '.webp'
      ];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!validExtensions.includes(ext)) {
        setErrorMessage('Invalid file format. Please upload a PDF, DOC, DOCX, TXT, or Image file.');
        return;
      }

      if (file.size > 35 * 1024 * 1024) {
        setErrorMessage('File size exceeds 35MB limit.');
        return;
      }

      setErrorMessage(null);
      setSelectedFile(file);
      setRemoveDocument(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter an official title.');
      return;
    }
    if (!number.trim()) {
      setErrorMessage(`Please enter a valid ${sectionLabel} reference number.`);
      return;
    }
    if (!date.trim()) {
      setErrorMessage('Please specify an issuance date.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('number', number.trim());
    formData.append('date', date.trim());
    formData.append('description', description.trim());
    formData.append('isPublished', String(isPublished));
    formData.append('status', status.trim());
    if (section === 'results') {
      formData.append('category', category.trim());
    }

    if (selectedFile) {
      formData.append('document', selectedFile);
    } else if (removeDocument) {
      formData.append('removeDocument', 'true');
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return `${bytes} B`;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 border border-[#E2E8F0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1E3A8A] text-white flex items-center justify-between border-b border-blue-900">
          <div>
            <h2 className="text-base font-bold font-serif">
              {itemToEdit ? `Edit ${sectionLabel}` : `Add New ${sectionLabel}`}
            </h2>
            <p className="text-xs text-blue-200">
              Department of Education · AKA Home Content Management System
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
              Document Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter official ${sectionLabel.toLowerCase()} title`}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                Reference Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. DOE/NOTIF/2026/001"
                className="w-full px-3 py-2 text-sm font-mono border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                Issuance Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                Publishing Status
              </label>
              <div className="flex items-center gap-3 p-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-[#0F172A]">
                  <input
                    type="radio"
                    name="publishState"
                    checked={isPublished === true}
                    onChange={() => setIsPublished(true)}
                    className="accent-[#2563EB]"
                  />
                  <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Published (Public)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-[#0F172A]">
                  <input
                    type="radio"
                    name="publishState"
                    checked={isPublished === false}
                    onChange={() => setIsPublished(false)}
                    className="accent-[#2563EB]"
                  />
                  <FileX className="w-3.5 h-3.5 text-amber-700" />
                  <span>Draft (Hidden)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                Record Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              >
                {section === 'results' ? (
                  <>
                    <option value="Declared">Declared / Published</option>
                    <option value="Verified">Verified Gazette</option>
                    <option value="Under Scrutiny">Under Scrutiny</option>
                    <option value="Archived">Archived Result</option>
                    <option value="Draft">Draft</option>
                  </>
                ) : (
                  <>
                    <option value="Active">Active (In Effect)</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                    <option value="Superseded">Superseded</option>
                    <option value="Draft">Draft</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {section === 'results' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
                Result Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="Examination">Board Examination</option>
                <option value="Recruitment">Faculty & Staff Recruitment</option>
                <option value="Merit List">Merit & Scholarship List</option>
                <option value="Screening">Equivalence & Screening</option>
                <option value="Revaluation">Revaluation & Grievance Outcome</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
              Description / Executive Summary
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a concise institutional summary or description of this document..."
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
            />
          </div>

          {/* Document attachment section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1">
              Official Document Attachment
            </label>

            {itemToEdit?.document && !removeDocument && !selectedFile && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#1E3A8A] truncate">
                      {itemToEdit.document.originalName}
                    </div>
                    <div className="text-[11px] text-[#475569]">
                      {formatFileSize(itemToEdit.document.size)} · Uploaded {new Date(itemToEdit.document.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A8A] rounded cursor-pointer transition-colors shadow-2xs">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setRemoveDocument(true)}
                    className="px-2.5 py-1 text-xs font-semibold text-[#DC2626] hover:bg-red-50 rounded transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {removeDocument && !selectedFile && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg mb-2 flex items-center justify-between">
                <span>Current attachment will be detached upon saving.</span>
                <button
                  type="button"
                  onClick={() => setRemoveDocument(false)}
                  className="font-bold underline cursor-pointer text-xs"
                >
                  Undo
                </button>
              </div>
            )}

            {selectedFile && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-emerald-900 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-[#16A34A]">
                      {formatFileSize(selectedFile.size)} · Ready to upload
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-[#475569] hover:text-[#0F172A] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {(!itemToEdit?.document || removeDocument || selectedFile === null) && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] rounded-lg p-5 text-center cursor-pointer bg-[#F8FAFC] hover:bg-blue-50/20 transition-colors">
                <Upload className="w-6 h-6 text-[#2563EB] mb-2" />
                <span className="text-xs font-semibold text-[#1E3A8A]">
                  {selectedFile ? 'Select different file' : 'Click to select document'}
                </span>
                <span className="text-[11px] text-[#475569] mt-1">
                  PDF format preferred (also supports DOC, DOCX, TXT, images up to 35MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E3A8A] disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {isSaving ? 'Saving...' : itemToEdit ? 'Save Changes' : `Publish ${sectionLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
