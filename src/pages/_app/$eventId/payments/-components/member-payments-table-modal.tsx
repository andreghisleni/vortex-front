// src/components/member-payments-table-modal.tsx
'use client';

import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PaymentsTable } from '../../member/$id/-components/payment-table';
import type { Member } from './columns';

type MemberPaymentsTableModalProps = {
  memberId: string;
  memberName: string;
  payments: Member['payments'];
  visionId: string;
  toReceive: number;
};

export const MemberPaymentsTableModal: React.FC<
  MemberPaymentsTableModalProps
> = ({ memberId, memberName, payments, visionId, toReceive }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full gap-1"
          color="emerald"
          size="sm"
          variant="outline"
        >
          Pagamentos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            Pagamentos de: {visionId} -{' '}
            <strong className="font-extrabold">{memberName}</strong>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <PaymentsTable
            memberId={memberId}
            payments={payments || []}
            toReceive={
              toReceive
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
