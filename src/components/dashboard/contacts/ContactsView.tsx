"use client";

import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import {
  Pencil,
  Trash2,
  Plus,
  User,
  Star,
  Search,
  Copy,
  Check,
  ExternalLink,
  Send,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Contact } from '@/lib/contacts-api';
import { toast } from 'sonner';

interface ContactsViewProps {
  contacts: Contact[];
  isLoading: boolean;
  isError: boolean;
  onAddContactClick: () => void;
  onEditContactClick: (contact: Contact) => void;
  onDeleteContactClick: (id: string) => void;
  onToggleFavoriteClick: (contact: Contact) => void;
  onSendClick?: (contact: Contact) => void;
  togglingFavoriteId?: string | null;
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 36px 40px 64px 40px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px 20px 64px 20px;
  }
`;

/* ─────────────────────────── Header Section ─────────────────────────── */

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 20px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
`;

const AddButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  color: #000000;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #EDEDED;
    color: #000000;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

/* ─────────────────────────── Toolbar ─────────────────────────── */

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const RightControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

const SearchFilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 240px;
  max-width: 430px;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
`;

const FilterIconButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 8px 36px 8px 38px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #FFFFFF;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.06);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;

  &:hover {
    color: #FFFFFF;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FilterTab = styled.button<{ $active?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.3)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.06);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

/* ─────────────────────────── Cards Grid ─────────────────────────── */

const ContactsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ContactCard = styled(motion.div)`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: none;
  border-radius: 0;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: opacity 0.2s;
  min-width: 0;

  &:hover {
    opacity: 0.9;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`;

const AvatarNameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  text-transform: uppercase;
`;

const NameGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ContactName = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FavoriteBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #F59E0B;
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const IconButton = styled.button<{ $active?: boolean; $danger?: boolean; $favorite?: boolean }>`
  background: ${({ $active, $favorite }) =>
    $favorite && $active ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid ${({ $active, $favorite }) =>
    $favorite && $active ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 8px;
  color: ${({ $active, $favorite }) =>
    $favorite && $active ? '#F59E0B' : $active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'};
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: ${({ $favorite }) => ($favorite ? '#F59E0B' : '#FFFFFF')};
    background: ${({ $favorite }) => ($favorite ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)')};
    border-color: ${({ $favorite }) => ($favorite ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.15)')};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #F59E0B;
    outline-offset: 2px;
  }
`;

/* ─────────────────────────── Address Pill ─────────────────────────── */

const AddressPill = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

const AddressMonospace = styled.span`
  font-family: monospace;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AddressActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const MiniButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.06);
  }
`;

/* ─────────────────────────── Data Grid ─────────────────────────── */

const DataGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
  min-width: 0;
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  min-width: 0;
`;

const Label = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
`;

const Value = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  text-align: right;
`;

const SendLinkButton = styled.button`
  margin-top: 4px;
  width: 100%;
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: #E2E8F0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #FFFFFF;
    color: #000000;
    border-color: #FFFFFF;
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.15);
  }
`;

/* ─────────────────────────── Empty State ─────────────────────────── */

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  gap: 16px;
`;

const EmptyTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

