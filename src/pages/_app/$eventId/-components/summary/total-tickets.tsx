import { Ticket } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEventDashboardDataById } from '@/http/generated';
import { Loading } from './loading';
import { DASHBOARD_FIELD_DESCRIPTIONS } from './dashboard-field-descriptions';

// import { serverClient } from '@/lib/trpc/server'

export function TotalTicket({ eventId }: { eventId: string }) {
  const { data, isLoading } = useGetEventDashboardDataById(eventId);

  if (isLoading) {
    return <Loading />;
  }

  const totalTickets = data?.totalTickets;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-medium text-base">
            Total de ingressos entregues
          </CardTitle>
          <CardDescription className="text-xs">
            {DASHBOARD_FIELD_DESCRIPTIONS.totalTickets}
          </CardDescription>
        </div>
        <Ticket className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="font-bold text-2xl">
          {String(totalTickets).padStart(4, '0')}
        </span>
        {/* <p className="text-xs text-muted-foreground">
          + {amountLastMonth} in last 30 days
        </p> */}
      </CardContent>
    </Card>
  );
}
