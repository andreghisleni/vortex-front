import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  getEventByIdQueryKey,
  useUpdateEventTicketRange,
  useUpdateEventTicketRangeById,
} from '@/http/generated';

interface TicketRange {
  id: string;
  start: number;
  end: number;
  type: string;
  cost?: number | null;
}

interface TicketRangeEditDialogProps {
  eventId: string;
  range: TicketRange;
  allRanges: TicketRange[];
}

const MIN_DISTANCE = 5; // Distância mínima entre ranges

function isCloseToOtherRanges(
  value: number,
  currentRangeId: string,
  allRanges: TicketRange[],
  field: 'start' | 'end'
): boolean {
  for (const range of allRanges) {
    if (range.id === currentRangeId) continue;

    // Verifica se o valor está próximo do start ou end de outro range
    if (
      Math.abs(value - range.start) <= MIN_DISTANCE ||
      Math.abs(value - range.end) <= MIN_DISTANCE
    ) {
      return true;
    }

    // Verifica se o valor cairia dentro de outro range
    if (value >= range.start && value <= range.end) {
      return true;
    }
  }
  return false;
}

function getDisabledReason(
  range: TicketRange,
  allRanges: TicketRange[],
  field: 'start' | 'end'
): string | null {
  const value = field === 'start' ? range.start : range.end;

  if (field === 'start' && range.start === 1) {
    return 'O início não pode ser editado quando é igual a 1';
  }

  if (isCloseToOtherRanges(value, range.id, allRanges, field)) {
    return `O ${field === 'start' ? 'início' : 'fim'} está muito próximo de outro intervalo`;
  }

  return null;
}

export function TicketRangeEditDialog({
  eventId,
  range,
  allRanges,
}: TicketRangeEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const startDisabledReason = getDisabledReason(range, allRanges, 'start');
  const endDisabledReason = getDisabledReason(range, allRanges, 'end');

  const isStartDisabled = !!startDisabledReason;
  const isEndDisabled = !!endDisabledReason;

  // Se ambos estão desabilitados, não mostra o botão de editar
  const canEdit = !isStartDisabled || !isEndDisabled;

  const formSchema = z
    .object({
      start: z.coerce.number().int().min(1, 'O início deve ser pelo menos 1'),
      end: z.coerce.number().int().min(1, 'O fim deve ser pelo menos 1'),
    })
    .refine((data) => data.end >= data.start, {
      message: 'O fim deve ser maior ou igual ao início',
      path: ['end'],
    })
    .refine(
      (data) => {
        // Valida que o novo start não conflita com outros ranges
        return !isCloseToOtherRanges(data.start, range.id, allRanges, 'start');
      },
      {
        message: 'O valor está muito próximo ou dentro de outro intervalo',
        path: ['start'],
      }
    )
    .refine(
      (data) => {
        // Valida que o novo end não conflita com outros ranges
        return !isCloseToOtherRanges(data.end, range.id, allRanges, 'end');
      },
      {
        message: 'O valor está muito próximo ou dentro de outro intervalo',
        path: ['end'],
      }
    );

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: range.start,
      end: range.end,
    },
  });

  const { mutateAsync, isPending } = useUpdateEventTicketRange({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getEventByIdQueryKey(eventId),
        });
        toast.success('Intervalo atualizado com sucesso');
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error('Erro ao atualizar intervalo', {
          description: error.response?.data?.error,
        });
      },
    },
  });

  async function onSubmit(data: FormData) {
    await mutateAsync({
      eventId,
      id: range.id,
      data: {
        start: isStartDisabled ? undefined : data.start,
        end: isEndDisabled ? undefined : data.end,
      },
    });
  }

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Intervalo</DialogTitle>
          <DialogDescription>
            Editando intervalo do tipo "{range.type}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="start"
              disabled={isStartDisabled}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Início</FormLabel>
                  <FormControl>
                    <Input
                      min={1}
                      type="number"
                      disabled={isStartDisabled}
                      {...field}
                    />
                  </FormControl>
                  {startDisabledReason && (
                    <FormDescription className="text-yellow-600 dark:text-yellow-500">
                      {startDisabledReason}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              disabled={isEndDisabled}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fim</FormLabel>
                  <FormControl>
                    <Input
                      min={1}
                      type="number"
                      disabled={isEndDisabled}
                      {...field}
                    />
                  </FormControl>
                  {endDisabledReason && (
                    <FormDescription className="text-yellow-600 dark:text-yellow-500">
                      {endDisabledReason}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                onClick={() => setIsOpen(false)}
                type="button"
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? <Loader2 className="animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

