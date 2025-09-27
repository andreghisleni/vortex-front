'use client'

import { RouterOutput } from '@pizza/trpc'
import { ColumnDef } from '@tanstack/react-table'

import { tdb } from '@/components/TableDataButton'

import { DeleteTicketRangeButton } from './delete-ticket-button'
import { TicketRangeForm } from './ticket-range-form'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Member = RouterOutput['getMembers']['members'][0] & {
  totalTickets: number
  totalTicketsToGenerate: number
}

type ColumnsProps = {
  refetch: () => void
}

export const columns = ({ refetch }: ColumnsProps): ColumnDef<Member>[] => [
  tdb('visionId', 'Vision'),
  tdb('name', 'Nome'),
  // {
  //   accessorKey: 'cleanName',
  //   header: 'Nome',
  //   cell: ({ row }) => {
  //     return <span>{row.original.name}</span>
  //   },
  // },
  tdb('register', 'Registro'),
  tdb('session.name', 'Seção'),

  tdb('totalTickets', 'N° Tickets'),
  tdb('totalTicketsToGenerate', 'N° Tickets a gerar'),
  {
    id: 'calabresa',
    header: 'Calabresa',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          {row.original.ticketRanges
            .filter((f) => f.start < 1001)
            .map((f, i) =>
              f.generatedAt ? (
                <span key={i}>
                  {f.start.toString().padStart(4, '0')}
                  {' - '}
                  {f.end.toString().padStart(4, '0')}
                </span>
              ) : (
                <DeleteTicketRangeButton key={i} id={f.id} refetch={refetch}>
                  {f.start.toString().padStart(4, '0')}
                  {' - '}
                  {f.end.toString().padStart(4, '0')}
                </DeleteTicketRangeButton>
              ),
            )}
        </div>
      )
    },
  },
  {
    id: 'mistas',
    header: 'Mistas',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          {row.original.ticketRanges
            .filter((f) => f.start > 1999)
            .map((f, i) =>
              f.generatedAt ? (
                <span key={i}>
                  {f.start.toString().padStart(4, '0')}
                  {' - '}
                  {f.end.toString().padStart(4, '0')}
                </span>
              ) : (
                <DeleteTicketRangeButton key={i} id={f.id} refetch={refetch}>
                  {f.start.toString().padStart(4, '0')}
                  {' - '}
                  {f.end.toString().padStart(4, '0')}
                </DeleteTicketRangeButton>
              ),
            )}
        </div>
      )
    },
  },
  // {
  //   id: 'tickets-a-retirar',
  //   header: tableDataButton('A retirar'),
  //   cell: ({ row }) => {
  //     return (
  //       <span>
  //         {row.original.tickets.length -
  //           row.original.tickets.filter((t) => !!t.deliveredAt).length}
  //       </span>
  //     )
  //   },

  //   sortingFn: (rowA, rowB, columnId) => {
  //     const vRowA = rowA.getValue<Member>(columnId)
  //     const vRowB = rowB.getValue<Member>(columnId)

  //     const numA =
  //       vRowA.tickets.length -
  //       vRowA.tickets.filter((t) => !!t.deliveredAt).length
  //     const numB =
  //       vRowB.tickets.length -
  //       vRowB.tickets.filter((t) => !!t.deliveredAt).length

  //     return numA < numB ? 1 : numA > numB ? -1 : 0
  //   },
  // },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <>
        <TicketRangeForm refetch={refetch} memberId={row.original.id} />
        {/*
        <Dialog>
          <DialogTrigger asChild>
            <Button>Tickets</Button>
          </DialogTrigger>
          <DialogContent className="min-w-4 max-w-7xl">
            <DialogHeader>
              <DialogTitle>Tickets: {row.original.name}</DialogTitle>
            </DialogHeader>
            <DataTable
              columns={columnsTickets({ refetch })}
              data={row.original.tickets}
              initialColumnVisibility={{ cleanName: false }}
            />
          </DialogContent>
        </Dialog> */}
      </>
    ),
  },
  // { accessorKey: 'cleanName', header: 'N', size: 0 },
]
