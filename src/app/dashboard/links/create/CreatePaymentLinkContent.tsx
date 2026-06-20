'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Currency, PaymentLink, ProductCatalogItem } from '@luxor/contracts';
import { auth } from '@/lib/firebase';
import { createPaymentLink, updateMerchantProfile, listProducts, createProduct } from '@/lib/platform/merchant-data';
import { getPaymentLinkPublicUrl } from '@/lib/payment-link-utils';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { useGetBalance } from '@/hooks/useGetBalance';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaymentLinkEditor,
  defaultPaymentLinkEditorValues,
  editorValuesToPaymentLinkInput,
  type PaymentLinkEditorValues,
} from '@/components/dashboard/PaymentLinkEditor';
import { CheckoutPreviewFrame } from '@/features/checkout/components/CheckoutPreviewFrame';
import { PaymentLinkCheckoutView } from '@/features/checkout/components/PaymentLinkCheckoutView';

import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Wallet,
  Calendar,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Sparkles,
  Loader2,
  Copy,
  Package,
  Users,
  Monitor,
  Smartphone,
} from 'lucide-react';

// Hooks
import { useGetContacts } from '@/hooks/useGetContacts';
import { useCreateContact } from '@/hooks/useCreateContact';
import { useUpdateContact } from '@/hooks/useUpdateContact';
import { useDeleteContact } from '@/hooks/useDeleteContact';

// Interfaces
interface SimulatedRecipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletAddress: string;
  enrollmentName: string;
}



// Styled Components following Brand Rules
const Container = styled.div`
  min-height: 100vh;
  background: #0A0A0A;
  color: #EDEDED;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #EDEDED;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #60A5FA;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
`;

const ContentLayout = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 360px;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// Glass Card base following rules
const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 40px -8px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
`;

const SectionHeader = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Accordion styling for Quick Help
const AccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const AccordionHeader = styled.button`
  width: 100%;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  padding: 8px 0;
  cursor: pointer;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #60A5FA;
  }
`;

const AccordionContent = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 8px 0 0 0;
  font-weight: 300;
`;

// UI Elements for Step 1
const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 14px 20px 14px 48px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
`;

const PrimaryButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 14px;
  background: #FFFFFF;
  color: #000000;
  border: none;
  border-radius: 9999px;
  padding: 12px 28px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 14px;
  background: transparent;
  color: #60A5FA;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 12px 28px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Recents Section
const RecentsRow = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 0;
  margin-bottom: 8px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const RecentAvatarItem = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
`;

const AvatarCircle = styled.div<{ $colorSeed?: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid rgba(96, 165, 250, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #60A5FA;
  transition: all 0.2s;

  ${RecentAvatarItem}:hover & {
    border-color: #60A5FA;
    transform: scale(1.05);
    box-shadow: 0 0 12px rgba(96, 165, 250, 0.4);
  }
`;

const RecentName = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const RecentEmail = styled.span`
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

// Recipients List
const RecipientListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
`;

const AddContactLink = styled.button`
  background: none;
  border: none;
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;

  &:hover {
    color: #2563EB;
  }
`;

const ContactTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
`;

const RowAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #EDEDED;
  flex-shrink: 0;
`;

const ContactMeta = styled.div`
  min-width: 0;
`;

const ContactName = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
`;

const ContactEmail = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContactActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
  }
`;

const PayButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 13px;
  background: #2563EB;
  color: #FFFFFF;
  border: none;
  border-radius: 9999px;
  padding: 8px 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #60A5FA;
  }
`;

// Modal Form styling for Contacts
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalBox = styled(motion.div)`
  background: #0F0F12;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 32px;
  width: 100%;
  max-width: 440px;
  padding: 32px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px;
  &:hover {
    color: #FFFFFF;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
`;

const FormInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 12px 18px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

// Step 2 Form elements
const SelectedRecipientCard = styled.div`
  background: rgba(96, 165, 250, 0.05);
  border: 1px solid rgba(96, 165, 250, 0.15);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const CustomDropdown = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const DropdownTrigger = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 16px 24px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: #0F0F12;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.8);
  z-index: 20;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 14px 20px;
  color: #FFFFFF;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const AmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const AmountInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 24px;
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #60A5FA;
`;

const BigAmountInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 18px 24px 18px 56px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  transition: all 0.2s;

  &:focus-visible {
    outline: none;
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }
`;

const FormToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
  margin-bottom: 24px;
`;

const ToggleSwitch = styled.button<{ $checked: boolean }>`
  width: 50px;
  height: 28px;
  border-radius: 14px;
  background: ${({ $checked }) => ($checked ? '#2563EB' : 'rgba(255,255,255,0.1)')};
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $checked }) => ($checked ? '25px' : '3px')};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #FFFFFF;
    transition: left 0.2s;
  }
`;

const WalletControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PrivacyToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  transition: color 0.2s;

  &:hover {
    color: #60A5FA;
  }
`;

// Receipt Summary Components for Review
const ReceiptCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReceiptRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ReceiptLabel = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Outfit', sans-serif;
`;

const ReceiptValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  text-align: right;
  max-width: 65%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionFooter = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

// Transaction lifecycle animations / status overlay
const TransactionOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.95);
  z-index: 150;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const TxStatusBox = styled.div`
  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60A5FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const TxStepText = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
`;

