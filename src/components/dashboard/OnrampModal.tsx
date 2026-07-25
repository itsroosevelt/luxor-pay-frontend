"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useOnrampSession } from "@/hooks/useOnrampSession";
import { useOnrampSocket } from "@/hooks/useOnrampSocket";



// ─── Keyframes ────────────────────────────────────────────────────────────────
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ─── Overlay ──────────────────────────────────────────────────────────────────
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
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
    max-width: 520px;
    border-radius: 28px;
    max-height: 90vh;
  }

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -30%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.12), transparent 70%);
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

// ─── Header ───────────────────────────────────────────────────────────────────
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

const HeaderLeft = styled.div``;

const Eyebrow = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  display: block;
  margin-bottom: 4px;
`;

const ModalTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
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
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

// ─── Body ─────────────────────────────────────────────────────────────────────
const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
`;

// ─── States ───────────────────────────────────────────────────────────────────
const StateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 28px;
  gap: 16px;
  text-align: center;
`;

const SpinnerIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: #60A5FA;
`;

const StateTitle = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const StateDesc = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
`;

const ErrorBox = styled.div`
  margin: 20px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const ErrorText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: #FCA5A5;
  margin: 0;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  height: 42px;
  padding: 0 24px;
  border-radius: 9999px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(37, 99, 235, 0.1);
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;

  &:hover {
    background: rgba(37, 99, 235, 0.2);
    border-color: rgba(96, 165, 250, 0.5);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const OpenTabButton = styled.a`
  height: 52px;
  padding: 0 28px;
  border-radius: 9999px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px -6px rgba(37, 99, 235, 0.5);
  margin-top: 12px;

  &:hover {
    box-shadow: 0 12px 32px -6px rgba(37, 99, 235, 0.7);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

// ─── View states ──────────────────────────────────────────────────────────────
type ModalView = "idle" | "loading" | "error" | "redirected" | "success";

// ─── Props ────────────────────────────────────────────────────────────────────
interface OnrampModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantWallet?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function OnrampModal({ isOpen, onClose, merchantWallet }: OnrampModalProps) {
  const [view, setView] = useState<ModalView>("idle");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const { createSession, errorMessage } = useOnrampSession();

  const { onrampPayload, startOnrampTracking } = useOnrampSocket();

  // ── Reset when modal opens/closes ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setView("idle");
      setRedirectUrl(null);
    }
  }, [isOpen]);

  // ── Start the onramp session & redirect ────────────────────────────────────
  const startSession = useCallback(async () => {
    if (!merchantWallet) return;

    const user = auth.currentUser;
    if (!user) return;

    setView("loading");
    setRedirectUrl(null);

    const session = await createSession(user.uid, merchantWallet);

    if (!session || !session.redirect_url) {
      setView("error");
      return;
    }

    setRedirectUrl(session.redirect_url);
    setView("redirected");
    startOnrampTracking(session.session_id);

    // Attempt to open the link in a new tab automatically
    window.open(session.redirect_url, "_blank");
  }, [merchantWallet, createSession, startOnrampTracking]);

  // ── Auto-start when modal opens ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && view === "idle") {
      startSession();
    }
  }, [isOpen, view, startSession]);

  // ── Sync with global onramp socket payload status ──────────────────────────
  useEffect(() => {
    if (isOpen && onrampPayload?.status === "fulfillment_complete") {
      setView("success");
    }
  }, [isOpen, onrampPayload]);

  return (
    <>

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
            >
              <DragHandle />

              {/* Header */}
              <Header>
                <HeaderLeft>
                  <Eyebrow>Fiat → Solana</Eyebrow>
                  <ModalTitle>Fund Your Wallet</ModalTitle>
                </HeaderLeft>
                <CloseButton onClick={onClose} aria-label="Close onramp modal">
                  <X size={18} />
                </CloseButton>
              </Header>

              {/* Body */}
              <Body>
                {/* Loading */}
                {view === "loading" && (
                  <StateContainer>
                    <SpinnerIcon size={32} />
                    <StateTitle>Connecting to Stripe…</StateTitle>
                    <StateDesc>
                      Creating a secure onramp session for your wallet. This takes just a moment.
                    </StateDesc>
                  </StateContainer>
                )}

                {/* Error */}
                {view === "error" && (
                  <StateContainer>
                    <ErrorBox>
                      <AlertCircle size={20} color="#FCA5A5" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <ErrorText>
                          {errorMessage ?? "Something went wrong creating the onramp session."}
                        </ErrorText>
                        <RetryButton onClick={startSession} id="onramp-retry-btn" type="button">
                          Try again
                        </RetryButton>
                      </div>
                    </ErrorBox>
                  </StateContainer>
                )}

                {/* Redirected / Standalone window opened */}
                {view === "redirected" && (
                  <StateContainer>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "rgba(96, 165, 250, 0.1)",
                        border: "1px solid rgba(96, 165, 250, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#60A5FA",
                      }}
                    >
                      <Loader2 className="animate-spin" size={24} />
                    </div>
                    <StateTitle>Redirecting to Stripe Onramp</StateTitle>
                    <StateDesc>
                      Please complete the verification and purchase in the new tab. 
                      Once done, this page will update automatically.
                    </StateDesc>
                    {redirectUrl && (
                      <OpenTabButton href={redirectUrl} target="_blank" rel="noopener noreferrer">
                        <span>Reopen Stripe Onramp</span>
                        <ExternalLink size={16} />
                      </OpenTabButton>
                    )}
                  </StateContainer>
                )}

                {/* Success (WebSocket Event received) */}
                {view === "success" && (
                  <StateContainer>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        background: "rgba(34, 197, 94, 0.12)",
                        border: "1px solid rgba(34, 197, 94, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#4ADE80",
                      }}
                    >
                      <CheckCircle2 size={30} />
                    </div>
                    <StateTitle style={{ color: "#4ADE80" }}>Onramp Session Confirmed!</StateTitle>
                    <StateDesc>
                      Stripe successfully confirmed the transaction. Your SOL funds are currently being delivered to your Solana wallet on-chain.
                    </StateDesc>
                    <RetryButton
                      onClick={onClose}
                      style={{
                        marginTop: 12,
                        background: "#FFFFFF",
                        color: "#000000",
                        border: "none",
                      }}
                    >
                      Close Window
                    </RetryButton>
                  </StateContainer>
                )}
              </Body>
            </Sheet>
          </Overlay>
        )}
      </AnimatePresence>
    </>
  );
}

