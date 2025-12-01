import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { getAllEventPaymentsQueryKey, getEventDashboardDataByIdQueryKey, getEventMemberByIdQueryKey, getEventMembersQueryKey, getEventTicketsQueryKey, useToggleMemberConfirmed } from '@/http/generated';
import { useParams } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

export function ToggleIsAllConfirmedButNotYetFullyPaidButton({
  memberId,
  isAllConfirmedButNotYetFullyPaid,
}: {
  memberId: string;
  isAllConfirmedButNotYetFullyPaid: boolean;
}) {
  const eventId = useParams({
    strict: false,
  }).eventId as string;

  const queryClient = useQueryClient();

  const toggleConfirmed = useToggleMemberConfirmed({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getEventMemberByIdQueryKey(eventId, memberId),
        });
        await queryClient.invalidateQueries({
          queryKey: getAllEventPaymentsQueryKey(eventId),
        });
        await queryClient.invalidateQueries({
          queryKey: getEventDashboardDataByIdQueryKey(eventId),
        });
        await queryClient.invalidateQueries({
          queryKey: getEventMembersQueryKey(eventId),
        });
        await queryClient.invalidateQueries({
          queryKey: getEventTicketsQueryKey(eventId),
        });
        toast.success('Status do membro atualizado com sucesso');
      },
      onError: (error) => {
        // biome-ignore lint/suspicious/noConsole: here
        console.error('Erro ao atualizar status do membro:', error);
        toast.error('Erro ao atualizar status do membro', {
          description: error.response?.data?.message,
        });
      },
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-full" size="sm" variant="destructive">
          {!isAllConfirmedButNotYetFullyPaid
            ? 'Contabilizar'
            : 'Não contabilizar'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              Tem certeza que deseja{' '}
              {isAllConfirmedButNotYetFullyPaid
                ? 'não contabilizar'
                : 'contabilizar'}{' '}
              este pagamento?
            </h4>
          </div>
          <Button
            disabled={toggleConfirmed.isPending}
            onClick={() => toggleConfirmed.mutate({ eventId, id: memberId })}
            variant="destructive"
          >
            {isAllConfirmedButNotYetFullyPaid
              ? 'Não contabilizar'
              : 'Contabilizar'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
