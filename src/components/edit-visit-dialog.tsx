'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateVisitAction } from '@/app/actions';
import type { Visit } from '@/lib/types';

const visitFormSchema = z.object({
  date: z.date({ required_error: 'Se requiere una fecha de visita.' }),
  padecimiento: z.string(),
  exploracion: z.string(),
  tratamientoActual: z.string(),
  tratamientoHomeopatico: z.string(),
});

type VisitFormValues = z.infer<typeof visitFormSchema>;

interface EditVisitDialogProps {
    visit: Visit;
}

export function EditVisitDialog({ visit }: EditVisitDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      date: parseISO(visit.date),
      padecimiento: visit.padecimiento,
      exploracion: visit.exploracion,
      tratamientoActual: visit.tratamientoActual,
      tratamientoHomeopatico: visit.tratamientoHomeopatico,
    },
  });

  const onSubmit = async (data: VisitFormValues) => {
    const result = await updateVisitAction({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      visitId: visit.id,
      patientId: visit.patientId,
    });
    
    if(result?.success){
        toast({
            title: 'Éxito',
            description: 'Se ha actualizado la visita.',
        });
        setOpen(false);
    } else {
        const errorMessage =
          result?.errors
            ? Object.values(result.errors)
                .flat()
                .join(', ')
            : 'Error al actualizar la visita.';
        toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
                <DialogTitle>Editar Visita</DialogTitle>
                <DialogDescription>Modifique los detalles de la visita a continuación.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de la Visita</FormLabel>
                    <Controller
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <DatePicker
                                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                placeholderText="DD-MM-AAAA"
                                onChange={(date) => field.onChange(date)}
                                selected={field.value}
                                dateFormat="dd-MM-yyyy"
                            />
                        )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="padecimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Padecimiento</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ej., tos persistente, fiebre leve..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exploracion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exploración</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Resultados de la exploración física..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tratamientoActual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamiento Actual</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ej., Amoxicilina 500mg cada 8 horas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tratamientoHomeopatico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamiento Homeopático</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tratamientos homeopáticos prescritos..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}