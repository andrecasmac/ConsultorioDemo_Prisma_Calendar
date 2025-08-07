const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create patients
  const patient1 = await prisma.pacientes.create({
    data: {
      nombre: 'Juan',
      apellido: 'Perez',
      fecha_nacimiento: new Date('1980-05-15'),
      telefono: '555-1234',
    },
  });

  const patient2 = await prisma.pacientes.create({
    data: {
      nombre: 'Maria',
      apellido: 'Garcia',
      fecha_nacimiento: new Date('1992-09-20'),
      telefono: '555-5678',
    },
  });

  console.log(`Created patients with ids: ${patient1.id}, ${patient2.id}`);

  // Create visits
  await prisma.visitas.create({
    data: {
        paciente_id: patient1.id,
        fecha: new Date('2023-10-01'),
        padecimiento: 'Gripe estacional',
        exploracion: 'Congestión nasal, tos leve.',
        tratamiento_act: 'Reposo y líquidos.',
        tratamiento_hom: 'Oscillococcinum.'
    }
  });

  await prisma.visitas.create({
    data: {
        paciente_id: patient1.id,
        fecha: new Date('2024-03-15'),
        padecimiento: 'Alergia de primavera',
        exploracion: 'Ojos llorosos, estornudos frecuentes.',
        tratamiento_act: 'Loratadina 10mg al día.',
        tratamiento_hom: 'Allium Cepa 30C.'
    }
  });
  
  await prisma.visitas.create({
    data: {
        paciente_id: patient2.id,
        fecha: new Date('2024-01-20'),
        padecimiento: 'Dolor de espalda',
        exploracion: 'Limitación de movimiento en la zona lumbar.',
        tratamiento_act: 'Ibuprofeno 400mg, fisioterapia.',
        tratamiento_hom: 'Arnica Montana 200C.'
    }
  });


  console.log(`Seeding finished.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
