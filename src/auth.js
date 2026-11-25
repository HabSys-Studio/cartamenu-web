import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password

        if (!email || !password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: String(email) },
          include: {
            restaurants: {
              include: {
                restaurant: true,
              },
            },
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
          name: user.name,
          role: user.role,
          plan: user.plan,
          maxRestaurants: user.maxRestaurants,
          restaurants: user.restaurants.map((ur) => ({
            id: ur.restaurant.id,
            name: ur.restaurant.name,
            slug: ur.restaurant.slug,
            role: ur.role,
          })),
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
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.plan = user.plan
        token.maxRestaurants = user.maxRestaurants
        token.restaurants = user.restaurants
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        session.user.plan = token.plan
        session.user.maxRestaurants = token.maxRestaurants
        session.user.restaurants = token.restaurants
      }
      return session
    },
  },
})