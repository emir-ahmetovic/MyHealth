import { prisma } from '../src/server/db'

async function main() {
  try {
    // Test creating a user
    const user = await prisma.users.create({
      data: {
        email: 'test@example.com',
        password_hash: 'test-hash',
        full_name: 'Test User',
        role: 'USER',
      },
    })
    console.log('Created user:', user)

    // Test creating a clinic type
    const clinicType = await prisma.clinic_types.create({
      data: {
        name: 'Test Clinic Type',
      },
    })
    console.log('Created clinic type:', clinicType)

    // Test creating a clinic
    const clinic = await prisma.clinics.create({
      data: {
        user_id: user.id,
        clinic_type_id: clinicType.id,
        name: 'Test Clinic',
        address: 'Test Address',
      },
    })
    console.log('Created clinic:', clinic)

    // Clean up test data
    await prisma.clinics.delete({ where: { id: clinic.id } })
    await prisma.clinic_types.delete({ where: { id: clinicType.id } })
    await prisma.users.delete({ where: { id: user.id } })
    console.log('Test data cleaned up successfully')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
