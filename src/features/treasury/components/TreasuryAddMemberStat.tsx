'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useMembers } from '@/features/treasury/hooks/useMembers';
import { AddMemberModal } from './AddMemberModal';
import { StatIconBadge, StatItem, StatLabel, StatValue, StatValueGroup } from './treasury.styles';

/**
 * Member count of the active treasury with a click-to-add shortcut, so members can be added without leaving
 * Treasury. It uses its own `useMembers()` and notifies the treasury views when a change is made.
 */
export function TreasuryAddMemberStat() {
  const { data: members, addMember } = useMembers();
  const [open, setOpen] = useState(false);

  return (
    <>
      <StatItem onClick={() => setOpen(true)} style={{ cursor: 'pointer' }} title="Add a member to this multisig">
        <StatIconBadge>
          <UserPlus size={18} />
        </StatIconBadge>
        <StatValueGroup>
          <StatValue>{members.length}</StatValue>
          <StatLabel>Members</StatLabel>
        </StatValueGroup>
      </StatItem>
      <AddMemberModal open={open} onClose={() => setOpen(false)} addMember={addMember} />
    </>
  );
}
