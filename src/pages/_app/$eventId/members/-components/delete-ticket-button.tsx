'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  getEventByEventIdMembersQueryKey,
  useDeleteEventByEventIdTicketsById,
} from '@/http/generated';

type IProps = {
  id: string;
  isDelivered: boolean;
};

export function DeleteTicketButton({ id, isDelivered }: IProps) {
  const eventId = useParams({
    strict: false,
  }).eventId as string;

  const queryClient = useQueryClient();
  const { mutateAsync: deleteTicket, isPending: isPendingTicket } =
    useDeleteEventByEventIdTicketsById({
      mutation: {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: getEventByEventIdMembersQueryKey(eventId),
          });

          toast.success('Ingresso excluído com sucesso');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    });

  async function handleDeleteTicket() {
    await deleteTicket({
      id,
      eventId,
    });
  }

  return (
    <Button
      disabled={isDelivered || isPendingTicket}
      onClick={handleDeleteTicket}
    >
      {isPendingTicket ? <Loader2 className="animate-spin" /> : 'Excluir'}
    </Button>
  );
}