const TxStepDesc = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
`;

const SetupWalletPrompt = styled.div`
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin-top: 12px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// Mode selector tabs
const ModeRow = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 4px;
  width: 100%;
  max-width: 480px;
  margin: 16px auto 0;
`;

const ModeBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  ${({ $active }) => $active
    ? `background: #FFFFFF; color: #000000;`
    : `background: transparent; color: rgba(255,255,255,0.5); &:hover { color: #FFFFFF; }`
  }
`;

// Product form elements
const ProductFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CurrencyToggleRow = styled.div`
  display: flex;
  gap: 8px;
`;

const CurrencyPill = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 9999px;
  border: 1px solid ${({ $active }) => $active ? '#60A5FA' : 'rgba(255,255,255,0.1)'};
  background: ${({ $active }) => $active ? 'rgba(96,165,250,0.1)' : 'transparent'};
  color: ${({ $active }) => $active ? '#60A5FA' : 'rgba(255,255,255,0.5)'};
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

// Success state
const SuccessBox = styled(motion.div)`
  background: rgba(16, 185, 129, 0.04);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 28px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

const ShareUrlRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
  padding: 12px 16px;
  overflow: hidden;
`;

const ShareUrlText = styled.code`
  flex: 1;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
`;

const RecipientNoticeRow = styled.div`
  width: 100%;
  background: rgba(96,165,250,0.05);
  border: 1px solid rgba(96,165,250,0.15);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
`;

// Stripe-like product page layout
const ProductPageLayout = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  min-height: 600px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  overflow: hidden;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const ProductFormPanel = styled.div`
  padding: 28px 24px;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  max-height: 80vh;
  @media (max-width: 900px) { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: none; }
`;

const ProductPreviewPanel = styled.div`
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0,0,0,0.15);
`;

const TypeSelector = styled.select`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 9999px;
  padding: 10px 20px;
  color: rgba(255,255,255,0.9);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  cursor: pointer;
  width: auto;
  display: inline-block;
`;

const ProductTabRow = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 4px;
`;

const ProductTabBtn = styled.button<{ $active: boolean }>`
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${({ $active }) => $active ? '#FFFFFF' : 'rgba(255,255,255,0.4)'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#60A5FA' : 'transparent'};
  margin-bottom: -1px;
  transition: all 0.2s;
`;

const ProductSectionTitle = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 10px;
`;

const OptionRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255,255,255,0.8);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  user-select: none;
  &:last-child { border-bottom: none; }
  input[type="checkbox"] {
    width: 16px; height: 16px;
    accent-color: #60A5FA;
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const AdvancedToggleBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255,255,255,0.45);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  transition: color 0.2s;
  &:hover { color: rgba(255,255,255,0.8); }
`;

const PreviewTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PreviewTitle = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
`;

const PreviewToggleRow = styled.div`
  display: flex;
  gap: 4px;
`;

const PreviewToggleBtn = styled.button<{ $active: boolean }>`
  padding: 6px 8px;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'rgba(255,255,255,0.1)' : 'transparent'};
  color: ${({ $active }) => $active ? '#FFFFFF' : 'rgba(255,255,255,0.35)'};
  cursor: pointer;
  transition: all 0.2s;
`;

const TypeLabelText = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
  margin: 0;

  /* Ocultar el encabezado duplicado del PaymentLinkEditor */
  & > form > div:first-child {
    display: none;
  }
`;

