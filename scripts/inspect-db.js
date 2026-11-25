import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== RESTAURANTS ===')
  const restaurants = await prisma.restaurant.findMany({
    include: {
      admins: {
        select: { id: true, email: true, restaurantId: true },
      },
      _count: { select: { admins: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
  for (const r of restaurants) {
    console.log(`- ${r.name} (${r.slug}) | admins: ${r.admins.map(a => a.email).join(', ') || 'NINGUNO'} | adminCount: ${r._count.admins}`)
  }

  console.log('\n=== ADMIN USERS ===')
  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      password: true,
      restaurantId: true,
      restaurant: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { email: 'asc' },
  })
  for (const a of admins) {
    console.log(`- email: ${a.email} | restaurant: ${a.restaurant?.name} (${a.restaurant?.slug}) | verified: ${a.emailVerified}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})