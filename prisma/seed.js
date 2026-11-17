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

  // Usuario de prueba deshabilitado para evitar credenciales predeterminadas en el sistema.
  // Si necesitas un administrador, créalo desde el registro de la app o inserta manualmente en la DB.

  console.log('Local listo:', restaurant.slug)
  console.log('Seed completado sin usuario admin predeterminado.')
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
