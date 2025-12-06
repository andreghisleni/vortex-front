import { PackageSearch } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEventDashboardDataById } from '@/http/generated';
import { Loading } from './loading';

// import { serverClient } from '@/lib/trpc/server'

export function TotalTicketWithoutDelivered({ eventId }: { eventId: string }) {
  const { data, isLoading } = useGetEventDashboardDataById(eventId);

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  const { totalDeliveredTickets, totalTicketsLinkedToMembers } = data;

  const totalToDeliver = totalTicketsLinkedToMembers - totalDeliveredTickets;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-medium text-base">
            Total de ingressos a entregar
          </CardTitle>
          <CardDescription className="text-xs">
            Diferença entre total de ingressos vinculados a membros e total de ingressos entregues
          </CardDescription>
        </div>
        <PackageSearch className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="font-bold text-2xl">
          {String(totalToDeliver).padStart(4, '0')}
        </span>
        <p className="text-muted-foreground text-xs">
          (Total de ingressos - Total de ingressos entregues)
        </p>
        <p className="text-muted-foreground text-xs">
          ({totalTicketsLinkedToMembers} - {totalDeliveredTickets})
        </p>
      </CardContent>
    </Card>
  );
}
