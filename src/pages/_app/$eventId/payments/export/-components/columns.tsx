/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { ColumnDef } from "@tanstack/react-table";
import { tdb } from "@/components/TableDataButton";
import { tdbNew } from "@/components/table/TableDataButton";
import type { Member } from "..";
// import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { ShowJson } from "@/components/show-json";

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
      const ticketsByRange = row.original.ticketsByRange || [];
      const ticketByRange = ticketsByRange.find(
        (ticketByRange: any) => ticketByRange.eventTicketRangeId === range.id
      );
      return <span>{ticketByRange?.quantity || "-"}</span>;
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
  // tdbNew({
  //   name: "ticketsByRange",
  //   label: "Tickets",
  //   dataType: "object",
  // }),
  // {
  //   id: "actions",
  //   header: "Ver",
  //   cell: ({ row }) => {
  //     const d = row.original;

  //   if (!d) return <span>-</span>;

  //   return (
  //     <Dialog>
  //       <DialogTrigger asChild>
  //         <Button variant="outline">Ver</Button>
  //       </DialogTrigger>
  //       <DialogContent className="max-w-2xl">
  //         <ShowJson data={typeof d === 'object' ? d : JSON.parse(d)} />
  //       </DialogContent>
  //     </Dialog>
  //   );
  //   },
  // },
];

