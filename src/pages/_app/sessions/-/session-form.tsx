'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { generateFormFieldsFromZodSchema } from '@/components/generate-form-fields-from-zod-schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
  getAllScoutSessionsQueryKey,
  useCreateScoutSession,
  useUpdateScoutSessionById,
} from '@/http/generated';
import type { Session } from './columns';

const sessionSchema = z
  .object({
    name: z.string().describe('Nome'),
    type: z.string().describe('Tipo'),
  })
  .describe('Sessão');

const formName = sessionSchema.description;

const values = {
  type: {
    values: [
      { value: 'LOBINHO', label: 'Lobinho' },
      { value: 'ESCOTEIRO', label: 'Escoteiro' },
      { value: 'SENIOR', label: 'Senior' },
      { value: 'PIONEIRO', label: 'Pioneiro' },
      { value: 'OUTRO', label: 'Outro' },
    ],
    loading: false,
  },
};

export function SessionForm({ session }: { session?: Session }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session
      ? {
          ...session,
        }
      : undefined,
    values: session
      ? {
          ...session,
        }
      : undefined,
  });

  const createSession = useCreateScoutSession({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAllScoutSessionsQueryKey(),
        });
        form.reset();
        setIsOpen(false);

        toast.success(`${formName} cadastrado com sucesso`);
      },

      onError: (error) => {
        // biome-ignore lint/suspicious/noConsole: here
        console.log(error);
        toast(`Erro ao cadastrar o ${formName}`, {
          description: error.response?.data?.error,
        });
      },
    },
  });

  const updateSession = useUpdateScoutSessionById({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getAllScoutSessionsQueryKey(),
        });
        form.reset();
        setIsOpen(false);

        toast(`${formName} atualizado com sucesso`);
      },
      onError: (error) => {
        // biome-ignore lint/suspicious/noConsole: here
        console.log(error);
        toast(`Erro ao atualizar o ${formName}`, {
          description: error.response?.data?.error,
        });
      },
    },
  });

  async function onSubmit(v: z.infer<typeof sessionSchema>) {
    if (session) {
      await updateSession.mutateAsync({
        id: session.id,
        data: v,
      });
    } else {
      await createSession.mutateAsync({
        data: v,
      });
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{session ? 'Editar' : 'Adicionar'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {session ? 'Editar' : 'Cadastrar'} {formName}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* <pre>
              {JSON.stringify(Object.keys(sessionSchema.shape), null, 2)}
            </pre> */}

            {generateFormFieldsFromZodSchema(sessionSchema, form, values)}

            <Button className="w-full" type="submit">
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : session ? (
                'Editar'
              ) : (
                'Cadastrar'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
