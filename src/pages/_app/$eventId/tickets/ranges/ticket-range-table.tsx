'use client'

import React from 'react'
import { useLocalStorage } from 'react-storage-complete'

import { DataTable } from '@/components/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/react'

import { columns, Member } from './columns'
import { GenerateTicketsButton } from './generate-tickets-button'

type IProps = {
  members: Member[]
}

export const TicketRangesTable: React.FC<IProps> = ({ members }) => {
  const { data, refetch } = trpc.getMembers.useQuery()

  // const [name, setName] = useLocalStorage('name')

  const d =
    data?.members?.map((member) => ({
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
    })) || members

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /> */}
        <DataTable
          columns={columns({ refetch })}
          data={d}
          addComponent={
            <GenerateTicketsButton
              refetch={refetch}
              totalToGenerate={d.reduce(
                (acc, member) => acc + member.totalTicketsToGenerate,
                0,
              )}
            />
          }
        />
      </CardContent>
    </Card>
  )
}
