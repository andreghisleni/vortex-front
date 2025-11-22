import { BarChart } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEventDashboardDataById } from '@/http/generated';
import { Loading } from './loading';
// import { serverClient } from '@/lib/trpc/server'

export function TotalTicketsLinkedToMembers({ eventId }: { eventId: string }) {
  const { data, isLoading } = useGetEventDashboardDataById(eventId);

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  const {
    totalTicketsLinkedToMembers,
    totalTicketsPerRangeLinkedToMembers,
  } = data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-base">
          Total de ingressos vinculados a membros
        </CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="font-bold text-2xl">
          {String(totalTicketsLinkedToMembers).padStart(4, '0')}
        </span>
        {totalTicketsPerRangeLinkedToMembers.map((range) => (
          <p className="text-muted-foreground text-xs" key={range.type}>
            {range.type}: {String(range.ticketCount).padStart(4, '0')}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
