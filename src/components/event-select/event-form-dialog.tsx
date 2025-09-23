import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { getEventsQueryKey, usePostEvents } from '@/http/generated';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  ticketType: z.enum(['SINGLE_NUMERATION', 'MULTIPLE_NUMERATIONS']),
});

export type EventFormData = z.infer<typeof formSchema>;

export function EventFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EventFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Feijoada 2025',
      description: '',
      ticketType: 'SINGLE_NUMERATION',
    },
  });

  const { mutate: postEvent } = usePostEvents({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getEventsQueryKey(),
        });
        toast.success('Event created successfully');
        setIsOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(`Error creating event: ${error.message}`);
      },
    },
  });

  async function onSubmit(data: EventFormData) {
    await postEvent({
      data: {
        name: data.name,
        description: data.description || null,
        ticketType: data.ticketType,
      },
    });
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start font-normal" variant="ghost">
          <PlusIcon aria-hidden="true" className="-ms-2 opacity-60" size={16} />
          New Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Event Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Event Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ticketType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Type</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Ticket Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_NUMERATION">
                          Single Numeration
                        </SelectItem>
                        <SelectItem value="MULTIPLE_NUMERATIONS">
                          Multi Numeration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
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
