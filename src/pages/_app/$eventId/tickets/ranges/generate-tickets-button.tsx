'use client'

import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/react'

type IProps = {
  refetch: () => void
  totalToGenerate: number
}

export function GenerateTicketsButton({ refetch, totalToGenerate }: IProps) {
  const { toast } = useToast()
  const { mutateAsync: generateTickets, isPending: isPendingTicket } =
    trpc.generateTicketsFromTicketRange.useMutation({
      onSuccess: () => {
        toast({
          title: 'Sucesso',
          description: 'Faixa de ingresso gerada com sucesso',
        })
        refetch()
      },
      onError: (error) => {
        toast({
          title: 'Erro',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  async function handleGenerateTickets() {
    await generateTickets()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button disabled={isPendingTicket} variant="outline">
          {isPendingTicket ? (
            <Loader2 className="animate-spin" />
          ) : (
            'Gerar ingressos'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        Tem certeza que deseja gerar os ingressos não gerados ({totalToGenerate}{' '}
        números a serem gerados)?
        <div className="flex">
          <Button
            variant="destructive"
            onClick={handleGenerateTickets}
            size="sm"
            className="mt-4"
            disabled={isPendingTicket}
          >
            {isPendingTicket ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Gerar ingressos'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
