import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type z from 'zod';

import { ReactSelect } from '@/components/Select';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { trpc } from '@/lib/trpc/react';

import type { Member } from './columns';

const formName = memberCreateSchema.description;

export type Session = RouterOutput['getSessions']['sessions'][0];

export function MemberForm({
  refetch,
  member,
  sessions,
}: {
  refetch: () => void;
  member?: Member;
  sessions: Session[];
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof memberCreateSchema>>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: member
      ? {
          ...(member as any), // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      : undefined,
  });
  const values = {
    sessionId: sessions.map((session) => ({
      value: session.id,
      label: session.name,
    })),
  };

  const createMember = trpc.createMember.useMutation({
    onSuccess: () => {
      form.reset();
      setIsOpen(false);
      refetch();

      toast({
        title: `${formName} cadastrado com sucesso`,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.log(error); // eslint-disable-line no-console
      toast({
        title: `Erro ao cadastrar o ${formName}`,
        description: error.response?.data as string,

        variant: 'destructive',
      });
    },
  });

  const updateMember = trpc.updateMember.useMutation({
    onSuccess: () => {
      form.reset();
      setIsOpen(false);
      refetch();

      toast({
        title: `${formName} atualizado com sucesso`,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.log(error); // eslint-disable-line no-console
      toast({
        title: `Erro ao atualizar o ${formName}`,
        description: error.response?.data as string,

        variant: 'destructive',
      });
    },
  });

  async function onSubmit(values: z.infer<typeof memberCreateSchema>) {
    try {
      if (member) {
        await updateMember.mutateAsync({
          id: member.id,
          ...values,
        });
      } else {
        await createMember.mutateAsync(values);
      }

      console.log('values', values);
    } catch (error) {} // eslint-disable-line
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">{member ? 'Editar' : 'Adicionar'}</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {member ? 'Editar' : 'Cadastrar'} {formName}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* <pre>
              {JSON.stringify(Object.keys(memberCreateSchema.shape), null, 2)}
            </pre> */}

            {Object.keys(memberCreateSchema.shape).map((fieldName) => {
              const fieldSchema = memberCreateSchema.shape[fieldName];
              const label = fieldSchema._def.description; // Obtém a descrição do campo

              if (fieldSchema._def.typeName === 'ZodEnum') {
                const v: { value: string; label: string }[] = values[fieldName];

                return (
                  <FormField
                    control={form.control}
                    key={fieldName}
                    name={fieldName as keyof typeof memberCreateSchema.shape}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <ReactSelect
                            closeMenuOnSelect
                            defaultValue={v.filter(
                              (value) => value.value === field.value
                            )}
                            isDisabled={field.disabled}
                            onChange={(value: any) => {
                              // eslint-disable-line
                              field.onChange(value.value);
                            }}
                            options={v}
                            value={v.filter(
                              (value) => value.value === field.value
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              if (
                fieldSchema._def.typeName === 'ZodNumber' ||
                fieldSchema._def.typeName === 'ZodString'
              ) {
                const ifUuid = fieldSchema._def.checks?.find(
                  (c) => c.kind === 'uuid'
                );

                if (ifUuid) {
                  const v: { value: string; label: string }[] =
                    values[fieldName];

                  return (
                    <FormField
                      control={form.control}
                      key={fieldName}
                      name={fieldName as keyof typeof memberCreateSchema.shape}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <ReactSelect
                              closeMenuOnSelect
                              defaultValue={v.filter(
                                (value) => value.value === field.value
                              )}
                              isDisabled={field.disabled}
                              onChange={(value: any) => {
                                // eslint-disable-line
                                field.onChange(value.value);
                              }}
                              options={v}
                              value={v.filter(
                                (value) => value.value === field.value
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }

                return (
                  <FormField
                    control={form.control}
                    key={fieldName}
                    name={fieldName as keyof typeof memberCreateSchema.shape}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input placeholder={label} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              if (
                fieldSchema._def.typeName === 'ZodOptional' &&
                (fieldSchema._def.innerType._def.typeName === 'ZodNumber' ||
                  fieldSchema._def.innerType._def.typeName === 'ZodString')
              ) {
                const ifUuid = fieldSchema._def.innerType._def.checks?.find(
                  (c) => c.kind === 'uuid'
                );

                if (ifUuid) {
                  const v: { value: string; label: string }[] =
                    values[fieldName];

                  return (
                    <FormField
                      control={form.control}
                      key={fieldName}
                      name={fieldName as keyof typeof memberCreateSchema.shape}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <ReactSelect
                              closeMenuOnSelect
                              defaultValue={v.filter(
                                (value) => value.value === field.value
                              )}
                              isDisabled={field.disabled}
                              onChange={(value: any) => {
                                // eslint-disable-line
                                field.onChange(value.value);
                              }}
                              options={v}
                              value={v.filter(
                                (value) => value.value === field.value
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }

                return (
                  <FormField
                    control={form.control}
                    key={fieldName}
                    name={fieldName as keyof typeof memberCreateSchema.shape}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input placeholder={label} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }

              return null;
            })}

            <Button className="w-full" type="submit">
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : member ? (
                'Editar'
              ) : (
                'Cadastrar'
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
