'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import { es } from 'date-fns/locale/es';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { addVisitAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

registerLocale('es', es)

const visitFormSchema = z.object({
  date: z.date({ required_error: 'Se requiere una fecha de visita.' }),
  padecimiento: z.string(),
  exploracion: z.string(),
  tratamientoActual: z.string(),
  tratamientoHomeopatico: z.string(),
});

type VisitFormValues = z.infer<typeof visitFormSchema>;

export function AddVisitForm({ patientId }: { patientId: string }) {
  const { toast } = useToast();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      date: new Date(),
      padecimiento: '',
      exploracion: '',
      tratamientoActual: '',
      tratamientoHomeopatico: '',
    },
  });

  const onSubmit = async (data: VisitFormValues) => {
    const result = await addVisitAction({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      patientId,
    });
    
    if(result?.success){
        toast({
            title: 'Éxito',
            description: 'Se ha agregado una nueva visita.',
        });
        form.reset({
            date: new Date(),
            padecimiento: '',
            exploracion: '',
            tratamientoActual: '',
            tratamientoHomeopatico: '',
        });
        setIsCollapsibleOpen(false);
    } else {
        const errorMessage =
          result?.errors
            ? Object.values(result.errors)
                .flat()
                .join(', ')
            : 'Error al agregar la visita.';
        toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
        });
    }
  };

  return (
    <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Agregar Nueva Visita</CardTitle>
          <CardDescription>Registre un nuevo encuentro con el paciente.</CardDescription>
        </div>
        <CollapsibleTrigger asChild>
            <Button>
                {isCollapsibleOpen ? 'Cancelar' : 'Agregar Visita'}
            </Button>
        </CollapsibleTrigger>
      </CardHeader>
      <CollapsibleContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
                                locale="es"
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

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Visita'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CollapsibleContent>
    </Card>
    </Collapsible>
  );
}
