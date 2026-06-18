"use client";

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { Contact } from '@/lib/contacts-api';

interface ContactsViewProps {
  contacts: Contact[];
  isLoading: boolean;
  isError: boolean;
  onAddContactClick: () => void;
  onEditContactClick: (contact: Contact) => void;
  onDeleteContactClick: (id: string) => void;
}

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 64px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 48px;
  font-weight: 500;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  margin: 0;

  @media (min-width: 1024px) {
    font-size: 60px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const ContactsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ContactCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.6);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
`;

const ContactName = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const Badge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  background: rgba(96, 165, 250, 0.1);
  padding: 4px 8px;
  border-radius: 9999px;
`;

const DataRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
`;

const Value = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: #EDEDED;
`;

const OnChainValue = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: #60A5FA;
  word-break: break-all;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60A5FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export function ContactsView({ 
  contacts, 
  isLoading, 
  isError, 
  onAddContactClick,
  onEditContactClick,
  onDeleteContactClick
}: ContactsViewProps) {
  return (
    <PageContainer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
    >
      <HeaderContainer>
        <div>
          <Title>Contacts</Title>
          <Subtitle>Manage your frequent transaction network on-chain.</Subtitle>
        </div>
        <Button onClick={onAddContactClick} $variant="primary">
          Add New Contact
        </Button>
      </HeaderContainer>

      {isLoading ? (
        <EmptyState>
          <Spinner aria-busy="true" />
          <Subtitle>Loading infrastructure...</Subtitle>
        </EmptyState>
      ) : isError ? (
        <EmptyState>
          <Title as="h2" style={{ fontSize: '24px' }}>Connection Error</Title>
          <Subtitle>Unable to load contacts. Please verify your connection to the ecosystem.</Subtitle>
        </EmptyState>
      ) : contacts.length === 0 ? (
        <EmptyState>
          <Title as="h2" style={{ fontSize: '24px' }}>No Contacts Yet</Title>
          <Subtitle>Start building your on-chain network. Add liquidity partners and frequent clients.</Subtitle>
          <Button onClick={onAddContactClick} $variant="secondary" style={{ marginTop: '16px' }}>
            Add Your First Contact
          </Button>
        </EmptyState>
      ) : (
        <ContactsGrid>
          {contacts.map((contact, index) => (
            <ContactCard 
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <ContactName>
                  {contact.nickname}
                  {contact.isFavorite && <Badge>Fav</Badge>}
                </ContactName>
                <ActionsContainer>
                  <IconButton 
                    onClick={() => onEditContactClick(contact)}
                    aria-label={`Edit ${contact.nickname}`}
                    title="Edit Contact"
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton 
                    onClick={() => onDeleteContactClick(contact.id)}
                    aria-label={`Delete ${contact.nickname}`}
                    title="Delete Contact"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </ActionsContainer>
              </div>
              
              <DataRow>
                <Label>WALLET ADDRESS</Label>
                <OnChainValue>{contact.walletAddress}</OnChainValue>
              </DataRow>

              {contact.email && (
                <DataRow>
                  <Label>EMAIL</Label>
                  <Value>{contact.email}</Value>
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
                <Value>{contact.symbol || contact.mint}</Value>
              </DataRow>

              {contact.notes && (
                <DataRow>
                  <Label>NOTES</Label>
                  <Value>{contact.notes}</Value>
                </DataRow>
              )}
            </ContactCard>
          ))}
        </ContactsGrid>
      )}
    </PageContainer>
  );
}
