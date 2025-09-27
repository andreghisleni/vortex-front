import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from '@/components/data-table';
import { useGetAllScoutSessions } from '@/http/generated';
import { columns } from './-/columns';
import { SessionForm } from './-/session-form';

export const Route = createFileRoute('/_app/sessions/')({
  component: SessionsPage,
});

function SessionsPage() {
  const { data, isLoading } = useGetAllScoutSessions();
  return (
    <div className="px-8 pt-8">
      <h2 className="font-bold text-3xl tracking-tight">Equipes</h2>
      <DataTable
        addComponent={<SessionForm />}
        columns={columns}
        data={data || []}
        loading={isLoading}
      />
    </div>
  );
}
