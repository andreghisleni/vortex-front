import xlsx from "json-as-xlsx";

import { Button } from "@/components/ui/button";
import { formatToBRL } from "@/utils/formatToBRL";

import type { Member } from "..";

export function ExportButton({
  members,
  ticketRanges,
}: {
  members: Member[];
  ticketRanges?: {
    id: string;
    type: string;
    start: number;
    end: number;
  }[];
}) {
  function handleExport() {
    xlsx(
      [
        {
          sheet: "Devedores",
          columns: [
            { label: "#", value: "order" },
            { label: "VisionId", value: "visionId" },
            { label: "Nome", value: "name" },
            { label: "Seção", value: "session" },
            { label: "N° Tickets", value: "totalTickets" },
            { label: "N° Retornos", value: "totalReturned" },
            ...(ticketRanges?.map((range) => ({
              label: range.type,
              value: range.type,
            })) || []),
            { label: "Valor Total", value: "totalAmount" },
            { label: "Pgto Total", value: "totalPayed" },
            { label: "Saldo", value: "total" },
            { label: "Saldo (R$)", value: "totalFormatted" },
          ],
          content: members.map((item) => ({
            order: item.order || "-",
            visionId: item.visionId || "-",
            name: item.name,
            session: item.session.name,
            totalTickets: item.totalTickets,
            totalReturned: item.totalReturned,
            ...(ticketRanges?.reduce((acc, range) => {
              const ticketsByRange = item.ticketsByRange || [];
              const ticketByRange = ticketsByRange.find(
                (t: any) => t.eventTicketRangeId === range.id
              );
              return {
                // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                ...acc,
                [range.type]: ticketByRange?.quantity || 0,
              };
            }, {}) || {}),
            totalAmount: item.totalAmount,
            totalPayed: item.totalPayed,
            total: item.total,
            totalFormatted: formatToBRL(item.total),
          })),
        },
      ],
      {
        fileName: "membros-devedores",
      }
    );
  }

  return (
    <Button className="mt-4" onClick={handleExport}>
      Exportar para Excel
    </Button>
  );
}

