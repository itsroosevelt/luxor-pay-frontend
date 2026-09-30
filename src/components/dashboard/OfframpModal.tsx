"use client";

import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useMerchant } from "@/context/MerchantContext";
import { auth } from "@/lib/firebase";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 768px) {
    align-items: center;
  }
`;

const Sheet = styled(motion.div)`
  position: relative;
  width: 100%;
  max-height: 95dvh;
  background: #0f0f0f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px 28px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    max-width: 540px;
    border-radius: 28px;
    max-height: 88vh;
  }

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -30%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.2), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

const DragHandle = styled.div`
  width: 36px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  margin: 12px auto 0;
  flex-shrink: 0;

  @media (min-width: 768px) {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media (min-width: 768px) {
    padding: 24px 28px 20px;
  }
`;

const Eyebrow = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #E2E8F0;
  display: block;
  margin-bottom: 4px;
`;

const ModalTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #ffffff;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

const Body = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 520px;
`;

const StateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 28px;
  gap: 14px;
  text-align: center;
`;

const SpinnerIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: #60a5fa;
`;

const StateLabel = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const StateDesc = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  line-height: 1.55;
  max-width: 300px;
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 20px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(16, 185, 129, 0.1);
  color: #60a5fa;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;

  &:hover {
    background: rgba(16, 185, 129, 0.22);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

const StyledIframe = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  min-height: 520px;
  transition: opacity 0.3s ease;
`;

// ─── MoonPay public key (safe to expose in browser) ───────────────────────────
const MOONPAY_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_MOONPAY_PUBLIC_KEY ?? "pk_test_W2O6PlGwF1pUtNQ4aeJlBMnwHOykacoN";

// ─── View states ──────────────────────────────────────────────────────────────
type ViewState = "signing" | "ready" | "iframe_loading" | "error";

// ─── Props ────────────────────────────────────────────────────────────────────
interface OfframpModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Live SOL balance to pre-fill the MoonPay sell widget */
  solBalance?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function OfframpModal({ isOpen, onClose, solBalance }: OfframpModalProps) {
  const { profile } = useMerchant();
  const [view, setView] = useState<ViewState>("signing");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * Build the MoonPay sell-widget URL and sign it server-side via
   * /api/moonpay/sign-url to avoid exposing the secret key in the browser.
   */
  const buildSignedUrl = useCallback(async () => {
    setView("signing");
    setSignedUrl(null);
    setErrorMsg(null);

    const walletAddress = profile?.merchantWallet ?? "";

    // Read the Firebase current user for low-friction pre-auth params
    const currentUser = auth.currentUser;

    // Build the query string params
    const params = new URLSearchParams();
    params.set("apiKey", MOONPAY_PUBLIC_KEY);
    params.set("baseCurrencyCode", "sol");

    // ── Low-friction: pre-fill the user's email so MoonPay sends an OTP
    //    instead of forcing a full account-creation flow.
    if (currentUser?.email) {
      params.set("email", currentUser.email);
    }

    // ── Link this MoonPay session to your internal user ID so returning
    //    customers are recognised without re-authenticating.
    if (currentUser?.uid) {
      params.set("externalCustomerId", currentUser.uid);
    }

    // Pre-fill the sell amount with the current SOL balance when available
    if (solBalance && parseFloat(solBalance) > 0) {
      params.set("baseCurrencyAmount", solBalance);
    }
    if (walletAddress) {
      params.set("refundWalletAddress", walletAddress);
    }

    const queryString = params.toString();

    try {
      // Ask the Next.js API route to sign the query string server-side
      const res = await fetch("/api/moonpay/sign-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryString }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Signing failed (${res.status})`);
      }

      const { signature } = await res.json();

      // Append the signature to the query string as required by MoonPay
      const finalUrl = `https://sell.moonpay.com?${queryString}&signature=${encodeURIComponent(signature)}`;
      setSignedUrl(finalUrl);
      setView("iframe_loading");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(message);
      setView("error");
    }
  }, [profile?.merchantWallet, solBalance]);

  // Trigger signing every time the modal opens
  useEffect(() => {
    if (isOpen) {
      buildSignedUrl();
    } else {
      // Reset on close so state is fresh next open
      setView("signing");
      setSignedUrl(null);
      setErrorMsg(null);
    }
  }, [isOpen, buildSignedUrl]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <Sheet
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="offramp-modal-title"
          >
            <DragHandle />

            {/* ── Header ── */}
            <Header>
              <div>
                <Eyebrow>Solana → Fiat</Eyebrow>
                <ModalTitle id="offramp-modal-title">Cash Out</ModalTitle>
                {solBalance && parseFloat(solBalance) > 0 && (
                  <p
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.45)",
                      margin: "4px 0 0",
                    }}
                  >
                    Available:{" "}
                    <span style={{ color: "#E2E8F0", fontWeight: 600, fontFamily: "monospace" }}>
                      {parseFloat(solBalance).toFixed(4)} SOL
                    </span>
                  </p>
                )}
              </div>
              <CloseButton
                onClick={onClose}
                aria-label="Close cash out modal"
                type="button"
              >
                <X size={18} />
              </CloseButton>
            </Header>

            {/* ── Body ── */}
            <Body>
              {/* Signing / initial loading state */}
              {(view === "signing" || view === "iframe_loading") && !signedUrl && (
                <StateContainer>
                  <SpinnerIcon size={30} />
                  <StateLabel>Connecting to MoonPay…</StateLabel>
                  <StateDesc>Preparing a secure session for your wallet.</StateDesc>
                </StateContainer>
              )}

              {/* Error state */}
              {view === "error" && (
                <StateContainer>
                  <AlertCircle size={30} color="#FCA5A5" />
                  <StateLabel style={{ color: "#FCA5A5" }}>
                    Failed to load widget
                  </StateLabel>
                  <StateDesc>
                    {errorMsg ?? "Could not start the MoonPay session. Please try again."}
                  </StateDesc>
                  <RetryButton onClick={buildSignedUrl} type="button">
                    <RefreshCw size={14} />
                    Retry
                  </RetryButton>
                </StateContainer>
              )}

              {/* MoonPay sell widget — rendered once we have a signed URL */}
              {signedUrl && (
                <>
                  {/* Loading overlay while iframe is painting */}
                  {view === "iframe_loading" && (
                    <StateContainer style={{ position: "absolute", inset: 0, zIndex: 2, background: "#0f0f0f" }}>
                      <SpinnerIcon size={28} />
                      <StateLabel>Loading MoonPay…</StateLabel>
                    </StateContainer>
                  )}
                  <StyledIframe
                    id="moonpay-offramp-iframe"
                    src={signedUrl}
                    allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
                    title="MoonPay Cash Out Widget"
                    style={{ opacity: view === "ready" ? 1 : 0 }}
                    onLoad={() => setView("ready")}
                    onError={() => {
                      setErrorMsg("The MoonPay widget failed to load.");
                      setView("error");
                    }}
                  />
                </>
              )}
            </Body>
          </Sheet>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
