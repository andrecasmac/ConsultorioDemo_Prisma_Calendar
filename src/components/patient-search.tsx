'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface PatientSearchProps {
  patients: Patient[];
}

export function PatientSearch({ patients }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Buscar un paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-card"
        />
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Fecha de Nacimiento</TableHead>
              <TableHead>Visitas</TableHead>
              <TableHead className="text-right">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell>{format(parseISO(patient.dob), "d 'de' MMMM, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{patient.visits.length}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/patients/${patient.id}`} className="text-primary hover:underline">
                      Detalles
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No se encontraron pacientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