function formatAddressTruncated(address: string): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function ContactsView({
  contacts,
  isLoading,
  isError,
  onAddContactClick,
  onEditContactClick,
  onDeleteContactClick,
  onToggleFavoriteClick,
  onSendClick,
  togglingFavoriteId,
}: ContactsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (showFavoritesOnly && !contact.isFavorite) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        contact.nickname?.toLowerCase().includes(q) ||
        contact.walletAddress?.toLowerCase().includes(q) ||
        contact.email?.toLowerCase().includes(q) ||
        contact.telephone?.includes(q) ||
        contact.notes?.toLowerCase().includes(q)
      );
    });
  }, [contacts, showFavoritesOnly, searchQuery]);

  const handleCopyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast.success('Dirección copiada');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageContainer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
    >
      {/* Header Row */}
      <HeaderRow>
        <Title>Contacts</Title>
        <Subtitle>Manage your frequent transaction contacts on the Luxor network.</Subtitle>
      </HeaderRow>

      {/* Toolbar */}
      <ToolbarRow>
        <SearchFilterWrapper>
          <SearchContainer>
            <SearchIconWrapper>
              <Search size={14} />
            </SearchIconWrapper>
            <SearchInput
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <ClearSearchButton onClick={() => setSearchQuery('')}>
                <X size={12} />
              </ClearSearchButton>
            )}
          </SearchContainer>

          <FilterIconButton
            type="button"
            $active={showFavoritesOnly}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title={showFavoritesOnly ? 'Show all contacts' : 'Filter favorites'}
          >
            <SlidersHorizontal size={14} />
          </FilterIconButton>
        </SearchFilterWrapper>

        <RightControlsGroup>
          <FilterGroup>
            <FilterTab $active={!showFavoritesOnly} onClick={() => setShowFavoritesOnly(false)}>
              All ({contacts.length})
            </FilterTab>
            <FilterTab $active={showFavoritesOnly} onClick={() => setShowFavoritesOnly(true)}>
              Favorites <Star size={12} style={{ marginLeft: 3, color: '#F59E0B', fill: showFavoritesOnly ? '#F59E0B' : 'none' }} />
            </FilterTab>
          </FilterGroup>

          <AddButton onClick={onAddContactClick}>
            <Plus size={14} />
            Add New Contact
          </AddButton>
        </RightControlsGroup>
      </ToolbarRow>

      {/* Grid Content */}
      {isLoading ? (
        <EmptyState>
          <Spinner aria-busy="true" />
          <Subtitle>Loading contacts...</Subtitle>
        </EmptyState>
      ) : isError ? (
        <EmptyState>
          <EmptyTitle>Connection Error</EmptyTitle>
          <Subtitle>Unable to load contacts. Please verify your connection.</Subtitle>
        </EmptyState>
      ) : contacts.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No Contacts Yet</EmptyTitle>
          <Subtitle>Start building your network. Add frequent clients or partners.</Subtitle>
          <AddButton onClick={onAddContactClick}>
            <Plus size={14} />
            Add First Contact
          </AddButton>
        </EmptyState>
      ) : filteredContacts.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No Matches Found</EmptyTitle>
          <Subtitle>No contacts match your current search criteria.</Subtitle>
        </EmptyState>
      ) : (
        <ContactsGrid>
          {filteredContacts.map((contact, index) => {
            const isFav = contact.isFavorite;
            const assetSymbol = contact.symbol || contact.mint || 'USDC';

            return (
              <ContactCard
                key={contact.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
              >
                <CardHeader>
                  <AvatarNameGroup>
                    <Avatar>{contact.nickname?.charAt(0) || <User size={16} />}</Avatar>
                    <NameGroup>
                      <ContactName title={contact.nickname}>{contact.nickname}</ContactName>
                      {isFav && <FavoriteBadge>★ Favorite</FavoriteBadge>}
                    </NameGroup>
                  </AvatarNameGroup>

                  <ActionsContainer>
                    <IconButton
                      type="button"
                      $active={isFav}
                      $favorite
                      onClick={() => onToggleFavoriteClick(contact)}
                      disabled={togglingFavoriteId === contact.id}
                      title={isFav ? 'Remove favorite' : 'Mark favorite'}
                    >
                      <Star size={13} fill={isFav ? '#F59E0B' : 'none'} color={isFav ? '#F59E0B' : 'currentColor'} />
                    </IconButton>
                    <IconButton
                      type="button"
                      onClick={() => onEditContactClick(contact)}
                      title="Edit Contact"
                    >
                      <Pencil size={13} />
                    </IconButton>
                    <IconButton
                      type="button"
                      $danger
                      onClick={() => onDeleteContactClick(contact.id)}
                      title="Delete Contact"
                    >
                      <Trash2 size={13} />
                    </IconButton>
                  </ActionsContainer>
                </CardHeader>

                {/* Wallet Address Pill */}
                <AddressPill>
                  <AddressMonospace>{formatAddressTruncated(contact.walletAddress)}</AddressMonospace>
                  <AddressActions>
                    <MiniButton
                      type="button"
                      onClick={() => handleCopyAddress(contact.id, contact.walletAddress)}
                      title="Copy Address"
                    >
                      {copiedId === contact.id ? <Check size={13} /> : <Copy size={13} />}
                    </MiniButton>
                    <a
                      href={`https://explorer.solana.com/address/${contact.walletAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on Solana Explorer"
                    >
                      <MiniButton type="button">
                        <ExternalLink size={13} />
                      </MiniButton>
                    </a>
                  </AddressActions>
                </AddressPill>

                {/* Data Grid */}
                <DataGrid>
                  {contact.email && (
                    <DataRow>
                      <Label>EMAIL</Label>
                      <Value title={contact.email}>{contact.email}</Value>
                    </DataRow>
                  )}

                  {contact.telephone && (
                    <DataRow>
                      <Label>PHONE</Label>
                      <Value>{contact.telephone}</Value>
                    </DataRow>
                  )}

                  <DataRow>
                    <Label>PREFERRED ASSET</Label>
                    <Value>{assetSymbol}</Value>
                  </DataRow>

                  {contact.notes && (
                    <DataRow>
                      <Label>NOTES</Label>
                      <Value title={contact.notes}>{contact.notes}</Value>
                    </DataRow>
                  )}
                </DataGrid>

                {onSendClick && (
                  <SendLinkButton type="button" onClick={() => onSendClick(contact)}>
                    <Send size={13} />
                    Send Funds
                  </SendLinkButton>
                )}
              </ContactCard>
            );
          })}
        </ContactsGrid>
      )}
    </PageContainer>
  );
}
