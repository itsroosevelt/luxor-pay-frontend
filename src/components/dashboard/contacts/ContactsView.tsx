"use client";

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Plus, User } from 'lucide-react';
import { Contact } from '@/lib/contacts-api';

interface ContactsViewProps {
  contacts: Contact[];
  isLoading: boolean;
  isError: boolean;
  onAddContactClick: () => void;
  onEditContactClick: (contact: Contact) => void;
  onDeleteContactClick: (id: string) => void;
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  padding: 32px 40px 64px 40px;

  @media (max-width: 768px) {
    padding: 24px 20px 64px 20px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 24px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  margin: 0;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  margin: 0;
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  box-shadow: 0 4px 20px rgba(96, 165, 250, 0.15);

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
    box-shadow: 0 6px 24px rgba(37, 99, 235, 0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ContactsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ContactCard = styled(motion.div)`
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;

  &:hover {
    border-color: rgba(96, 165, 250, 0.3);
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.1), 0 24px 48px -12px rgba(0, 0, 0, 0.6);
    transform: translateY(-2px);
  }
`;

const CardAccent = styled.div`
  height: 3px;
  width: 100%;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  opacity: 0.7;
`;

const CardBody = styled.div`
  padding: 20px 22px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(96,165,250,0.25), rgba(37,99,235,0.4));
  border: 1px solid rgba(96,165,250,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #60A5FA;
  text-transform: uppercase;
  letter-spacing: -0.5px;
`;

const NameBadgeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const ContactName = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96,165,250,0.25);
  padding: 2px 8px;
  border-radius: 9999px;
  width: fit-content;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: ${({ $danger }) => $danger ? '#f87171' : '#FFFFFF'};
    background: ${({ $danger }) => $danger ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.1)'};
    border-color: ${({ $danger }) => $danger ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.2)'};
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
`;

const DataGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DataRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
`;

const Value = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: #EDEDED;
`;

const OnChainValue = styled.span`
  font-family: monospace;
  font-size: 11px;
  color: #60A5FA;
  word-break: break-all;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  gap: 16px;
`;

const EmptyTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const SecondaryButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #60A5FA;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  backdrop-filter: blur(12px);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60A5FA;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export function ContactsView({
  contacts,
  isLoading,
  isError,
  onAddContactClick,
  onEditContactClick,
  onDeleteContactClick,
}: ContactsViewProps) {
  return (
    <PageContainer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
    >
      <ActionBar>
        <AddButton onClick={onAddContactClick}>
          <Plus size={14} />
          Add New Contact
        </AddButton>
      </ActionBar>

      {isLoading ? (
        <EmptyState>
          <Spinner aria-busy="true" />
          <Subtitle>Loading infrastructure...</Subtitle>
        </EmptyState>
      ) : isError ? (
        <EmptyState>
          <EmptyTitle>Connection Error</EmptyTitle>
          <Subtitle>Unable to load contacts. Please verify your connection to the ecosystem.</Subtitle>
        </EmptyState>
      ) : contacts.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No Contacts Yet</EmptyTitle>
          <Subtitle>Start building your on-chain network. Add liquidity partners and frequent clients.</Subtitle>
          <SecondaryButton onClick={onAddContactClick}>
            <Plus size={14} />
            Add Your First Contact
          </SecondaryButton>
        </EmptyState>
      ) : (
        <ContactsGrid>
          {contacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
            >
              <CardAccent />
              <CardBody>
                <CardHeader>
                  <AvatarNameGroup>
                    <Avatar>
                      {contact.nickname?.charAt(0) || <User size={16} />}
                    </Avatar>
                    <NameBadgeGroup>
                      <ContactName title={contact.nickname}>{contact.nickname}</ContactName>
                      {contact.isFavorite && <Badge>★ Favorite</Badge>}
                    </NameBadgeGroup>
                  </AvatarNameGroup>
                  <ActionsContainer>
                    <IconButton
                      onClick={() => onEditContactClick(contact)}
                      aria-label={`Edit ${contact.nickname}`}
                      title="Edit Contact"
                    >
                      <Pencil size={13} />
                    </IconButton>
                    <IconButton
                      $danger
                      onClick={() => onDeleteContactClick(contact.id)}
                      aria-label={`Delete ${contact.nickname}`}
                      title="Delete Contact"
                    >
                      <Trash2 size={13} />
                    </IconButton>
                  </ActionsContainer>
                </CardHeader>

                <Divider />

                <DataGrid>
                  <DataRow>
                    <Label>Wallet Address</Label>
                    <OnChainValue>{contact.walletAddress}</OnChainValue>
                  </DataRow>

                  {contact.email && (
                    <DataRow>
                      <Label>Email</Label>
                      <Value>{contact.email}</Value>
                    </DataRow>
                  )}

                  {contact.telephone && (
                    <DataRow>
                      <Label>Phone</Label>
                      <Value>{contact.telephone}</Value>
                    </DataRow>
                  )}

                  <DataRow>
                    <Label>Preferred Asset</Label>
                    <Value>{contact.symbol || contact.mint}</Value>
                  </DataRow>

                  {contact.notes && (
                    <DataRow>
                      <Label>Notes</Label>
                      <Value>{contact.notes}</Value>
                    </DataRow>
                  )}
                </DataGrid>
              </CardBody>
            </ContactCard>
          ))}
        </ContactsGrid>
      )}
    </PageContainer>
  );
}
