import { getPatientsPaginated } from '@/lib/data';
import { PatientSearch } from '@/components/patient-search';
import { CreatePatientDialog } from '@/components/create-patient-dialog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Get initial page of patients (first 20)
  const initialData = await getPatientsPaginated({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Tablero de Pacientes</h1>
          <p className="text-primary">Busque pacientes o cree uno nuevo.</p>
        </div>
        <CreatePatientDialog />
      </div>
      <PatientSearch initialData={initialData} />
    </div>
  );
}
