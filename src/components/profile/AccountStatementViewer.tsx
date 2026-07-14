"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  ChevronRight,
  Download,
  FileText,
  Printer,
  X,
  AlertCircle,
} from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getEarliestTransferDate, getStatementPdfBlob } from "@/lib/transfers-api";

interface MonthOption {
  value: string; // `${year}-${month}` (month is 1-based)
  label: string;
  year: number;
  month: number; // 1-based
}

interface AccountStatementViewerProps {
  merchantWallet: string | null;
  businessName?: string | null;
  email?: string | null;
}

/**
 * Builds the list of statement months to offer. Always includes the current
 * month, then adds up to 3 previous months, but only as far back as the
 * account's earliest transaction. If there is no activity, only the current
 * month is returned.
 */
function buildMonthOptions(earliest: Date | null): MonthOption[] {
  const now = new Date();

  let previousToShow = 0;
  if (earliest) {
    const diffMonths =
      (now.getFullYear() - earliest.getFullYear()) * 12 +
      (now.getMonth() - earliest.getMonth());
    previousToShow = Math.max(0, Math.min(3, diffMonths));
  }

  const options: MonthOption[] = [];
  for (let i = 0; i <= previousToShow; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }
  return options;
}

export function AccountStatementViewer({}: AccountStatementViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [earliestDate, setEarliestDate] = useState<Date | null>(null);
  const [monthsLoading, setMonthsLoading] = useState(true);
  const monthOptions = useMemo(() => buildMonthOptions(earliestDate), [earliestDate]);
  const [activeOption, setActiveOption] = useState<MonthOption | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Revoke the object URL whenever it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine how far back statements should be offered based on activity.
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        if (!cancelled) setMonthsLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const date = await getEarliestTransferDate(token);
        if (!cancelled) setEarliestDate(date);
      } catch {
        if (!cancelled) setEarliestDate(null);
      } finally {
        if (!cancelled) setMonthsLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const openStatement = useCallback(async (option: MonthOption) => {
    const user = auth.currentUser;
    setActiveOption(option);
    setError(null);
    setPdfBlob(null);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (!user) {
      setError("Your session could not be identified. Please sign in again.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      // Scoped to the authenticated merchant by the backend auth token.
      const blob = await getStatementPdfBlob(token, option.year, option.month);
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(url);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load the account statement.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeModal = () => {
    setActiveOption(null);
    setError(null);
    setPdfBlob(null);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handlePrint = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
  };

  const handleDownload = () => {
    if (!pdfBlob || !activeOption) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `account-statement-${activeOption.year}-${String(
      activeOption.month
    ).padStart(2, "0")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#60A5FA]/30 flex items-center justify-center text-[#60A5FA]">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
              Account Statements
            </h2>
            <p className="text-xs text-gray-400" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Pick a month to view, print or download its statement (same document sent by email).
            </p>
          </div>
        </div>
      </div>

      {/* Month cards */}
      {monthsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {monthOptions.map((option, idx) => (
          <button
            key={option.value}
            type="button"
            onClick={() => openStatement(option)}
            className="group text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#60A5FA]/40 transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 border border-[#60A5FA]/20 flex items-center justify-center text-[#60A5FA]">
                <Calendar size={16} />
              </div>
              {idx === 0 && (
                <span className="text-[10px] uppercase tracking-wider text-[#60A5FA] bg-[#2563EB]/10 border border-[#60A5FA]/20 rounded-full px-2 py-0.5">
                  Current
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-[#EDEDED]" style={{ fontFamily: "Outfit, sans-serif" }}>
              {option.label}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-400 group-hover:text-[#60A5FA] transition-colors">
              View statement <ChevronRight size={14} />
            </p>
          </button>
        ))}
      </div>
      )}

      {/* Statement modal */}
      {activeOption && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1 md:p-2 text-left">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative flex flex-col w-[99vw] h-[99vh] md:w-[99vw] md:h-[99vh] max-w-none max-h-none bg-[#0E0E12] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#EDEDED] truncate" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Account Statement
                </h3>
                <p className="text-xs text-gray-400">{activeOption.label}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isLoading || !!error || !pdfUrl}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-[#EDEDED] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Printer size={16} /> <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isLoading || !!error || !pdfBlob}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={16} /> <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#121214] p-4 min-h-0">
              {error ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm max-w-md">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300">
                  <div className="w-8 h-8 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading statement…</p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  ref={iframeRef}
                  title="Account statement preview"
                  src={pdfUrl}
                  className="w-full flex-1 bg-white rounded-xl shadow-lg border-none"
                />
              ) : null}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
