import { BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEventDashboardDataById } from '@/http/generated';
import { Loading } from './loading';

export function TotalPredictedPayedTicket({ eventId }: { eventId: string }) {
  const { data, isLoading } = useGetEventDashboardDataById(eventId);

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  const { possibleTotalTickets, totalPredictedTicketsPerType } = data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-base">
          Total de ingressos que devem ser pagos
        </CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        <span className="font-bold text-2xl">
          {String(possibleTotalTickets).padStart(4, '0')}
        </span>
        {totalPredictedTicketsPerType.map((item) => (
          <p className="text-muted-foreground text-xs" key={item.type}>
            {item.type}: {String(item.ticketCount).padStart(4, '0')}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
