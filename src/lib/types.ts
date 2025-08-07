
export interface Visit {
  id: string;
  patientId: string;
  date: string; // ISO 8601 format
  padecimiento: string;
  exploracion: string;
  tratamientoActual: string;
  tratamientoHomeopatico: string;
}

export interface Patient {
  id: string;
  name: string; // This will be a concatenation of firstName and lastName
  firstName: string;
  lastName: string;
  dob: string; // ISO 8601 format
  phone?: string;
  visits: Visit[];
}
