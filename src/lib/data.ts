import { PrismaClient } from '@prisma/client';
import type { Visit, Patient } from '@/lib/types';
import { formatISO, format } from 'date-fns';

const prisma = new PrismaClient();

export async function getPatients(): Promise<Patient[]> {
  const pacientes = await prisma.pacientes.findMany({
    include: {
      visitas: true,
    },
  });

  return pacientes.map((p) => ({
    id: p.id.toString(),
    name: `${p.nombre || ''} ${p.apellido || ''}`,
    firstName: p.nombre || '',
    lastName: p.apellido || '',
    dob: p.fecha_nacimiento ? format(p.fecha_nacimiento, 'yyyy-MM-dd') : '',
    phone: p.telefono || undefined,
    visits: p.visitas.map((v) => ({
      id: v.idvisitas.toString(),
      patientId: v.paciente_id.toString(),
      date: v.fecha ? format(v.fecha, 'yyyy-MM-dd') : '',
      padecimiento: v.padecimiento || '',
      exploracion: v.exploracion || '',
      tratamientoActual: v.tratamiento_act || '',
      tratamientoHomeopatico: v.tratamiento_hom || '',
    })),
  }));
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const patientId = parseInt(id, 10);
  if (isNaN(patientId)) return undefined;

  const p = await prisma.pacientes.findUnique({
    where: { id: patientId },
    include: {
      visitas: true,
    },
  });

  if (!p) return undefined;

  return {
    id: p.id.toString(),
    name: `${p.nombre || ''} ${p.apellido || ''}`,
    firstName: p.nombre || '',
    lastName: p.apellido || '',
    dob: p.fecha_nacimiento ? format(p.fecha_nacimiento, 'yyyy-MM-dd') : '',
    phone: p.telefono || undefined,
    visits: p.visitas.map((v) => ({
      id: v.idvisitas.toString(),
      patientId: v.paciente_id.toString(),
      date: v.fecha ? format(v.fecha, 'yyyy-MM-dd') : '',
      padecimiento: v.padecimiento || '',
      exploracion: v.exploracion || '',
      tratamientoActual: v.tratamiento_act || '',
      tratamientoHomeopatico: v.tratamiento_hom || '',
    })),
  };
}

export async function createPatient(firstName: string, lastName: string, dob: Date, phone?: string): Promise<Patient> {
    const newPatientRecord = await prisma.pacientes.create({
        data: {
            nombre: firstName,
            apellido: lastName,
            fecha_nacimiento: dob,
            telefono: phone,
        }
    });
    
    return {
        id: newPatientRecord.id.toString(),
        name: `${newPatientRecord.nombre || ''} ${newPatientRecord.apellido || ''}`,
        firstName: newPatientRecord.nombre || '',
        lastName: newPatientRecord.apellido || '',
        dob: newPatientRecord.fecha_nacimiento ? format(newPatientRecord.fecha_nacimiento, 'yyyy-MM-dd') : '',
        phone: newPatientRecord.telefono || undefined,
        visits: [],
    };
}


export async function addVisit(patientId: string, visitData: Omit<Visit, 'id' | 'patientId'>): Promise<Visit> {
    const pId = parseInt(patientId, 10);
    if(isNaN(pId)) {
        throw new Error("Invalid patient ID");
    }

    const newVisitRecord = await prisma.visitas.create({
        data: {
            paciente_id: pId,
            fecha: new Date(visitData.date),
            padecimiento: visitData.padecimiento,
            exploracion: visitData.exploracion,
            tratamiento_act: visitData.tratamientoActual,
            tratamiento_hom: visitData.tratamientoHomeopatico,
        }
    });

    return {
        id: newVisitRecord.idvisitas.toString(),
        patientId: newVisitRecord.paciente_id.toString(),
        date: newVisitRecord.fecha ? format(newVisitRecord.fecha, 'yyyy-MM-dd') : '',
        padecimiento: newVisitRecord.padecimiento || '',
        exploracion: newVisitRecord.exploracion || '',
        tratamientoActual: newVisitRecord.tratamiento_act || '',
        tratamientoHomeopatico: newVisitRecord.tratamiento_hom || '',
    };
}

export async function deleteVisit(patientId: string, visitId: string): Promise<void> {
    const vId = parseInt(visitId, 10);
    if(isNaN(vId)) {
        throw new Error("Invalid visit ID");
    }

    await prisma.visitas.delete({
        where: {
            idvisitas: vId
        }
    });
}

export async function updatePatient(id: string, firstName: string, lastName: string, dob: Date, phone?: string): Promise<Patient> {
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        throw new Error("Invalid patient ID");
    }

    const updatedPatientRecord = await prisma.pacientes.update({
        where: { id: patientId },
        data: {
            nombre: firstName,
            apellido: lastName,
            fecha_nacimiento: dob,
            telefono: phone,
        }
    });

    return {
        id: updatedPatientRecord.id.toString(),
        name: `${updatedPatientRecord.nombre || ''} ${updatedPatientRecord.apellido || ''}`,
        firstName: updatedPatientRecord.nombre || '',
        lastName: updatedPatientRecord.apellido || '',
        dob: updatedPatientRecord.fecha_nacimiento ? format(updatedPatientRecord.fecha_nacimiento, 'yyyy-MM-dd') : '',
        phone: updatedPatientRecord.telefono || undefined,
        visits: [], // Note: this doesn't return visits. Refetch if needed.
    };
}

export async function deletePatient(id: string): Promise<void> {
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        throw new Error("Invalid patient ID");
    }

    // Delete related visits first
    await prisma.visitas.deleteMany({
        where: { paciente_id: patientId },
    });
    await prisma.pacientes.delete({
        where: { id: patientId },
    });
}

export async function updateVisit(visitId: string, visitData: Omit<Visit, 'id' | 'patientId'>): Promise<Visit> {    
    const vId = parseInt(visitId, 10);
    if(isNaN(vId)) {
        throw new Error("Invalid visit ID");
    }

    const updatedVisitRecord = await prisma.visitas.update({
        where: { idvisitas: vId },
        data: {
            fecha: new Date(visitData.date),
            padecimiento: visitData.padecimiento,
            exploracion: visitData.exploracion,
            tratamiento_act: visitData.tratamientoActual,
            tratamiento_hom: visitData.tratamientoHomeopatico,
        }
    });

    return {
        id: updatedVisitRecord.idvisitas.toString(),
        patientId: updatedVisitRecord.paciente_id.toString(),
        date: updatedVisitRecord.fecha ? format(updatedVisitRecord.fecha, 'yyyy-MM-dd') : '',
        padecimiento: updatedVisitRecord.padecimiento || '',
        exploracion: updatedVisitRecord.exploracion || '',
        tratamientoActual: updatedVisitRecord.tratamiento_act || '',
        tratamientoHomeopatico: updatedVisitRecord.tratamiento_hom || '',
    };
}