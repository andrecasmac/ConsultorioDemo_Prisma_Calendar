'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createPatient, addVisit, deleteVisit, updatePatient, deletePatient, updateVisit } from '@/lib/data';
import { z } from 'zod';
import type { Visit } from '@/lib/types';
import { parse } from 'date-fns';

const patientSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)) || val.match(/^\d{2}-\d{2}-\d{4}$/), { message: 'Fecha de nacimiento inválida.' }),
  phone: z.string().optional(),
});

export async function createPatientAction(formData: FormData) {
  const validatedFields = patientSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    dob: formData.get('dob'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const dobDate = parse(validatedFields.data.dob, 'dd-MM-yyyy', new Date());

  try {
    const newPatient = await createPatient(validatedFields.data.firstName, validatedFields.data.lastName, dobDate, validatedFields.data.phone);
    revalidatePath('/');
    return { success: true, patientId: newPatient.id };
  } catch (error) {
    return { errors: { _form: ['Error al crear el paciente.'] } };
  }
}

export async function updatePatientAction(formData: FormData) {
  const validatedFields = patientSchema.safeParse({
    id: formData.get('id'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    dob: formData.get('dob'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success || !validatedFields.data.id) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
    };
  }
  
  const dobDate = parse(validatedFields.data.dob, 'dd-MM-yyyy', new Date());

  try {
    await updatePatient(validatedFields.data.id, validatedFields.data.firstName, validatedFields.data.lastName, dobDate, validatedFields.data.phone);
    revalidatePath(`/patients/${validatedFields.data.id}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { errors: { _form: ['Error al actualizar el paciente.'] } };
  }
}

export async function deletePatientAction(patientId: string) {
    try {
        await deletePatient(patientId);
        revalidatePath('/');
    } catch (error) {
        return { errors: { _form: ['Error al eliminar el paciente.'] } };
    }
}

const visitSchema = z.object({
  patientId: z.string(),
  visitId: z.string().optional(),
  date: z.string().min(1, 'La fecha es obligatoria'),
  padecimiento: z.string(),
  exploracion: z.string(),
  tratamientoActual: z.string(),
  tratamientoHomeopatico: z.string(),
});

export async function addVisitAction(values: z.infer<typeof visitSchema>) {
    const validatedFields = visitSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    try {
        const { patientId, ...visitData } = validatedFields.data;
        
        const newVisit: Omit<Visit, 'id' | 'patientId'> = {
            ...visitData,
        };

        await addVisit(patientId, newVisit);
        revalidatePath(`/patients/${patientId}`);
        return { success: true };
    } catch (error) {
        return { errors: { _form: ['Error al añadir la visita.'] } };
    }
}

export async function updateVisitAction(values: z.infer<typeof visitSchema>) {
    const validatedFields = visitSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    
    if (!validatedFields.data.visitId) {
        return { errors: { _form: ['ID de visita no encontrado.'] } };
    }

    try {
        const { patientId, visitId, ...visitData } = validatedFields.data;
        
        const updatedVisitData: Omit<Visit, 'id' | 'patientId'> = { ...visitData };

        await updateVisit(visitId!, updatedVisitData);
        revalidatePath(`/patients/${patientId}`);
        return { success: true };
    } catch (error) {
        return { errors: { _form: ['Error al actualizar la visita.'] } };
    }
}

export async function deleteVisitAction(patientId: string, visitId: string) {
    try {
        await deleteVisit(patientId, visitId);
        revalidatePath(`/patients/${patientId}`);
        return { success: true };
    } catch (error) {
        return { errors: { _form: ['Error al eliminar la visita.'] } };
    }
}
