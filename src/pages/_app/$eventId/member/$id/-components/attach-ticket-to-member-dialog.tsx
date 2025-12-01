import { useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  getEventMemberByIdQueryKey,
  getEventTicketsQueryKey,
  useAssignTickets,
  useGetEventTickets,
} from '@/http/generated';

type SelectedTicket = {
  id: string;
  number: number;
  name: string | null;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export function AttachTicketToMemberDialog({
  eventId,
  memberId,
}: {
  eventId: string;
  memberId: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const queryClient = useQueryClient();

  // Tickets selecionados (mantidos mesmo quando o filtro muda)
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);

  // carregar a página atual de tickets
  const { data, isFetching, refetch } = useGetEventTickets(eventId, {
    'p.page': page,
    'p.pageSize': pageSize,
    'f.filter': filter.length > 0 ? filter : undefined,
    'f.noMemberId': true,
  });

  const tickets = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const assignTickets = useAssignTickets({
    mutation: {
      onSuccess: async (response) => {
        toast.success(`${response.assignedCount} ingresso(s) vinculado(s) ao membro com sucesso`);
        // invalidar membro e tickets
        await queryClient.invalidateQueries({
          queryKey: getEventMemberByIdQueryKey(eventId, memberId),
        });
        await queryClient.invalidateQueries({
          queryKey: getEventTicketsQueryKey(eventId),
        });
        setOpen(false);
        setSelectedTickets([]);
        setPage(1);
      },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      onError: (err: any) => {
        toast.error(
          `Erro ao vincular ingressos: ${err?.message ?? String(err)}`
        );
      },
    },
  });

  function handleOpen() {
    setOpen(true);
    setPage(1);
    setSelectedTickets([]);
    // refetch para garantir dados
    refetch();
  }

  async function handleAttach() {
    if (selectedTickets.length === 0) {
      toast.error('Selecione pelo menos um ingresso antes de vincular');
      return;
    }
    await assignTickets.mutateAsync({
      eventId,
      data: {
        ticketIds: selectedTickets.map((t) => t.id),
        memberId,
      },
    });
  }

  function toggleTicket(ticket: { id: string; number: number; name: string | null | undefined; member?: { name: string } | null }) {
    const isSelected = selectedTickets.some((t) => t.id === ticket.id);
    if (isSelected) {
      setSelectedTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    } else {
      setSelectedTickets((prev) => [
        ...prev,
        {
          id: ticket.id,
          number: ticket.number,
          name: ticket.member?.name ?? ticket.name ?? null,
        },
      ]);
    }
  }

  function removeSelectedTicket(ticketId: string) {
    setSelectedTickets((prev) => prev.filter((t) => t.id !== ticketId));
  }

  const canLoadMore = page < (totalPages || 1);

  // combine pages already loaded if user has navigated pages >1
  // here we only display current page, but we can keep an accumulated list if needed
  // for simplicity show accumulated pages by refetching pages 1..page
  const accumulatedTickets = useMemo(() => tickets, [tickets]);

  // IDs dos tickets selecionados para verificação rápida
  const selectedTicketIds = useMemo(
    () => new Set(selectedTickets.map((t) => t.id)),
    [selectedTickets]
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button onClick={handleOpen} variant="outline">
          Vincular Ingresso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <div className="space-y-4">
          <h3 className='font-medium text-lg'>Vincular ingressos ao membro</h3>

          {/* Tickets selecionados */}
          {selectedTickets.length > 0 && (
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">
                {selectedTickets.length} ingresso(s) selecionado(s):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedTickets.map((ticket) => (
                  <Badge
                    className="flex items-center gap-1 pr-1"
                    key={ticket.id}
                    variant="secondary"
                  >
                    Nº {ticket.number} - {ticket.name ?? 'Sem nome'}
                    <button
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      onClick={() => removeSelectedTicket(ticket.id)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Input
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por número, nome, telefone..."
              value={filter}
            />
          </div>

          <div className='max-h-80 space-y-2 overflow-auto'>
            {isFetching &&
              (!accumulatedTickets || accumulatedTickets.length === 0) ? (
              <div className="py-4">Carregando...</div>
            ) : accumulatedTickets.length === 0 ? (
              <div className='py-4 text-muted-foreground text-sm'>
                Nenhum ingresso encontrado
              </div>
            ) : (
              <div className="space-y-2">
                {accumulatedTickets.map((t) => {
                  const isSelected = selectedTicketIds.has(t.id);
                  return (
                    <Card
                      className={`mb-2 cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                      key={t.id}
                      onClick={() => toggleTicket(t)}
                    >
                      <CardContent className="flex items-center justify-between">
                        <div>
                          <div className='text-muted-foreground text-sm'>
                            Nº {t.number}
                          </div>
                          <div className="font-medium">
                            {t.member?.name ?? t.name ?? 'Sem nome'}
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            {t.phone ?? ''}
                          </div>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleTicket(t)}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                disabled={!canLoadMore || isFetching}
                onClick={() => {
                  if (!canLoadMore) {
                    return;
                  }
                  setPage((p) => p + 1);
                }}
                variant="ghost"
              >
                {isFetching
                  ? 'Carregando...'
                  : canLoadMore
                    ? 'Carregar mais'
                    : 'Sem mais páginas'}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                disabled={selectedTickets.length === 0 || assignTickets.isPending}
                onClick={handleAttach}
              >
                {assignTickets.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `Vincular ${selectedTickets.length > 0 ? `(${selectedTickets.length})` : ''}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
