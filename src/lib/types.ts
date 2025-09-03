
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
  dob?: string; // ISO 8601 format - optional since fecha_nacimiento is nullable in DB
  phone?: string;
  visits: Visit[];
}

// Lightweight patient type for list views (without visits)
export interface PatientSummary {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  dob?: string;
  phone?: string;
  visitCount: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
