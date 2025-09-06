'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePatientAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import type { Patient } from '@/lib/types';

const patientFormSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  dob: z.date({ required_error: 'La fecha de nacimiento es obligatoria.' }),
  phone: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface EditPatientDialogProps {
    patient: Patient;
}

export function EditPatientDialog({ patient }: EditPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dob ? parseISO(patient.dob) : new Date(),
        phone: patient.phone
    }
  });


  const onSubmit = async (data: PatientFormValues) => {
    const formData = new FormData();
    formData.append('id', patient.id);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('dob', format(data.dob, 'dd-MM-yyyy'));
    if(data.phone) formData.append('phone', data.phone);

    const result = await updatePatientAction(formData);

    if (result?.success) {
      toast({
        title: 'Éxito',
        description: 'Se ha actualizado el paciente.',
      });
      setOpen(false);
    } else if(result?.errors) {
       const errorMessages = Object.values(result.errors).flat().join(', ');
       toast({
         variant: 'destructive',
         title: 'Error al actualizar el paciente',
         description: errorMessages,
       });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Modifique los detalles del paciente a continuación.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Nombre
              </Label>
              <div className="col-span-3">
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Apellido
              </Label>
              <div className="col-span-3">
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <div className="col-span-3">
                <Input id="phone" {...register('phone')} />
                {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="text-right">
                Fecha de Nac.
              </Label>
              <div className="col-span-3">
                <Controller
                    control={control}
                    name="dob"
                    render={({ field }) => (
                        <DatePicker
                            className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            placeholderText="DD-MM-AAAA"
                            onChange={(date) => field.onChange(date)}
                            selected={field.value}
                            dateFormat="dd-MM-yyyy"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                        />
                    )}
                />
                {errors.dob && <p className="text-destructive text-sm mt-1">{errors.dob.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
