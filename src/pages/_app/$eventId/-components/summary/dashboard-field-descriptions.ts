/**
 * Mapeamento de campos do dashboard para suas descrições do OpenAPI
 * Essas descrições vêm do schema OpenAPI e são usadas nos cards do dashboard
 */
export const DASHBOARD_FIELD_DESCRIPTIONS: Record<string, string> = {
  totalTickets: 'Total de ingressos do evento (todos os ingressos, independente de estarem vinculados a membros)',
  totalTicketsLinkedToMembers: 'Total de ingressos vinculados a membros (memberId não nulo)',
  totalWithoutCritica: 'Total de ingressos não devolvidos (returned = false) e vinculados a membros',
  totalDeliveredTickets: 'Total de ingressos entregues (deliveredAt não nulo) e vinculados a membros',
  totalWithCritica: 'Total de ingressos devolvidos (returned = true) e vinculados a membros',
  totalPayedTickets: 'Total de ingressos pagos (contagem de ingressos de membros quitados, onde totalPaymentsMade >= totalCostExpected)',
  totalUnpaidTickets: 'Total de ingressos não pagos (contagem de ingressos de membros que ainda não quitaram, onde totalPaymentsMade < totalCostExpected)',
  totalConfirmedButUnpaidTickets: 'Total de ingressos confirmados mas não quitados (ingressos de membros com isAllConfirmedButNotYetFullyPaid = true e que ainda não quitaram)',
  possibleTotalTickets: 'Total possível de ingressos (soma de ingressos de membros quitados OU com isAllConfirmedButNotYetFullyPaid = true)',
  totalValuePayedTickets: 'Valor total pago em ingressos (soma de todos os pagamentos não deletados de membros do evento)',
  totalMembers: 'Total de membros do evento',
  totalWithCriticaAndDelivered: 'Total de ingressos devolvidos (returned = true) e entregues (deliveredAt não nulo) vinculados a membros',
};

