import { prisma } from "../src/server/db";

async function main() {
  // Get all doctors
  const doctors = await prisma.doctors.findMany();
  if (doctors.length === 0) {
    console.log("No doctors found. Please add doctors first.");
    return;
  }

  // Set date range (next 30 days)
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD

    for (const doctor of doctors) {
      // Create slots from 08:00 to 16:00 every 30 minutes
      for (let hour = 8; hour < 16; hour++) {
        for (let minute of [0, 30]) {
          const start = new Date(dateStr + `T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
          const end = new Date(start);
          end.setMinutes(start.getMinutes() + 30);
          await prisma.time_slots.create({
            data: {
              doctor_id: doctor.id,
              date: new Date(dateStr),
              start_time: start,
              end_time: end,
              is_available: true,
            },
          });
        }
      }
    }
  }
  console.log("Time slots seeded for all doctors for the next 30 days.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
