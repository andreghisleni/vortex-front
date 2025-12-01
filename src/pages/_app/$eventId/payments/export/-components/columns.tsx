/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { ColumnDef } from "@tanstack/react-table";
import { tdb } from "@/components/TableDataButton";
import { tdbNew } from "@/components/table/TableDataButton";
import type { Member } from "..";

type Props = {
  ticketRanges?: {
    id: string;
    type: string;
    start: number;
    end: number;
  }[];
};

export const columns = ({ ticketRanges }: Props): ColumnDef<Member>[] => [
  tdb("order", "#"),
  tdb("visionId", "Vision"),
  tdb("name", "Nome"),
  tdb("session.name", "Seção"),
  tdb("totalTickets", "N° Tickets"),
  tdb("totalReturned", "N° Retornos"),
  ...(ticketRanges?.map((range) => ({
    accessorKey: `faixa-${range.id}`,
    header: range.type,
    cell: ({ row }: any) => {
      const allocations = row.original.ticketAllocations || [];
      const allocation = allocations.find(
        (a: any) => a.eventTicketRangeId === range.id
      );
      return <span>{allocation?.quantity || "-"}</span>;
    },
  })) || []),
  tdbNew({
    name: "totalAmount",
    label: "Valor Total",
    dataType: "currency",
  }),
  tdbNew({
    name: "totalPayed",
    label: "Pgto Total",
    dataType: "currency",
  }),
  tdbNew({
    name: "total",
    label: "Saldo",
    dataType: "currency",
  }),
];

