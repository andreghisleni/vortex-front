'use client'

import { RouterOutput } from '@pizza/trpc'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import { tdb } from '@/components/TableDataButton'

import { Member, TicketForm } from './ticket-form'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Ticket = RouterOutput['getTickets']['tickets'][0]

type ColumnsProps = {
  refetch: () => void
  members: Member[]
}

export const columns = ({
  refetch,
  members,
}: ColumnsProps): ColumnDef<Ticket>[] => [
  tdb('number', 'N'),
  tdb('member.name', 'Name'),
  {
    accessorKey: 'returned',
    header: 'Devolvidos',
    cell: ({ row }) => {
      return <span>{row.getValue('returned') ? 'Sim' : 'Não'}</span>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    cell: ({ row }) => {
      return (
        <span>
          {format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy HH:mm')}
        </span>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <TicketForm refetch={refetch} ticket={row.original} members={members} />
    ),
  },
  {
    id: 'cleanName',
    accessorKey: 'member.cleanName',
    header: 'a',
    cell: 'a',
    size: 0,
    enableHiding: false,
  },
]
