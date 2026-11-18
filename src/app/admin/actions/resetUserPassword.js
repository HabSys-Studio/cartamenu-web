'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function adminResetPasswordByEmail(email: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(String(newPassword), 12)

  await prisma.adminUser.update({
    where: { email },
    data: { password: hashedPassword },
  })

  return { success: true }
}
