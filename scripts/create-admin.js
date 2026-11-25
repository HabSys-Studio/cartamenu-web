const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cartamenu.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  console.log('🔍 Buscando admin existente...')
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('⚠️  El usuario admin ya existe:', adminEmail)
    // Verificar si la contraseña coincide
    const isValid = await bcrypt.compare(adminPassword, existingAdmin.password)
    console.log(`🔑 ¿Contraseña correcta?: ${isValid ? 'SÍ' : 'NO'}`)
    if (!isValid) {
      console.log('🔄 Actualizando contraseña...')
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword },
      })
      console.log('✅ Contraseña actualizada.')
    }
    return
  }

  console.log('🆕 Creando usuario admin...')
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

  // Crear restaurante demo asociado
  const existingRestaurant = await prisma.restaurant.findFirst({
    where: { slug: 'carta-menu' },
  })

  if (!existingRestaurant) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'Carta Menú - Demo',
        slug: 'carta-menu',
        ownerId: adminUser.id,
      },
    })

    await prisma.userRestaurant.create({
      data: {
        userId: adminUser.id,
        restaurantId: restaurant.id,
        role: 'OWNER',
      },
    })
    console.log('✅ Restaurante demo creado:', restaurant.slug)
  } else {
    console.log('⚠️  El restaurante demo ya existe:', existingRestaurant.slug)
    // Asegurar que el admin esté asociado
    const existingLink = await prisma.userRestaurant.findFirst({
      where: { userId: adminUser.id, restaurantId: existingRestaurant.id },
    })
    if (!existingLink) {
      await prisma.userRestaurant.create({
        data: {
          userId: adminUser.id,
          restaurantId: existingRestaurant.id,
          role: 'OWNER',
        },
      })
      console.log('✅ Admin asociado al restaurante existente.')
    }
  }

  console.log('✅ Proceso completado.')
  console.log(`📧 Email: ${adminEmail}`)
  console.log(`🔑 Contraseña: ${adminPassword}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })