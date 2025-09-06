import { PrismaClient } from '@prisma/client';
import type { Visit, Patient, PatientSummary, PaginationParams, PaginatedResult } from '@/lib/types';
import { formatISO, format } from 'date-fns';

// Global prisma instance with connection management
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Get paginated patients with search (without visits for performance)
export async function getPatientsPaginated(params: PaginationParams): Promise<PaginatedResult<PatientSummary>> {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  let total: number;
  let pacientes: any[];

  try {
    if (search && search.trim()) {
      // Use raw SQL for better MySQL search performance
      const searchTerm = `%${search.trim()}%`;
      
      // Get total count with search
      const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count 
        FROM pacientes 
        WHERE LOWER(nombre) LIKE LOWER(${searchTerm}) 
           OR LOWER(apellido) LIKE LOWER(${searchTerm})
           OR LOWER(CONCAT(nombre, ' ', apellido)) LIKE LOWER(${searchTerm})
      `;
      total = Number(countResult[0].count);

      // Get paginated results with search
      pacientes = await prisma.$queryRaw<any[]>`
        SELECT 
          p.id,
          p.nombre,
          p.apellido,
          p.fecha_nacimiento,
          p.telefono,
          COUNT(v.idvisitas) as visitCount,
          MAX(v.fecha) as lastVisitDate
        FROM pacientes p
        LEFT JOIN visitas v ON p.id = v.paciente_id
        WHERE LOWER(p.nombre) LIKE LOWER(${searchTerm}) 
           OR LOWER(p.apellido) LIKE LOWER(${searchTerm})
           OR LOWER(CONCAT(p.nombre, ' ', p.apellido)) LIKE LOWER(${searchTerm})
        GROUP BY p.id, p.nombre, p.apellido, p.fecha_nacimiento, p.telefono
        ORDER BY CASE WHEN lastVisitDate IS NULL THEN 1 ELSE 0 END, lastVisitDate DESC, p.nombre ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    } else {
      // No search - use regular Prisma query
      total = await prisma.pacientes.count();
      
      pacientes = await prisma.$queryRaw<any[]>`
        SELECT 
          p.id,
          p.nombre,
          p.apellido,
          p.fecha_nacimiento,
          p.telefono,
          COUNT(v.idvisitas) as visitCount,
          MAX(v.fecha) as lastVisitDate
        FROM pacientes p
        LEFT JOIN visitas v ON p.id = v.paciente_id
        GROUP BY p.id, p.nombre, p.apellido, p.fecha_nacimiento, p.telefono
        ORDER BY CASE WHEN lastVisitDate IS NULL THEN 1 ELSE 0 END, lastVisitDate DESC, p.nombre ASC
        LIMIT ${limit} OFFSET ${skip}
      `;
    }

    const data: PatientSummary[] = pacientes.map((p) => ({
      id: p.id.toString(),
      name: `${p.nombre || ''} ${p.apellido || ''}`,
      firstName: p.nombre || '',
      lastName: p.apellido || '',
      dob: p.fecha_nacimiento ? format(p.fecha_nacimiento, 'yyyy-MM-dd') : '',
      phone: p.telefono || undefined,
      visitCount: Number(p.visitCount),
      lastVisitDate: p.lastVisitDate ? format(new Date(p.lastVisitDate), 'yyyy-MM-dd') : undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error('Error in getPatientsPaginated:', error);
    
    // Fallback to basic query if search fails
    if (search && search.trim()) {
      console.log('Falling back to basic search...');
      return getPatientsPaginated({ ...params, search: undefined });
    }
    
    throw error;
  }
}

// Get patient visit count efficiently (without loading visits)
export async function getPatientVisitCount(patientId: string): Promise<number> {
  const id = parseInt(patientId, 10);
  if (isNaN(id)) return 0;

  const count = await prisma.visitas.count({
    where: { paciente_id: id }
  });

  return count;
}

// Get patients with visits (for backward compatibility - use sparingly)
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

// Get patient by ID with visits (for detail views)
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

// Get paginated visits for a patient
export async function getPatientVisitsPaginated(
  patientId: string, 
  params: Omit<PaginationParams, 'search'>
): Promise<PaginatedResult<Visit>> {
  const id = parseInt(patientId, 10);
  if (isNaN(id)) {
    throw new Error('Invalid patient ID');
  }

  const { page, limit } = params;
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.visitas.count({
    where: { paciente_id: id }
  });

  // Get paginated visits
  const visitas = await prisma.visitas.findMany({
    where: { paciente_id: id },
    orderBy: { fecha: 'desc' },
    skip,
    take: limit,
  });

  const data: Visit[] = visitas.map((v) => ({
    id: v.idvisitas.toString(),
    patientId: v.paciente_id.toString(),
    date: v.fecha ? format(v.fecha, 'yyyy-MM-dd') : '',
    padecimiento: v.padecimiento || '',
    exploracion: v.exploracion || '',
    tratamientoActual: v.tratamiento_act || '',
    tratamientoHomeopatico: v.tratamiento_hom || '',
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}