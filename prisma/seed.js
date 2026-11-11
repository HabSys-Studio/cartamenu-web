const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'carta-menu' },
    update: {},
    create: {
      name: 'Carta Menú',
      slug: 'carta-menu',
    },
  })

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const user = await prisma.adminUser.upsert({
    where: { email: 'admin@habsys.com' },
    update: {
      password: hashedPassword,
      restaurantId: restaurant.id,
    },
    create: {
      email: 'admin@habsys.com',
      password: hashedPassword,
      restaurantId: restaurant.id,
    },
  })

  console.log('Local listo:', restaurant.slug)
  console.log('Usuario admin listo:', user.email)
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
