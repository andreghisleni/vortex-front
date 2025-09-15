import { createFileRoute } from '@tanstack/react-router';

import { DataTable } from '@/components/data-table';
import { useGetEventMembers } from '@/http/generated';
import { columns } from './-components/columns';

// import { MemberForm } from './member-form';

export const Route = createFileRoute('/_app/$eventId/members/')({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Route.useParams().eventId;
  const { data } = useGetEventMembers(eventId);

  if (!data) {
    return null;
  }

  return (
    <div className="px-8 pt-8">
      <h2 className="font-bold text-3xl tracking-tight">Membros</h2>
      <DataTable
        addComponent={
          <>
            {/* <Button asChild color="emerald">
                <Link href="/app/settings/members/import">Importar</Link>
              </Button>
              <Button asChild color="indigo">
                <Link href="/app/settings/members/export">Exportar</Link>
              </Button> */}
            {/* <MemberForm
                refetch={refetch}
                sessions={sessionsData?.sessions || []}
              /> */}
          </>
        }
        columns={columns}
        data={data.map((member) => ({
          ...member,
          totalTickets: member.tickets.length,
          totalTicketsToDeliver: member.tickets.filter(
            (ticket) => !ticket.deliveredAt
          ).length,
        }))}
      />
    </div>
  );
}
