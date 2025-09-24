'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/components/data-table';

import { tdbs } from '@/components/TableDataButton-server';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { GetEventMembers200 } from '@/http/generated';
import { agruparNumbers } from '@/utils/agrupar-numaros';
import { columnsTickets } from './columns-tickets';
import { MemberForm } from './member-form';
// import { MemberForm, Session } from './member-form'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Member = GetEventMembers200['data'][0] & {
  totalTickets: number;
  totalTicketsToDeliver: number;
};

export const columns: ColumnDef<Member>[] = [
  tdbs('visionId', 'Vision'),
  tdbs('name', 'Nome'),
  // {
  //   accessorKey: 'cleanName',
  //   header: 'Nome',
  //   cell: ({ row }) => {
  //     return <span>{row.original.name}</span>
  //   },
  // },
  tdbs('register', 'Registro'),
  tdbs('session.name', 'Seção'),
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    cell: ({ row }) => {
      return (
        <span>
          {format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy HH:mm')}
        </span>
      );
    },
  },
  // tdb('tickets', 'N° Tickets'),
  // {
  //   id: 'tickets',
  //   header: tableDataButton('N° Tickets'),
  //   cell: ({ row }) => {
  //     return <span>{row.original.tickets.length}</span>
  //   },

  //   sortingFn: (rowA, rowB, columnId) => {
  //     const numA = rowA.getValue<Member>(columnId).tickets.length
  //     const numB = rowB.getValue<Member>(columnId).tickets.length

  //     return numA < numB ? 1 : numA > numB ? -1 : 0
  //   },
  // },
  tdbs('totalTickets', 'N° Tickets'),
  {
    id: 'faixas',
    header: 'Números',
    cell: ({ row }) => {
      const numeros = row.original.tickets.map((ticket) => ticket.number);

      const faixa = agruparNumbers(numeros);
      return (
        <div className="flex flex-col">
          {faixa.map((f, i) => (
            <span key={i.toString()}>{f}</span>
          ))}
        </div>
      );
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
  // tdb('totalTicketsToDeliver', 'A retirar'),
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {/* <Button asChild size="icon" variant="outline">
          <Link
            params={{ id: row.original.id }}
            to={'/app/settings/member/:id'}
          >
            <Eye />
          </Link>
        </Button> */}
        <MemberForm member={row.original} />

        <Dialog>
          <DialogTrigger asChild>
            <Button>Tickets</Button>
          </DialogTrigger>
          <DialogContent className="min-w-4 max-w-7xl">
            <DialogHeader>
              <DialogTitle>Tickets: {row.original.name}</DialogTitle>
            </DialogHeader>
            <DataTable
              columns={columnsTickets}
              data={row.original.tickets}
              initialColumnVisibility={{ cleanName: false }}
            />
          </DialogContent>
        </Dialog>
      </div>
    ),
  },
  // { accessorKey: 'cleanName', header: 'N', size: 0 },
];
