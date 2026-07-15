'use client';

import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01]">
        <h1 className="text-2xl font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Documents</h1>
        <p className="text-gray-400 text-sm mt-1">Account statements and financial documents.</p>
      </header>

      <div className="p-6 md:p-10 w-full max-w-4xl mx-auto">
        <div className="glass-panel p-12 flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-[#60A5FA]">
            <FileText size={28} />
          </div>
          <h2 className="text-lg font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            No documents yet
          </h2>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed">
            Your account statements will appear here. Once the backend is connected, you&apos;ll be able
            to view and download all of your company&apos;s financial documents.
          </p>
        </div>
      </div>
    </>
  );
}
