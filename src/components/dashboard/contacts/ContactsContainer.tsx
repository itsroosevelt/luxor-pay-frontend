"use client";

import React, { useState } from 'react';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useDeleteContact } from '@/hooks/useDeleteContact';
import { ContactsView } from './ContactsView';
import { ContactFormModal } from './ContactFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Contact } from '@/lib/contacts-api';

export function ContactsContainer() {
  const { data, isLoading, isError, refetch } = useGetContacts();
  const { mutate: deleteMutate, isLoading: isDeleting } = useDeleteContact();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

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
    refetch(); // Refresh the list after successful creation or update
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
    </>
  );
}
