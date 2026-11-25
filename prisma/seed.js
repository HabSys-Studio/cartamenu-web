const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de Carta Menú...')

  // Crear usuario administrador de la plataforma (super admin)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cartamenu.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('⚠️  El usuario admin ya existe:', adminEmail)
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador Plataforma',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        plan: 'ENTERPRISE',
        maxRestaurants: 999,
        emailVerified: true,
      },
    })
    console.log('✅ Usuario admin creado:', adminUser.email)
  }

  // Crear un restaurante de ejemplo para el admin (opcional)
  const existingRestaurant = await prisma.restaurant.findFirst({
    where: { slug: 'carta-menu' },
  })

  if (!existingRestaurant) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'Carta Menú - Demo',
        slug: 'carta-menu',
        ownerId: adminEmail ? (await prisma.user.findUnique({ where: { email: adminEmail } })).id : '',
      },
    })

    // Asociar el admin al restaurante
    await prisma.userRestaurant.create({
      data: {
        userId: (await prisma.user.findUnique({ where: { email: adminEmail } })).id,
        restaurantId: restaurant.id,
        role: 'OWNER',
      },
    })

    console.log('✅ Restaurante demo creado:', restaurant.slug)
  } else {
    console.log('⚠️  El restaurante demo ya existe:', existingRestaurant.slug)
  }

  console.log('✅ Seed completado.')
  console.log(`📧 Email admin: ${adminEmail}`)
  console.log(`🔑 Contraseña admin: ${adminPassword}`)
}

main()
  .catch((error) => {
    console.error('❌ Error en el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
