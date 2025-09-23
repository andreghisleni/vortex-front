import { createFileRoute } from '@tanstack/react-router';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { Suspense } from 'react';
import { DataTable } from '@/components/data-table';
import { Pagination } from '@/components/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { useGetEventByEventIdMembers } from '@/http/generated';
import { columns } from './-components/columns';

// import { MemberForm } from './member-form';

export const Route = createFileRoute('/_app/$eventId/members/')({
  component: RouteComponent,
});

function RouteComponent() {
  const eventId = Route.useParams().eventId;
  const [{ pageIndex, pageSize }] = useQueryStates(
    {
      // pageIndex é um inteiro, com valor padrão 0
      pageIndex: parseAsInteger.withDefault(0),
      // pageSize é uma string, com valor padrão '10' (pode ser parseAsInteger se preferir)
      pageSize: parseAsInteger.withDefault(10),
    },
    {
      // Atualiza a URL sem rolar a página para o topo
      shallow: false,
    }
  );
  const { data, isLoading } = useGetEventByEventIdMembers(eventId, {
    pagination: {
      page: pageIndex,
      pageSize,
    },
  });

  const { totalPages, total, navigateToPage, setPageSize, showing } =
    usePagination({
      total: data?.meta.total,
      showing: data?.data.length,
    });

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
        data={data.data.map((member) => ({
          ...member,
          totalTickets: member.tickets.length,
          totalTicketsToDeliver: member.tickets.filter(
            (ticket) => !ticket.deliveredAt
          ).length,
        }))}
        loading={isLoading}
        paginationComponent={
          <Suspense fallback={null}>
            <Pagination
              {...{
                items: total,
                page: pageIndex,
                pages: totalPages,
                limit: pageSize,
                showing,
                handleUpdatePage: (p) => {
                  navigateToPage(p);
                },
                handleChangeLimit: (l) => {
                  setPageSize(`${l}`);
                },
              }}
            />
          </Suspense>
        }
      />
      <pre>{JSON.stringify(data.meta, null, 2)}</pre>
    </div>
  );
}
