import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
  onLogin: (userId: string, pass: string) => Promise<void>;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToPublic,
  onLogin,
}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await onLogin(userId.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrative credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-8">
        {/* Back Link */}
        <button
          onClick={onBackToPublic}
          className="text-xs text-[#1E3A8A] hover:text-[#2563EB] inline-flex items-center gap-1.5 mb-6 cursor-pointer font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Repository</span>
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1E3A8A] text-white rounded-xl mx-auto flex items-center justify-center mb-3 shadow-md">
            <Shield className="w-6 h-6 text-[#38BDF8]" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#1E3A8A]">
            Administrative Portal
          </h1>
          <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mt-1">
            Department of Education · AKA Home
          </div>
          <p className="text-xs text-[#475569] mt-2">
            Authorized administrative access only.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1.5">
              User ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter administrator User ID"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A8A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#2563EB] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1E3A8A] disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-md"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Admin Console'}
          </button>
        </form>

        {/* Security badge notice */}
        <div className="mt-8 pt-4 border-t border-[#E2E8F0] text-center text-[11px] text-[#475569]/70 font-medium">
          Secure Session · Session token encrypted
        </div>
      </div>
    </div>
  );
};
