import xlsx from 'json-as-xlsx';

import { Button } from '@/components/ui/button';
import { agruparNumbers } from '@/utils/agrupar-numaros';
import { formatToBRL } from '@/utils/formatToBRL';

import type { Member, Ticket } from '..';

export function ExportButton({
  members,
  tickets,
  ticketsWithCritica,
  ticketRanges,
}: {
  members: Member[];
  tickets: Ticket[];
  ticketsWithCritica: Ticket[];
  ticketRanges?: {
    id: string;
    type: string;
    start: number;
    end: number;
    cost: number | null;
  }[];
}) {
  function handleExport() {
    // Ordenar membros: dos que pagaram mais até os que estão devendo (balance decrescente)
    const sortedMembers = [...members].sort((a, b) => b.total - a.total);

    xlsx(
      [
        {
          sheet: 'Membros',
          columns: [
            { label: 'VisionId', value: 'visionId' },
            { label: 'Nome', value: 'name' },
            { label: 'Seção', value: 'session' },
            { label: 'N° Tickets', value: 'tickets' },
            { label: 'Números', value: 'numbers' },
            { label: 'A retirar', value: 'tickets-a-retirar' },
            // Colunas de quantidade por range
            ...(ticketRanges?.map((range) => ({
              label: `Qtd ${range.type}`,
              value: `qtd-${range.type}`,
            })) || []),
            // Colunas de valor por range
            ...(ticketRanges?.map((range) => ({
              label: `Valor ${range.type}`,
              value: `valor-${range.type}`,
            })) || []),
            { label: 'Valor Total Tickets', value: 'totalAmount' },
            { label: 'Total Pago', value: 'totalPayed' },
            { label: 'Pago PIX', value: 'totalPayedWithPix' },
            { label: 'Pago Dinheiro', value: 'totalPayedWithCash' },
            { label: 'Balance', value: 'total' },
            { label: 'Balance (R$)', value: 'totalFormatted' },
          ],
          content: sortedMembers.map((item) => {
            const ticketsByRangeMap = new Map(
              item.ticketsByRange.map((tbr) => [tbr.eventTicketRangeId, tbr])
            );

            return {
              visionId: item.visionId || '-',
              name: item.name,
              session: item.session.name,
              tickets: item.tickets.length,
              numbers: agruparNumbers(item.tickets.map((t) => t.number)).join(
                '\n'
              ),
              'tickets-a-retirar': item.tickets.filter(
                (t) => !(t.deliveredAt || t.returned)
              ).length,
              // Quantidade por range
              ...(ticketRanges?.reduce((acc, range) => {
                const ticketByRange = ticketsByRangeMap.get(range.id);
                return {
                  // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                  ...acc,
                  [`qtd-${range.type}`]: ticketByRange?.quantity || 0,
                };
              }, {}) || {}),
              // Valor por range
              ...(ticketRanges?.reduce((acc, range) => {
                const ticketByRange = ticketsByRangeMap.get(range.id);
                return {
                  // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                  ...acc,
                  [`valor-${range.type}`]: ticketByRange?.totalValue || 0,
                };
              }, {}) || {}),
              totalAmount: item.totalAmount,
              totalPayed: item.totalPayed,
              totalPayedWithPix: item.totalPayedWithPix,
              totalPayedWithCash: item.totalPayedWithCash,
              total: item.total,
              totalFormatted: formatToBRL(item.total),
            };
          }),
        },
        {
          sheet: 'Tickets',
          columns: [
            { label: 'N', value: 'number' },
            { label: 'Nome', value: 'name' },
            { label: 'Seção', value: 'session' },
            { label: 'Critica', value: 'returned' },
          ],
          content: tickets.map((t) => ({
            number: t.number,
            name: t.member?.name || 'Sem nome',
            session: t.member?.session.name || 'Sem seção',
            returned: t.returned ? 'Sim' : 'Não',
          })),
        },
        {
          sheet: 'Tickets com crítica',
          columns: [
            { label: 'N', value: 'number' },
            { label: 'Nome', value: 'name' },
            { label: 'Seção', value: 'session' },
            { label: 'Critica', value: 'returned' },
          ],
          content: ticketsWithCritica.map((t) => ({
            number: t.number,
            name: t.member?.name || 'Sem nome',
            session: t.member?.session.name || 'Sem seção',
            returned: t.returned ? 'Sim' : 'Não',
          })),
        },
      ],
      {
        fileName: 'tickets-nao-retirados',
      }
    );
  }

  return <Button onClick={handleExport}>Exportar</Button>;
}
