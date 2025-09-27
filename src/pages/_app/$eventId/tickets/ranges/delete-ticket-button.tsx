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
  id: string
  refetch: () => void
  children: React.ReactNode
}

export function DeleteTicketRangeButton({ id, refetch, children }: IProps) {
  const { toast } = useToast()
  const { mutateAsync: deleteTicket, isPending: isPendingTicket } =
    trpc.deleteTicketRange.useMutation({
      onSuccess: () => {
        toast({
          title: 'Sucesso',
          description: 'Faixa de ingresso excluída com sucesso',
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

  async function handleDeleteTicket() {
    await deleteTicket({
      id,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={isPendingTicket}
          variant="link"
          className="m-0 justify-start p-0"
        >
          {isPendingTicket ? <Loader2 className="animate-spin" /> : children}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        Tem certeza que deseja excluir essa faixa de ingressos?
        <div className="flex">
          <Button
            variant="destructive"
            onClick={handleDeleteTicket}
            size="sm"
            className="mt-4"
            disabled={isPendingTicket}
          >
            Excluir
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
