"use client";

import React, { useState } from 'react';
import { useGetContacts } from '@/features/contacts/hooks/useGetContacts';
import { useDeleteContact } from '@/features/contacts/hooks/useDeleteContact';
import { useUpdateContact } from '@/features/contacts/hooks/useUpdateContact';
import { ContactsView } from '@/features/contacts/components/ContactsView';
import { ContactFormModal } from '@/features/contacts/components/ContactFormModal';
import { DeleteConfirmationModal } from '@/features/contacts/components/DeleteConfirmationModal';
import { TransferModal } from '@/features/transfers/components/TransferModal';
import { Contact } from '@/features/contacts/api/contacts-api';

export function ContactsContainer() {
  const { data, isLoading, isError, refetch } = useGetContacts();
  const { mutate: deleteMutate, isLoading: isDeleting } = useDeleteContact();
  const { mutate: updateMutate } = useUpdateContact();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  // Transfer Modal Integration
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferMint, setTransferMint] = useState<string>('');

  const handleOpenModal = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setContactToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSendClick = (contact: Contact) => {
    setTransferRecipient(contact.walletAddress);
    setTransferMint(contact.symbol || contact.mint || 'SOL');
    setIsTransferModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (contactToDelete) {
      const success = await deleteMutate(contactToDelete);
      if (success) {
        setIsDeleteModalOpen(false);
        setContactToDelete(null);
        refetch();
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setContactToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
    refetch();
  };

  const handleToggleFavorite = async (contact: Contact) => {
    setTogglingFavoriteId(contact.id);
    const result = await updateMutate(contact.id, { isFavorite: !contact.isFavorite });
    if (result) {
      refetch();
    }
    setTogglingFavoriteId(null);
  };

  return (
    <>
      <ContactsView 
        contacts={data?.data || []}
        isLoading={isLoading}
        isError={isError}
        onAddContactClick={handleOpenModal}
        onEditContactClick={handleEditClick}
        onDeleteContactClick={handleDeleteClick}
        onToggleFavoriteClick={handleToggleFavorite}
        onSendClick={handleSendClick}
        togglingFavoriteId={togglingFavoriteId}
      />
      
      <ContactFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        initialData={selectedContact}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        isLoading={isDeleting}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialRecipientAddress={transferRecipient}
        initialMint={transferMint}
      />
    </>
  );
}
