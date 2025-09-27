'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ticketRangeCreateSchema } from '@pizza/schema'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { MySelect } from '@/components/my-select'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/react'

const formName = ticketRangeCreateSchema.description

const ticketRange = undefined

export function TicketRangeForm({
  refetch,
  memberId,
}: {
  refetch: () => void
  memberId: string
}) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const form = useForm<z.infer<typeof ticketRangeCreateSchema>>({
    resolver: zodResolver(ticketRangeCreateSchema),
    defaultValues: undefined,
  })
  const values = {
    v: [],
  }

  const createTicketRange = trpc.createTicketRange.useMutation({
    onSuccess: () => {
      form.reset()
      setIsOpen(false)
      refetch()

      toast({
        title: `${formName} cadastrado com sucesso`,
      })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error) => {
      console.log(error) // eslint-disable-line no-console
      console.log(JSON.stringify(error)) // eslint-disable-line no-console
      toast({
        title: `Erro ao cadastrar o ${formName}`,
        description: error.message,

        variant: 'destructive',
      })
    },
  })

  // const updateTicketRange = trpc.updateTicketRange.useMutation({
  //   onSuccess: () => {
  //     form.reset()
  //     setIsOpen(false)
  //     refetch()

  //     toast({
  //       title: `${formName} atualizado com sucesso`,
  //     })
  //   },
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   onError: (error: any) => {
  //     console.log(error) // eslint-disable-line no-console
  //     toast({
  //       title: `Erro ao atualizar o ${formName}`,
  //       description: error.response?.data as string,

  //       variant: 'destructive',
  //     })
  //   },
  // })

  async function onSubmit(values: z.infer<typeof ticketRangeCreateSchema>) {
    try {
      if (ticketRange) {
        //   await updateTicketRange.mutateAsync({
        //     id: ticketRange.id,
        //     ...values,
        //   })
      } else {
        if (values.end && values.start > values.end) {
          toast({
            title: `O número inicial não pode ser maior que o número final`,
            variant: 'destructive',
          })
          return
        }

        if (
          values.end &&
          !(
            (values.start > 0 && values.end <= 1000) ||
            (values.start >= 2000 && values.end <= 3000)
          )
        ) {
          toast({
            title: `O número inicial e final devem estar entre 1 e 1000 ou entre 2000 e 3000`,
            variant: 'destructive',
          })
          return
        }

        if (
          !values.end &&
          !(
            (values.start > 0 && values.start <= 1000) ||
            (values.start > 2000 && values.start <= 3000)
          )
        ) {
          toast({
            title: `O número inicial deve estar entre 1 e 1000 ou entre 2000 e 3000`,
            variant: 'destructive',
          })
          return
        }

        await createTicketRange.mutateAsync({ ...values, memberId })
      }

      console.log('values', values)
    } catch (error) { } // eslint-disable-line
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  // form.watch('start') && form.setValue('end', Number(form.watch('start')) + 4)

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          {ticketRange ? 'Editar' : 'Adicionar'}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {ticketRange ? 'Editar' : 'Cadastrar'} {formName}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* <pre>
              {JSON.stringify(Object.keys(ticketRangeCreateSchema.shape), null, 2)}
            </pre> */}

            {Object.keys(ticketRangeCreateSchema.shape).map((fieldName) => {
              const fieldSchema = ticketRangeCreateSchema.shape[fieldName]
              const label = fieldSchema._def.description // Obtém a descrição do campo

              if (fieldSchema._def.typeName === 'ZodEnum') {
                const v: { value: string; label: string }[] = values[fieldName]

                return (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={
                      fieldName as keyof typeof ticketRangeCreateSchema.shape
                    }
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <MySelect
                            value={field.value as string | undefined}
                            onChange={field.onChange}
                            options={v}
                            disabled={field.disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              }

              if (
                fieldSchema._def.typeName === 'ZodNumber' ||
                fieldSchema._def.typeName === 'ZodString'
              ) {
                const ifUuid = fieldSchema._def.checks?.find(
                  (c) => c.kind === 'uuid',
                )

                if (ifUuid) {
                  const v: { value: string; label: string }[] =
                    values[fieldName]

                  return (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={
                        fieldName as keyof typeof ticketRangeCreateSchema.shape
                      }
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <MySelect
                              value={field.value as string | undefined}
                              onChange={field.onChange}
                              options={v}
                              disabled={field.disabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                }

                return (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={
                      fieldName as keyof typeof ticketRangeCreateSchema.shape
                    }
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={label}
                            {...field}
                            onChange={(e) => {
                              if (fieldName === 'start') {
                                form.setValue('end', Number(e.target.value) + 2)
                              }

                              field.onChange(e)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              }

              if (fieldSchema._def.typeName === 'ZodOptional') {
                if (
                  fieldSchema._def.innerType._def.typeName === 'ZodNumber' ||
                  fieldSchema._def.innerType._def.typeName === 'ZodString'
                ) {
                  const ifUuid = fieldSchema._def.innerType._def.checks?.find(
                    (c) => c.kind === 'uuid',
                  )

                  if (ifUuid) {
                    const v: { value: string; label: string }[] =
                      values[fieldName]

                    return (
                      <FormField
                        key={fieldName}
                        control={form.control}
                        name={
                          fieldName as keyof typeof ticketRangeCreateSchema.shape
                        }
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <MySelect
                                value={field.value as string | undefined}
                                onChange={field.onChange}
                                options={v}
                                disabled={field.disabled}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  }

                  return (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={
                        fieldName as keyof typeof ticketRangeCreateSchema.shape
                      }
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={label}
                              {...field}
                              onChange={(e) => {
                                if (fieldName === 'start') {
                                  form.setValue(
                                    'end',
                                    Number(e.target.value) + 4,
                                  )
                                }

                                field.onChange(e)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                }
              }

              return null
            })}

            <Button type="submit" className="w-full">
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : ticketRange ? (
                'Editar'
              ) : (
                'Cadastrar'
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