export function CreatePaymentLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile: merchantProfile, merchantWallet, hasWallet, isLoading, authReady } = useMerchantProfile({
    refreshOnFocus: true,
  });

  // Real balance from merchant's configured wallet
  const { data: balanceData, isLoading: isLoadingBalance, isPrivacyMode, togglePrivacyMode } = useGetBalance(
    merchantWallet || null
  );

  // Real Contacts Hooks
  const { data: contactsData, isLoading: loadingContacts, refetch: refetchContacts } = useGetContacts();
  const { mutate: createMutate, isLoading: isCreating } = useCreateContact();
  const { mutate: updateMutate, isLoading: isUpdating } = useUpdateContact();
  const { mutate: deleteMutate, isLoading: isDeleting } = useDeleteContact();

  // State Variables
  const [step, setStep] = useState<number>(1);
  const [selectedRecipient, setSelectedRecipient] = useState<SimulatedRecipient | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Transaction Configuration state
  const [amount, setAmount] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [isCreatingLink, setIsCreatingLink] = useState<boolean>(false);

  // Mode: 'product' = simple product link, 'contact' = send to contact wizard
  const [mode, setMode] = useState<'product' | 'contact'>('product');

  // Product link form state
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productCurrency, setProductCurrency] = useState<Currency>('USDC');
  const [productAmount, setProductAmount] = useState<string>('');

  // Product link options (maps to PaymentLink fields)
  const [productCollectName, setProductCollectName] = useState(false);
  const [productCollectCompany, setProductCollectCompany] = useState(false);
  const [productCollectAddress, setProductCollectAddress] = useState(false);
  const [productCollectPhone, setProductCollectPhone] = useState(false);
  const [productCollectEmail, setProductCollectEmail] = useState(true);
  const [productCollectTaxes, setProductCollectTaxes] = useState(false);
  const [productLimitPayments, setProductLimitPayments] = useState(false);
  const [productSuccessMessage, setProductSuccessMessage] = useState('');
  const [productRedirectUrl, setProductRedirectUrl] = useState('');
  const [productTab, setProductTab] = useState<'page' | 'after'>('page');
  const [productPreviewMode, setProductPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Created link result (for success step)
  const [createdLinkId, setCreatedLinkId] = useState<string | null>(null);
  const [createdLinkUrl, setCreatedLinkUrl] = useState<string>('');

  // Product list for catalog options
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);

  // Fetch products for catalog options on start
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !authReady) return;
    void listProducts(user.uid)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [authReady]);

  // initialValues and handleSave for product link mode (copied from main)
  const initialValues = useMemo((): PaymentLinkEditorValues => {
    const name = searchParams.get('name')?.trim() ?? '';
    const amount = searchParams.get('amount')?.trim() ?? '';
    const currency = searchParams.get('currency') === 'SOL' ? 'SOL' : 'USDC';
    const productId = searchParams.get('productId')?.trim();

    const fromProduct =
      productId && products.length > 0
        ? products.find((p) => p.id === productId)
        : undefined;

    return {
      ...defaultPaymentLinkEditorValues,
      ...(fromProduct
        ? {
            name: fromProduct.name,
            amount: String(fromProduct.price),
            currency: fromProduct.currency,
          }
        : {}),
      ...(name ? { name } : {}),
      ...(amount ? { amount } : {}),
      currency: fromProduct?.currency ?? currency,
    };
  }, [searchParams, products]);

  const handleSaveProductLink = async (values: PaymentLinkEditorValues) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Inicia sesión para crear enlaces de pago');
      return;
    }

    const input = editorValuesToPaymentLinkInput(values);
    if (!input.name || Number.isNaN(input.amount) || input.amount <= 0) {
      toast.error('Ingresa un nombre de producto y un monto válido');
      return;
    }

    if (values.redirectUrl.trim()) {
      try {
        new URL(values.redirectUrl.trim());
      } catch {
        toast.error('Ingresa una URL de redirección válida o déjala vacía');
        return;
      }
    }

    if (!hasWallet) {
      toast.error('Configura tu wallet de Solana en Ajustes y pulsa «Guardar cambios» primero');
      return;
    }

    setIsCreatingLink(true);
    try {
      // Auto-create product in catalog if it does not exist
      const productExists = products.some(
        (p) => p.name.toLowerCase() === input.name.toLowerCase() && p.price === input.amount && p.currency === input.currency
      );
      if (!productExists) {
        try {
          await createProduct(user.uid, {
            name: input.name,
            price: input.amount,
            currency: input.currency as Currency,
            active: true,
          });
        } catch (e) {
          console.error('Failed to auto-create product in catalog', e);
        }
      }

      const link = await createPaymentLink(user.uid, input);
      toast.success('Enlace de pago creado');
      router.push(`/dashboard/links/${link.id}`);
    } catch (err) {
      if (err instanceof Error && err.message === 'MERCHANT_WALLET_REQUIRED') {
        toast.error('Configura tu wallet de Solana en Ajustes y pulsa «Guardar cambios» primero');
      } else {
        toast.error(getFirestoreErrorMessage(err, 'No se pudo crear el enlace de pago'));
      }
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Contact Creation / Edition Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<SimulatedRecipient | null>(null);
  const [contactFormName, setContactFormName] = useState<string>('');
  const [contactFormEmail, setContactFormEmail] = useState<string>('');
  const [contactFormPhone, setContactFormPhone] = useState<string>('');
  const [contactFormEnrollment, setContactFormEnrollment] = useState<string>('');

  // Temporary Custom Wallet for user
  const [tempWalletAddress, setTempWalletAddress] = useState<string>('');
  const [savingTempWallet, setSavingTempWallet] = useState<boolean>(false);

  // Quick Help accordion active index
  const [activeHelpIndex, setActiveHelpIndex] = useState<number | null>(0);

  // Initialize Recipients from Real Contacts retrieved from Backend
  const recipients = useMemo((): SimulatedRecipient[] => {
    if (!contactsData?.data || !Array.isArray(contactsData.data)) return [];
    return contactsData.data.map(c => ({
      id: c.id,
      name: c.nickname || 'Sin nombre',
      email: c.email || '',
      phone: c.telephone || '',
      walletAddress: c.walletAddress || '',
      enrollmentName: c.nickname ? c.nickname.toUpperCase() : 'CONTACTO',
    }));
  }, [contactsData]);

  // Set today's date on start
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: any = today.getMonth() + 1;
    let dd: any = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    setPaymentDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const merchantDisplayName = merchantProfile?.businessName?.trim() || 'Luxor Pay';

  // Real wallet data from merchant profile + on-chain balance
  const solBalance = balanceData?.solBalance ?? '0';
  const usdcToken = balanceData?.tokens.find(t => t.symbol === 'USDC');
  const usdcBalance = usdcToken?.uiAmount ?? '0';
  const walletShort = merchantWallet
    ? `${merchantWallet.slice(0, 4)}...${merchantWallet.slice(-4)}`
    : '----';

  // Derive selected currency from the wallet's available balances
  // Default to USDC if available, fallback to SOL
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USDC');

  const activeWalletObj = useMemo(() => {
    if (selectedCurrency === 'SOL') {
      return {
        id: 'sol',
        name: `Wallet Solana - ${walletShort}`,
        balance: isLoadingBalance ? '…' : `${solBalance} SOL`,
        currency: 'SOL' as Currency,
      };
    }
    return {
      id: 'usdc',
      name: `Wallet USDC - ${walletShort}`,
      balance: isLoadingBalance ? '…' : `${usdcBalance} USDC`,
      currency: 'USDC' as Currency,
    };
  }, [selectedCurrency, solBalance, usdcBalance, walletShort, isLoadingBalance]);

  // Recipient filtering
  const filteredRecipients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter(
      r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q)
    );
  }, [recipients, searchQuery]);

  // Quick Help data
  const helpItems = [
    {
      q: '¿Cómo cobro usando el enlace generado?',
      a: 'Una vez finalizado el asistente, copia el enlace resultante y compártelo. El destinatario podrá pagarte escaneando el código QR o vinculando su wallet.'
    },
    {
      q: '¿Dónde configuro mi wallet de retiro?',
      a: 'Puedes enlazar tu wallet Solana en el apartado Ajustes. Los cobros que recibas a través de los enlaces irán directo a tu clave pública.'
    },
    {
      q: '¿Hay comisiones por enlaces creados?',
      a: 'No cobramos tarifas fijas por crear enlaces. La red Solana aplica comisiones de gas mínimas (menos de $0.001 USD) por transacción.'
    },
    {
      q: '¿Qué divisas acepta Luxor Pay?',
      a: 'Puedes crear enlaces de cobro en SOL o USDC. El destinatario paga directamente desde su wallet on-chain a tu dirección registrada en Solana.'
    }
  ];

  // Handler for Real Contact save
  const handleSaveContact = async () => {
    if (!contactFormName.trim()) {
      toast.error('El nombre/nickname es requerido');
      return;
    }

    const mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC Mint on Solana

    const payload = {
      nickname: contactFormName.trim(),
      email: contactFormEmail.trim() || undefined,
      telephone: contactFormPhone.trim() || undefined,
      walletAddress: editingContact?.walletAddress || '',
      mint: mint,
    };

    if (editingContact) {
      const outcome = await updateMutate(editingContact.id, payload);
      if (outcome) {
        toast.success('Contacto actualizado en la base de datos');
        await refetchContacts();
        setIsContactModalOpen(false);
        setEditingContact(null);
      } else {
        toast.error('No se pudo actualizar el contacto');
      }
    } else {
      const outcome = await createMutate(payload);
      if (outcome) {
        toast.success('Contacto creado en la base de datos');
        await refetchContacts();
        setIsContactModalOpen(false);
      } else {
        toast.error('No se pudo crear el contacto');
      }
    }

    setContactFormName('');
    setContactFormEmail('');
    setContactFormPhone('');
    setContactFormEnrollment('');
  };

  const handleEditContactClick = (c: SimulatedRecipient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContact(c);
    setContactFormName(c.name);
    setContactFormEmail(c.email);
    setContactFormPhone(c.phone);
    setContactFormEnrollment(c.enrollmentName);
    setIsContactModalOpen(true);
  };

  const handleDeleteContactClick = async (c: SimulatedRecipient, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = window.confirm(`¿Seguro que deseas eliminar a "${c.name}" de tus contactos?`);
    if (!confirm) return;

    try {
      await deleteMutate(c.id);
      toast.success('Contacto eliminado');
      await refetchContacts();
      if (selectedRecipient?.id === c.id) {
        setSelectedRecipient(null);
      }
    } catch {
      toast.error('No se pudo eliminar el contacto');
    }
  };

  const handlePayRecipient = (recipient: SimulatedRecipient) => {
    setSelectedRecipient(recipient);
    setStep(2);
  };

  const handleSearchPay = () => {
    const q = searchQuery.trim();
    if (!q) {
      toast.error('Ingresa un contacto o correo');
      return;
    }

    // Try matching existing contact
    const match = recipients.find(
      r => r.name.toLowerCase() === q.toLowerCase() || r.email.toLowerCase() === q.toLowerCase()
    );

    if (match) {
      handlePayRecipient(match);
    } else {
      // Prompt user to add contact if search has no exact matches
      setContactFormName(q.includes('@') ? q.split('@')[0] : q);
      setContactFormEmail(q.includes('@') ? q : '');
      setContactFormPhone('');
      setEditingContact(null);
      setIsContactModalOpen(true);
      toast.info('Completa los campos para registrar el destinatario');
    }
  };

  // Input sanitizer for amount
  const handleAmountChange = (val: string) => {
    let clean = val.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimals
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    // Limit decimals based on token
    const maxDecimals = activeWalletObj.currency === 'SOL' ? 9 : 6;
    if (parts[1] && parts[1].length > maxDecimals) {
      clean = `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
    }

    setAmount(clean);
  };

  // Settings mock wallet address if not configured
  const handleSaveTempWallet = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Inicia sesión para guardar la clave');
      return;
    }

    const addr = tempWalletAddress.trim();
    if (!addr || addr.length < 32) {
      toast.error('Ingresa una dirección de Solana válida (mínimo 32 caracteres)');
      return;
    }

    setSavingTempWallet(true);
    try {
      await updateMerchantProfile(user.uid, { merchantWallet: addr });
      toast.success('Billetera de simulación vinculada');
      setTempWalletAddress('');
    } catch (e) {
      toast.error(getFirestoreErrorMessage(e, 'No se pudo guardar la billetera'));
    } finally {
      setSavingTempWallet(false);
    }
  };

  // Create product payment link
  const handleCreateProductLink = async () => {
    const user = auth.currentUser;
    if (!user) { toast.error('Inicia sesión para continuar.'); return; }
    if (!productName.trim()) { toast.error('El nombre del producto/servicio es requerido.'); return; }
    const numericAmount = parseFloat(productAmount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) { toast.error('El monto debe ser mayor a 0.'); return; }

    setIsCreatingLink(true);
    try {
      const link = await createPaymentLink(user.uid, {
        name: productName.trim(),
        amount: numericAmount,
        currency: productCurrency,
        active: true,
      });
      const url = getPaymentLinkPublicUrl(link);
      setCreatedLinkId(link.id);
      setCreatedLinkUrl(url);
      toast.success('¡Enlace de cobro generado!');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo crear el enlace.'));
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Create contact-based payment link (step 4 → step 5)
  const handleCreatePaymentLink = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Inicia sesión para crear enlaces de pago');
      return;
    }

    if (!hasWallet) {
      toast.error('Debes vincular una billetera de Solana en Ajustes para continuar.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    setIsCreatingLink(true);
    try {
      const recipientName = selectedRecipient?.name || 'Contacto';
      const link = await createPaymentLink(user.uid, {
        name: `Cobro a ${recipientName} — ${amount} ${activeWalletObj.currency}`,
        amount: numericAmount,
        currency: activeWalletObj.currency,
        active: true,
      });
      const url = getPaymentLinkPublicUrl(link);
      setCreatedLinkId(link.id);
      setCreatedLinkUrl(url);
      setStep(5); // go to success step
      toast.success('¡Enlace de cobro creado!');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo crear el enlace de pago.'));
    } finally {
      setIsCreatingLink(false);
    }
  };

  if (!authReady || isLoading) {
    return (
      <Container>
        <Header>
          <Title>Cargando…</Title>
        </Header>
        <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Cargando perfil…</p>
      </Container>
    );
  }

  return (
    <Container>

      {/* Main Wizard Header with back and exit buttons */}
      <Header>
        {mode === 'contact' && step > 1 ? (
          <BackBtn onClick={() => setStep(step - 1)} aria-label="Atrás">
            <ArrowLeft size={16} />
          </BackBtn>
        ) : (
          <BackBtn onClick={() => router.push('/dashboard/links')} aria-label="Cerrar y regresar">
            <X size={16} />
          </BackBtn>
        )}
        <Title>
          {mode === 'product' && (createdLinkId ? '¡Enlace Generado!' : 'Nuevo Enlace de Cobro')}
          {mode === 'contact' && step === 1 && 'Enviar a Contacto'}
          {mode === 'contact' && step === 2 && 'Monto de Envío'}
          {mode === 'contact' && step === 3 && 'Fecha de Pago'}
          {mode === 'contact' && step === 4 && 'Confirmar Envío'}
          {mode === 'contact' && step === 5 && '¡Enlace Listo!'}
        </Title>
      </Header>

      {/* Mode selector — only show on first step and if no link created yet */}
      {!createdLinkId && (step <= 1) && (
        <ModeRow>
          <ModeBtn $active={mode === 'product'} onClick={() => { setMode('product'); setStep(1); setCreatedLinkId(null); setCreatedLinkUrl(''); }}>
            <Package size={15} />
            Enlace de Producto
          </ModeBtn>
          <ModeBtn $active={mode === 'contact'} onClick={() => { setMode('contact'); setStep(1); setCreatedLinkId(null); setCreatedLinkUrl(''); }}>
            <Users size={15} />
            Enviar a Contacto
          </ModeBtn>
        </ModeRow>
      )}

      {mode === 'product' && (
        <EditorWrapper>
          <PaymentLinkEditor
            key={`${searchParams.toString()}:${products.length}`}
            mode="create"
            layout="drawer"
            initialValues={initialValues}
            products={products}
            initialProductId={searchParams.get('productId')}
            merchantName={merchantDisplayName}
            merchantProfile={merchantProfile}
            saving={isCreatingLink}
            onSave={handleSaveProductLink}
            onCancel={() => router.push('/dashboard/links')}
          />
        </EditorWrapper>
      )}

      {mode === 'contact' && (
        <ContentLayout>
          <FormSection>
          {/* STEP 1: Recipient Search and Table */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <GlassCard>
                <SectionHeader>¿A quién te gustaría pagar?</SectionHeader>
                <SearchWrapper>
                  <SearchIconWrapper>
                    <Search size={18} />
                  </SearchIconWrapper>
                  <SearchInput
                    type="text"
                    placeholder="Ingresa nombre, correo o número de teléfono..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPay()}
                  />
                  <PrimaryButton onClick={handleSearchPay}>Pagar</PrimaryButton>
                </SearchWrapper>
              </GlassCard>

              {/* Recents list from real contacts */}
              {recipients.length > 0 && (
                <GlassCard>
                  <SectionHeader>Recientes</SectionHeader>
                  <RecentsRow>
                    {recipients.slice(0, 4).map((r) => (
                      <RecentAvatarItem key={r.id} onClick={() => handlePayRecipient(r)}>
                        <AvatarCircle>
                          {r.name.slice(0, 2).toUpperCase()}
                        </AvatarCircle>
                        <RecentName>{r.name}</RecentName>
                        <RecentEmail>{r.email || r.phone || 'Sin datos'}</RecentEmail>
                      </RecentAvatarItem>
                    ))}
                  </RecentsRow>
                </GlassCard>
              )}

              {/* All contacts */}
              <GlassCard>
                <RecipientListHeader>
                  <SectionHeader style={{ marginBottom: 0 }}>Destinatarios</SectionHeader>
                  <AddContactLink onClick={() => router.push('/dashboard/contacts?create=true&returnTo=/dashboard/links/create')}>
                    <Plus size={16} />
                    Agregar destinatario
                  </AddContactLink>
                </RecipientListHeader>

                {loadingContacts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-[#60A5FA]" size={24} />
                  </div>
                ) : filteredRecipients.length === 0 ? (
                  <div className="text-center py-8 text-[var(--dash-muted)] text-sm">
                    {searchQuery ? 'No se encontraron destinatarios con tu búsqueda.' : 'No tienes ningún contacto registrado. Haz clic en "Agregar destinatario" arriba para registrar uno.'}
                  </div>
                ) : (
                  <ContactTable>
                    {filteredRecipients.map((r) => (
                      <ContactRow key={r.id}>
                        <ContactInfo>
                          <RowAvatar>{r.name.slice(0, 2).toUpperCase()}</RowAvatar>
                          <ContactMeta>
                            <ContactName>{r.name}</ContactName>
                            <ContactEmail>
                              {r.email && `Correo: ${r.email}`}
                              {r.email && r.phone && ' | '}
                              {r.phone && `Tel: ${r.phone}`}
                              {!r.email && !r.phone && 'Sin datos de contacto'}
                            </ContactEmail>
                          </ContactMeta>
                        </ContactInfo>
                        <ContactActions>
                          <ActionIconButton onClick={(e) => handleEditContactClick(r, e)} aria-label="Editar">
                            <Edit2 size={14} />
                          </ActionIconButton>
                          <ActionIconButton onClick={(e) => handleDeleteContactClick(r, e)} aria-label="Eliminar">
                            <Trash2 size={14} />
                          </ActionIconButton>
                          <PayButton onClick={() => handlePayRecipient(r)}>Pagar</PayButton>
                        </ContactActions>
                      </ContactRow>
                    ))}
                  </ContactTable>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 2: Source wallet and Amount configuration */}
          {step === 2 && selectedRecipient && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard>
                <SectionHeader>Configura tu Envío</SectionHeader>
                <SelectedRecipientCard>
                  <AvatarCircle style={{ width: 44, height: 44, fontSize: 15 }}>
                    {selectedRecipient.name.slice(0, 2).toUpperCase()}
                  </AvatarCircle>
                  <div>
                    <div className="text-sm font-semibold text-white">{selectedRecipient.name}</div>
                    <div className="text-xs text-[var(--dash-muted)] mt-0.5">
                      {selectedRecipient.email && `Correo: ${selectedRecipient.email}`}
                      {selectedRecipient.email && selectedRecipient.phone && ' | '}
                      {selectedRecipient.phone && `Tel: ${selectedRecipient.phone}`}
                    </div>
                  </div>
                </SelectedRecipientCard>

                {/* From Account selector */}
                <CustomDropdown>
                  <WalletControlRow>
                    <FormLabel>DESDE *</FormLabel>
                    <PrivacyToggle onClick={togglePrivacyMode}>
                      {isPrivacyMode ? <EyeOff size={13} /> : <Eye size={13} />}
                      {isPrivacyMode ? 'Mostrar saldos' : 'Modo Privacidad'}
                    </PrivacyToggle>
                  </WalletControlRow>
                  <DropdownTrigger type="button" onClick={() => setSelectedCurrency(selectedCurrency === 'USDC' ? 'SOL' : 'USDC')}>
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-[#60A5FA]" />
                      <span>
                        {activeWalletObj.name} ({isPrivacyMode ? '***' : activeWalletObj.balance})
                      </span>
                    </div>
                    <ChevronDown size={16} />
                  </DropdownTrigger>
                  <DropdownList style={{ position: 'static', marginTop: 0, boxShadow: 'none', border: 'none' }}>
                    {(['USDC', 'SOL'] as Currency[]).map((cur) => (
                      <DropdownItem
                        key={cur}
                        type="button"
                        onClick={() => setSelectedCurrency(cur)}
                        style={selectedCurrency === cur ? { background: 'rgba(96,165,250,0.08)' } : {}}
                      >
                        <span className="font-medium">{cur === 'USDC' ? `Wallet USDC - ${walletShort}` : `Wallet Solana - ${walletShort}`}</span>
                        <span className="text-xs text-[var(--dash-muted)] font-mono">
                          {isPrivacyMode ? '***' : cur === 'USDC' ? `${usdcBalance} USDC` : `${solBalance} SOL`}
                        </span>
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </CustomDropdown>

                {/* Amount input */}
                <AmountWrapper>
                  <FormLabel>MONTO *</FormLabel>
                  <AmountInputContainer>
                    <CurrencySymbol>
                      {activeWalletObj.currency === 'SOL' ? 'SOL' : '$'}
                    </CurrencySymbol>
                    <BigAmountInput
                      type="text"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                  </AmountInputContainer>
                </AmountWrapper>

                {/* Recurring configuration */}
                <FormToggleWrapper>
                  <div>
                    <div className="text-sm font-semibold text-white">¿Hacer pago recurrente?</div>
                    <div className="text-xs text-[var(--dash-muted)] mt-0.5">
                      Configura envíos periódicos automáticos
                    </div>
                  </div>
                  <ToggleSwitch
                    type="button"
                    $checked={isRecurring}
                    onClick={() => setIsRecurring(!isRecurring)}
                  />
                </FormToggleWrapper>

                <div className="text-xs text-[var(--dash-muted)] mb-6 flex items-center gap-2">
                  <HelpCircle size={14} className="text-[#60A5FA]" />
                  <a href="#" className="hover:underline">Aprende cómo funcionan los límites de Luxor Pay</a>
                </div>

                <ActionFooter>
                  <SecondaryButton style={{ flex: 1 }} onClick={() => setStep(1)}>Cancelar</SecondaryButton>
                  <PrimaryButton
                    style={{ flex: 1 }}
                    disabled={!amount || parseFloat(amount) <= 0}
                    onClick={() => setStep(3)}
                  >
                    Siguiente
                  </PrimaryButton>
                </ActionFooter>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 3: Choose date */}
          {step === 3 && selectedRecipient && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard>
                <SectionHeader>Elige una Fecha</SectionHeader>
                <FormField>
                  <FormLabel>FECHA DE TRANSACCIÓN *</FormLabel>
                  <div className="relative">
                    <FormInput
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full pl-12"
                      style={{ paddingLeft: '48px' }}
                    />
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none" />
                  </div>
                  <p className="text-xs text-[var(--dash-muted)] mt-2 leading-relaxed">
                    Las fechas de transacción se basan en el huso horario Eastern Time. Las fechas del calendario pueden no coincidir con tu zona horaria local.
                  </p>
                </FormField>

                <ActionFooter style={{ marginTop: '32px' }}>
                  <SecondaryButton style={{ flex: 1 }} onClick={() => setStep(2)}>Atrás</SecondaryButton>
                  <PrimaryButton
                    style={{ flex: 1 }}
                    disabled={!paymentDate}
                    onClick={() => setStep(4)}
                  >
                    Siguiente
                  </PrimaryButton>
                </ActionFooter>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 4: Review and Submit */}
          {step === 4 && selectedRecipient && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard>
                <SectionHeader>Revisar y Confirmar</SectionHeader>
                <p className="text-xs text-[var(--dash-muted)] mb-4">
                  Confirma que todos los detalles sean correctos antes de generar tu enlace de cobro.
                </p>

                <ReceiptCard>
                  <ReceiptRow>
                    <ReceiptLabel>Destinatario (To)</ReceiptLabel>
                    <ReceiptValue>{selectedRecipient.name}</ReceiptValue>
                  </ReceiptRow>
                  <ReceiptRow>
                    <ReceiptLabel>Email / Tag</ReceiptLabel>
                    <ReceiptValue>{selectedRecipient.email || 'No registrado'}</ReceiptValue>
                  </ReceiptRow>
                  <ReceiptRow>
                    <ReceiptLabel>Teléfono de Notificación</ReceiptLabel>
                    <ReceiptValue>{selectedRecipient.phone || 'No registrado'}</ReceiptValue>
                  </ReceiptRow>
                  <ReceiptRow>
                    <ReceiptLabel>Cuenta Origen (From)</ReceiptLabel>
                    <ReceiptValue>{activeWalletObj.name}</ReceiptValue>
                  </ReceiptRow>
                  <ReceiptRow>
                    <ReceiptLabel>Monto</ReceiptLabel>
                    <ReceiptValue style={{ fontWeight: 600, color: '#60A5FA', fontSize: 16 }}>
                      {activeWalletObj.currency === 'SOL' ? '' : '$'} {amount} {activeWalletObj.currency}
                    </ReceiptValue>
                  </ReceiptRow>
                  <ReceiptRow>
                    <ReceiptLabel>Fecha de Envío</ReceiptLabel>
                    <ReceiptValue>{paymentDate}</ReceiptValue>
                  </ReceiptRow>
                  <ReceiptRow>
                    <ReceiptLabel>Recurrente</ReceiptLabel>
                    <ReceiptValue>{isRecurring ? 'Sí' : 'No'}</ReceiptValue>
                  </ReceiptRow>
                </ReceiptCard>

                {/* Orange banner if profile wallet is missing */}
                {!hasWallet && (
                  <SetupWalletPrompt>
                    <div className="flex gap-2 text-amber-500">
                      <AlertCircle size={18} className="shrink-0" />
                      <div>
                        <div className="text-xs font-semibold">Billetera de Retiro no Vinculada</div>
                        <div className="text-[11px] text-amber-100/80 mt-1">
                          No tienes una wallet Solana vinculada en tu perfil. Configúrala en Ajustes para poder crear enlaces de cobro.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <FormInput
                        style={{ flex: 1, padding: '8px 16px', fontSize: 13, borderRadius: '9999px' }}
                        type="text"
                        placeholder="Ej. FqM87bA2H..."
                        value={tempWalletAddress}
                        onChange={(e) => setTempWalletAddress(e.target.value)}
                        disabled={savingTempWallet}
                      />
                      <PayButton
                        onClick={handleSaveTempWallet}
                        disabled={savingTempWallet || !tempWalletAddress}
                        style={{ padding: '8px 16px', fontSize: 12 }}
                      >
                        {savingTempWallet ? 'Viculando...' : 'Vincular'}
                      </PayButton>
                    </div>
                  </SetupWalletPrompt>
                )}

                <ActionFooter>
                  <SecondaryButton style={{ flex: 1 }} onClick={() => setStep(3)}>Atrás</SecondaryButton>
                  <PrimaryButton
                    style={{ flex: 1, background: 'linear-gradient(to right, #60A5FA, #2563EB)', color: '#FFFFFF' }}
                    onClick={handleCreatePaymentLink}
                    disabled={!hasWallet || isCreatingLink}
                    aria-busy={isCreatingLink}
                  >
                    {isCreatingLink ? 'Creando enlace…' : 'Crear Enlace de Cobro'}
                  </PrimaryButton>
                </ActionFooter>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 5: Success + Share */}
          {step === 5 && selectedRecipient && createdLinkId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
            >
              <SuccessBox>
                <CheckCircle size={64} className="text-emerald-400" />
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 500, color: '#fff', marginBottom: 6 }}>¡Enlace creado!</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                    Copia y comparte el enlace con <strong style={{ color: '#fff' }}>{selectedRecipient.name}</strong>.
                  </div>
                </div>

                <ShareUrlRow>
                  <ShareUrlText>{createdLinkUrl}</ShareUrlText>
                  <ActionIconButton
                    onClick={() => { navigator.clipboard.writeText(createdLinkUrl); toast.success('¡Enlace copiado!'); }}
                    aria-label="Copiar enlace"
                    style={{ color: '#60A5FA', flexShrink: 0 }}
                  >
                    <Copy size={16} />
                  </ActionIconButton>
                </ShareUrlRow>

                {/* Recipient notification data */}
                {(selectedRecipient.email || selectedRecipient.phone) && (
                  <RecipientNoticeRow>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#60A5FA', textTransform: 'uppercase' }}>Notifica al destinatario</div>
                    {selectedRecipient.email && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>✉️ {selectedRecipient.email}</div>
                    )}
                    {selectedRecipient.phone && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>📱 {selectedRecipient.phone}</div>
                    )}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      Envía el enlace por correo o WhatsApp para que el destinatario pueda pagar on-chain.
                    </div>
                  </RecipientNoticeRow>
                )}

                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  <SecondaryButton style={{ flex: 1 }} onClick={() => { setStep(1); setSelectedRecipient(null); setAmount(''); setPaymentDate(''); setCreatedLinkId(null); setCreatedLinkUrl(''); }}>
                    Nuevo envío
                  </SecondaryButton>
                  <PrimaryButton style={{ flex: 1 }} onClick={() => router.push(`/dashboard/links/${createdLinkId}`)}>
                    Ver detalle
                  </PrimaryButton>
                </div>
              </SuccessBox>
            </motion.div>
          )}
        </FormSection>

        {/* Quick Help accordion panel */}
        <SidePanel>
          <GlassCard style={{ padding: '20px' }}>
            <SectionHeader style={{ fontSize: 16, marginBottom: 12 }}>
              <HelpCircle size={16} className="text-[#60A5FA]" />
              Ayuda Rápida
            </SectionHeader>
            <AccordionContainer>
              {helpItems.map((item, idx) => {
                const open = activeHelpIndex === idx;
                return (
                  <AccordionItem key={idx}>
                    <AccordionHeader type="button" onClick={() => setActiveHelpIndex(open ? null : idx)}>
                      <span>{item.q}</span>
                      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </AccordionHeader>
                    {open && (
                      <AccordionContent>
                        {item.a}
                      </AccordionContent>
                    )}
                  </AccordionItem>
                );
              })}
            </AccordionContainer>
          </GlassCard>

          <GlassCard style={{ padding: '20px', background: 'rgba(96, 165, 250, 0.02)' }}>
            <div className="flex gap-3">
              <Sparkles size={20} className="text-[#60A5FA] shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-white font-family-outfit">Soporte Multidivisa</h4>
                <p className="text-xs text-[var(--dash-muted)] mt-1 leading-relaxed">
                  Envía y recibe fondos en USDC o SOL directamente a tu dirección on-chain registrada en Solana.
                </p>
              </div>
            </div>
          </GlassCard>
        </SidePanel>
      </ContentLayout>
      )}

      {/* Recipient Management Modals */}
      <AnimatePresence>
        {isContactModalOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsContactModalOpen(false)}
          >
            <ModalBox
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <ModalHeader>
                <ModalTitle>{editingContact ? 'Editar Destinatario' : 'Nuevo Destinatario'}</ModalTitle>
                <CloseButton onClick={() => setIsContactModalOpen(false)} aria-label="Cerrar">
                  <X size={18} />
                </CloseButton>
              </ModalHeader>

              <FormField>
                <FormLabel>NOMBRE COMPLETO / ALIAS *</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Ej. Roosevelt Chase"
                  value={contactFormName}
                  onChange={(e) => setContactFormName(e.target.value)}
                  disabled={isCreating || isUpdating}
                />
              </FormField>

              <FormField>
                <FormLabel>CORREO ELECTRÓNICO *</FormLabel>
                <FormInput
                  type="email"
                  placeholder="Ej. joseph.flores.jc@gmail.com"
                  value={contactFormEmail}
                  onChange={(e) => setContactFormEmail(e.target.value)}
                  disabled={isCreating || isUpdating}
                />
              </FormField>

              <FormField>
                <FormLabel>NÚMERO DE TELÉFONO *</FormLabel>
                <FormInput
                  type="tel"
                  placeholder="Ej. +1 555-0199"
                  value={contactFormPhone}
                  onChange={(e) => setContactFormPhone(e.target.value)}
                  disabled={isCreating || isUpdating}
                />
              </FormField>

              <ModalFooter>
                <SecondaryButton onClick={() => setIsContactModalOpen(false)} disabled={isCreating || isUpdating}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton onClick={handleSaveContact} disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Guardando...' : 'Guardar'}
                </PrimaryButton>
              </ModalFooter>
            </ModalBox>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
}
