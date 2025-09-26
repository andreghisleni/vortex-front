import type { ColumnDef } from '@tanstack/react-table';
import { tdb } from '@/components/TableDataButton';
import { tdbNew } from '@/components/table/TableDataButton';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Member = {
  visionId: string;
  name: string;
  session: {
    name: string;
  };
  totalTickets: number;
  numbers: string[];
  ticketsARetirar: number;
};

export const columns: ColumnDef<Member>[] = [
  tdb('visionId', 'Vision'),
  tdb('name', 'Nome'),
  tdb('session.name', 'Seção'),
  tdb('totalTickets', 'N° Tickets'),
  tdbNew({ name: 'numbers', label: 'Números', dataType: 'array' }),
  tdbNew({ name: 'ticketsARetirar', label: 'A retirar' }),
  // tdb('ticketsARetirarCalabresa', 'A retirar Calabresa'),
  // tdb('ticketsARetirarMista', 'A retirar Mista'),
];
