/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { ColumnDef } from '@tanstack/react-table';
import { tdb } from '@/components/TableDataButton';
import { tdbs } from '@/components/TableDataButton-server';
import { tdbNew } from '@/components/table/TableDataButton';
import type { GetEventMembers200 } from '@/http/generated';
import { MemberPaymentsTableModal } from './member-payments-table-modal';
import { TicketPaymentForm } from './ticket-payment-form';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Member = GetEventMembers200['data'][0] & {
  totalTickets: number;
  totalTicketsToDeliver: number;
  totalReturned: number;
  totalAmount: number;
  totalPayedWithPix: number;
  totalPayedWithCash: number;
  totalPayed: number;
  total: number;
};

export const columns = ({
  // eventId,
  ticketRanges = [],
}: {
  eventId: string;
  ticketRanges?: {
    id: string;
    type: string;
    cost: number | null;
    start: number;
    end: number;
  }[];
}): ColumnDef<Member>[] => [
    tdbs('order', '#', 80),
    tdbs('visionId', 'Vision'),
    tdbs('name', 'Nome'),
    // tdb('register', 'Registro'),
    // tdb('session.name', 'Seção'),

    tdb('totalTickets', 'N° Tickets'),
    tdb('totalReturned', 'N° Retornos'),
    ...(ticketRanges.length > 0
      ? [
        {
          id: 'ticketAllocations',
          accessorKey: 'ticketAllocations',
          header() {
            return (
              <div className="flex flex-col">
                {ticketRanges.map((range) => (
                  <span key={range.id}>{range.type}</span>
                ))}
              </div>
            );
          },
          cell: ({ row }: any) => {
            const allocations = row.original.ticketAllocations || [];
            if (allocations.length === 0) {
              return <span>-</span>;
            }
            return (
              <div className="flex flex-col">
                {ticketRanges.map((range) => {
                  return (
                    <span key={range.id}>
                      {
                        allocations.find(
                          (allocation: any) =>
                            allocation.eventTicketRangeId === range.id
                        )?.quantity
                      }
                    </span>
                  );
                })}
              </div>
            );
          },
        },
      ]
      : []),

    tdbNew({
      name: 'totalAmount',
      label: 'Valor Total',
      dataType: 'currency',
      s: true,
    }),
    tdbNew({
      name: 'totalPayedWithPix',
      label: 'Pgto Pix',
      dataType: 'currency',
    }),
    tdbNew({
      name: 'totalPayedWithCash',
      label: 'Pgto Dinheiro',
      dataType: 'currency',
    }),
    tdbNew({
      name: 'totalPayed',
      label: 'Pgto Total',
      dataType: 'currency',
      s: true,
    }),
    tdbNew({
      name: 'total',
      label: 'Saldo',
      dataType: 'currency',
      s: true,
    }),

    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        if (!row.original.tickets || row.original.tickets.length === 0) {
          return <span>Sem ingressos</span>;
        }

        if (row.original.totalTickets === row.original.totalReturned) {
          return <span>Todos retornados</span>;
        }

        if (row.original.total >= 0) {
          return (
            <div className="flex flex-col items-center gap-2">
              <span>Pago</span>
              <MemberPaymentsTableModal
                memberId={row.original.id}
                memberName={row.original.name}
                payments={row.original.payments}
                toReceive={row.original.totalAmount}
                visionId={row.original.visionId || ''}
              />
            </div>
          );
        }

        return (
          <div className="flex flex-col items-center gap-2">
            <TicketPaymentForm memberId={row.original.id} />
            {/* <ReturnTicketForm
              memberId={row.original.id}
              refetch={refetch}
              ticketsReturn={row.original.tickets.filter((t) => !t.returned)}
              total={row.original.total}
            />
            <ToggleIsAllConfirmedButNotYetFullyPaidButton
              isAllConfirmedButNotYetFullyPaid={
                row.original.isAllConfirmedButNotYetFullyPaid
              }
              memberId={row.original.id}
              refetch={refetch}
            />*/}
            <MemberPaymentsTableModal
              memberId={row.original.id}
              memberName={row.original.name}
              payments={row.original.payments}
              toReceive={row.original.totalAmount}
              visionId={row.original.visionId || ''}
            />
            {/* <--- New Button/Modal */}
          </div>
        );
      },
    },
  ];
