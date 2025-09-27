import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { tdb } from '@/components/TableDataButton';
import type { GetAllScoutSessions200 } from '@/http/generated';
import { SessionForm } from './session-form';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Session = GetAllScoutSessions200[0];

export const columns: ColumnDef<Session>[] = [
  tdb('name', 'Nome'),
  tdb('type', 'Tipo'),
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
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <SessionForm session={row.original} />,
  },
];
