import { Metadata } from 'next'
import { unstable_noStore } from 'next/cache'

import { serverClient } from '@/lib/trpc/server'

import { TicketPaymentsTable } from './ticket-payment-table'

export const metadata: Metadata = {
  title: 'Membros - Pagamentos',
}

export default async function TicketRangesPage() {
  unstable_noStore()

  const { members } = await serverClient.getMembers()

  return <TicketPaymentsTable members={members} />
}
