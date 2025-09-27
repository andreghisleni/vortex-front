import { Metadata } from 'next'
import { unstable_noStore } from 'next/cache'

import { serverClient } from '@/lib/trpc/server'

import { TicketRangesTable } from './ticket-range-table'

export const metadata: Metadata = {
  title: 'Equipes',
}

export default async function TicketRangesPage() {
  unstable_noStore()

  const { members } = await serverClient.getMembers()

  return (
    <TicketRangesTable
      members={members.map((member) => ({
        ...member,
        totalTickets: member.ticketRanges.reduce((acc, ticketRange) => {
          const numbers: number[] = []

          for (let i = ticketRange.start; i <= ticketRange.end; i++) {
            numbers.push(i)
          }

          return acc + numbers.length
        }, 0),
        totalTicketsToGenerate: member.ticketRanges
          .filter((ticketRange) => !ticketRange.generatedAt)
          .reduce((acc, ticketRange) => {
            const numbers: number[] = []

            for (let i = ticketRange.start; i <= ticketRange.end; i++) {
              numbers.push(i)
            }

            return acc + numbers.length
          }, 0),
      }))}
    />
  )
}
