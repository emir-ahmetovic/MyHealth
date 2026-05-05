const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

const bosnianTypes = [
  { en: "General Medicine", bs: "Opća medicina" },
  { en: "Dentistry", bs: "Stomatologija" },
  { en: "Dermatology", bs: "Dermatologija" },
  { en: "Cardiology", bs: "Kardiologija" },
  { en: "Neurology", bs: "Neurologija" },
  { en: "Orthopedics", bs: "Ortopedija" },
  { en: "Gynecology", bs: "Ginekologija" },
  { en: "Pediatrics", bs: "Pedijatrija" },
  { en: "Ophthalmology", bs: "Oftalmologija" },
  { en: "Psychiatry", bs: "Psihijatrija" },
];

async function main() {
  for (const type of bosnianTypes) {
    await prisma.clinic_types.updateMany({
      where: { name: type.en },
      data: { name: type.bs },
    });
  }
  console.log('Clinic types updated to Bosnian names.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
