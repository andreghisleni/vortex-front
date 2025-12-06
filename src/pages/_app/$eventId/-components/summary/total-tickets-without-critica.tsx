import { ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEventDashboardDataById } from '@/http/generated';
import { Loading } from './loading';
import { DASHBOARD_FIELD_DESCRIPTIONS } from './dashboard-field-descriptions';
// import { serverClient } from '@/lib/trpc/server'

export function TotalTicketWithoutCritica({ eventId }: { eventId: string }) {
  const { data, isLoading } = useGetEventDashboardDataById(eventId);

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  const {
    totalWithoutCritica,
    totalWithoutCriticaPerTicketEventRanges,
  } = data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-medium text-base">
            Total de ingressos entregues menos os devolvidos
          </CardTitle>
          <CardDescription className="text-xs">
            {DASHBOARD_FIELD_DESCRIPTIONS.totalWithoutCritica}
          </CardDescription>
        </div>
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="font-bold text-2xl">
          {String(totalWithoutCritica).padStart(4, '0')}
        </span>
        {totalWithoutCriticaPerTicketEventRanges.map((range) => (
          <p className="text-muted-foreground text-xs" key={range.type}>
            {range.type}: {String(range.ticketCount).padStart(4, '0')}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
