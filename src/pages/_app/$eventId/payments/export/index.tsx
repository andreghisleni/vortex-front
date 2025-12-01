import { createFileRoute, Link } from "@tanstack/react-router";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  type GetEventMembers200,
  useGetEventById,
  useGetEventMembers,
} from "@/http/generated";
import { formatToBRL } from "@/utils/formatToBRL";
import { columns } from "./-components/columns";
import { ExportButton } from "./-components/export-button";

export type Member = GetEventMembers200["data"][0];

export const Route = createFileRoute("/_app/$eventId/payments/export/")({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Route.useParams().eventId as string;
  const { data: event } = useGetEventById(eventId);
  const { data, isLoading } = useGetEventMembers(eventId, {
    "f.total.lt": 0,
    "p.page": 1,
    "p.pageSize": 100_000,
    "ob.total": "asc",
  });

  const members = data?.data || [];

  const totalDebt = members.reduce((acc, member) => acc + member.total, 0);

  return (
    <div className="px-8 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl tracking-tight">
          Exportar membros devedores
        </h2>
        <Button variant="outline" asChild>
          <Link to="/$eventId/payments" params={{ eventId }}>
            Voltar
          </Link>
        </Button>
      </div>
      <div className="flex justify-between gap-16 mt-4">
        <div className="min-w-96">
          <ul className="space-y-1">
            <li>
              <span className="font-medium">Total de membros devedores: </span>
              {members.length}
            </li>
            <li>
              <span className="font-medium">Valor total em dívidas: </span>
              <span className="text-red-500 font-semibold">
                {formatToBRL(totalDebt)}
              </span>
            </li>
          </ul>

          <ExportButton
            members={members}
            ticketRanges={
              event?.autoGenerateTicketsTotalPerMember
                ? undefined
                : event?.ticketRanges || []
            }
          />
        </div>
        <div className="flex-1">
          <DataTable
            columns={columns({
              ticketRanges: event?.autoGenerateTicketsTotalPerMember
                ? undefined
                : event?.ticketRanges || [],
            })}
            data={members}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
