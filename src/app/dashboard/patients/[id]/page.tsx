
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { getPatientById } from '@/lib/data';
import { AddVisitForm } from '@/components/add-visit-form';
import { DeleteVisitDialog } from '@/components/delete-visit-dialog';
import { EditPatientDialog } from '@/components/edit-patient-dialog';
import { DeletePatientDialog } from '@/components/delete-patient-dialog';
import { EditVisitDialog } from '@/components/edit-visit-dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const patient = await getPatientById(resolvedParams.id);

  if (!patient) {
    notFound();
  }
  
  const sortedVisits = patient.visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">{patient.name}</CardTitle>
              <CardDescription className="text-lg">
                {patient.dob && `Fecha de nacimiento: ${format(parseISO(patient.dob), "d 'de' MMMM, yyyy")}`}
              </CardDescription>
              {patient.phone && <CardDescription className="text-base">Teléfono: {patient.phone}</CardDescription>}
            </div>
            <div className="flex gap-2">
              <EditPatientDialog patient={patient} />
              <DeletePatientDialog patientId={patient.id} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <AddVisitForm patientId={patient.id} />
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Historial de Visitas</CardTitle>
            <CardDescription>Un registro de todas las visitas pasadas del paciente.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px]">Fecha</TableHead>
                    <TableHead className="w-[20%]">Padecimiento</TableHead>
                    <TableHead className="w-[20%]">Exploración</TableHead>
                    <TableHead className="w-[20%]">Tratamiento Actual</TableHead>
                    <TableHead className="w-[20%]">Tratamiento Homeopático</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {sortedVisits.length > 0 ? (
                    sortedVisits.map((visit) => (
                    <TableRow key={visit.id}>
                        <TableCell className="font-medium">
                        {format(parseISO(visit.date), 'd MMM, yyyy')}
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap">{visit.padecimiento}</TableCell>
                        <TableCell className="whitespace-pre-wrap">{visit.exploracion}</TableCell>
                        <TableCell className="whitespace-pre-wrap">{visit.tratamientoActual}</TableCell>
                        <TableCell className="whitespace-pre-wrap">{visit.tratamientoHomeopatico}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditVisitDialog visit={visit} />
                            <DeleteVisitDialog patientId={patient.id} visitId={visit.id} />
                          </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No hay visitas registradas.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
