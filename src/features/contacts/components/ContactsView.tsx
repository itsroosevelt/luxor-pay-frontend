"use client";

import { useState, useMemo } from 'react';
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
import { Contact } from '@/features/contacts/api/contacts-api';
import { toast } from 'sonner';
import {
  PageContainer,
  HeaderRow,
  Title,
  Subtitle,
  AddButton,
  ToolbarRow,
  RightControlsGroup,
  SearchFilterWrapper,
  SearchContainer,
  FilterIconButton,
  SearchInput,
  SearchIconWrapper,
  ClearSearchButton,
  FilterGroup,
  FilterTab,
  ContactsGrid,
  ContactCard,
  CardHeader,
  AvatarNameGroup,
  Avatar,
  NameGroup,
  ContactName,
  FavoriteBadge,
  ActionsContainer,
  IconButton,
  AddressPill,
  AddressMonospace,
  AddressActions,
  MiniButton,
  DataGrid,
  DataRow,
  Label,
  Value,
  SendLinkButton,
  EmptyState,
  EmptyTitle,
  Spinner,
} from './ContactsView.styles';

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

/* ─────────────────────────── Header Section ─────────────────────────── */

/* ─────────────────────────── Toolbar ─────────────────────────── */

/* ─────────────────────────── Cards Grid ─────────────────────────── */

/* ─────────────────────────── Address Pill ─────────────────────────── */

/* ─────────────────────────── Data Grid ─────────────────────────── */

/* ─────────────────────────── Empty State ─────────────────────────── */

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
    <PageContainer>
      {/* Header Row */}
      <HeaderRow>
        <Title>Contacts</Title>
        <Subtitle>Manage your frequent transaction contacts on the Sterling network.</Subtitle>
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
                  <DataRow>
                    <Label>EMAIL</Label>
                    <Value
                      title={contact.email || '—'}
                      style={{ color: contact.email ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.25)' }}
                    >
                      {contact.email || '—'}
                    </Value>
                  </DataRow>

                  <DataRow>
                    <Label>PHONE</Label>
                    <Value
                      style={{ color: contact.telephone ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.25)' }}
                    >
                      {contact.telephone || '—'}
                    </Value>
                  </DataRow>

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
