import { Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEventDashboardDataById } from '@/http/generated';
import { Loading } from './loading';
import { DASHBOARD_FIELD_DESCRIPTIONS } from './dashboard-field-descriptions';

export function TotalConfirmedButUnpaidTicket({ eventId }: { eventId: string }) {
  const { data, isLoading } = useGetEventDashboardDataById(eventId);

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  const {
    totalConfirmedButUnpaidTickets,
    totalConfirmedButUnpaidTicketsPerType,
  } = data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-medium text-base">
            Total de ingressos confirmados mas não pagos
          </CardTitle>
          <CardDescription className="text-xs">
            {DASHBOARD_FIELD_DESCRIPTIONS.totalConfirmedButUnpaidTickets}
          </CardDescription>
        </div>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="font-bold text-2xl">
          {String(totalConfirmedButUnpaidTickets).padStart(4, '0')}
        </span>
        {totalConfirmedButUnpaidTicketsPerType.map((item) => (
          <p className="text-muted-foreground text-xs" key={item.type}>
            {item.type}: {String(item.ticketCount).padStart(4, '0')}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

