import { useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  getAllEventTicketsQueryKey,
  getEventDashboardDataByIdQueryKey,
  getEventMemberByIdQueryKey,
  useToggleReturnedStatusOfEventTicketById,
} from '@/http/generated';

export function ToggleReturnedTicketButton({
  ticketId,
  isReturnedTicket,
}: {
  ticketId: string;
  isReturnedTicket: boolean;
}) {
  const eventId = useParams({
    strict: false,
  }).eventId as string;
  const memberId = useParams({
    strict: false,
  }).id as string;

  const queryClient = useQueryClient();

  const toggleReturnedTicket = useToggleReturnedStatusOfEventTicketById({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getEventMemberByIdQueryKey(eventId, memberId),
        });
        await queryClient.invalidateQueries({
          queryKey: getAllEventTicketsQueryKey(eventId),
        });
        await queryClient.invalidateQueries({
          queryKey: getEventDashboardDataByIdQueryKey(eventId),
        });
        toast.success('Ticket atualizado com sucesso');
      },
      onError: (error) => {
        toast.error('Erro ao atualizar status do ticket', {
          description: error.response?.data?.message,
        });
      },
    },
  });

  return (
    <Button
      disabled={toggleReturnedTicket.isPending}
      onClick={() =>
        toggleReturnedTicket.mutate({
          eventId,
          id: ticketId,
        })
      }
      size="sm"
      variant="destructive"
    >
      {isReturnedTicket ? 'Não retornar' : 'Retornar'}
    </Button>
  );
}
