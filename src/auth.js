import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        restaurantName: { label: 'Restaurant Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const restaurantName = credentials?.restaurantName
        const email = credentials?.email
        const password = credentials?.password

        if (!restaurantName || !email || !password) {
          return null
        }

        const user = await prisma.adminUser.findFirst({
          where: {
            email: String(email),
            restaurant: {
              name: String(restaurantName),
            },
          },
          include: {
            restaurant: true,
          },
        })

        if (!user) {
          return null
        }

        const isValidPassword = await bcrypt.compare(
          String(password),
          user.password
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          restaurantId: user.restaurantId,
          restaurantName: user.restaurant.name,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.restaurantId = user.restaurantId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.restaurantId = token.restaurantId
      }
      return session
    },
  },
})