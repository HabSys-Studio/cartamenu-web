import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Función auxiliar para obtener restaurantes del usuario
async function getUserRestaurants(userId) {
  const memberships = await prisma.userRestaurant.findMany({
    where: { userId },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return memberships.map((m) => ({
    id: m.restaurant.id,
    name: m.restaurant.name,
    slug: m.restaurant.slug,
    isActive: m.restaurant.isActive,
    role: m.role,
  }));
}

// ✅ NEXT-AUTH V5: Configuración completa con secret explícito
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  // ✅ Secret explícito (puede coincidir con NEXTAUTH_SECRET del .env.local)
  secret: process.env.NEXTAUTH_SECRET,
  
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string'
            ? credentials.email.trim().toLowerCase()
            : '';
        const password =
          typeof credentials?.password === 'string' ? credentials.password : '';

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            emailVerified: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return null;
        }

        const restaurants = await getUserRestaurants(user.id);
        const activeRestaurantId = restaurants[0]?.id ?? null;

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          role: user.role ?? 'USER',
          emailVerified: user.emailVerified ?? null,
          restaurants,
          activeRestaurantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified ?? null;
        token.restaurants = user.restaurants ?? [];
        token.activeRestaurantId = user.activeRestaurantId ?? null;
      }

      if (trigger === 'update' && session) {
        if (typeof session.activeRestaurantId !== 'undefined') {
          token.activeRestaurantId = session.activeRestaurantId;
        }
        if (Array.isArray(session.restaurants)) {
          token.restaurants = session.restaurants;
        }
        if (typeof session.name === 'string') {
          token.name = session.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role ?? 'USER';
        session.user.emailVerified = token.emailVerified ?? null;
        session.user.restaurants = Array.isArray(token.restaurants)
          ? token.restaurants
          : [];
        session.user.activeRestaurantId = token.activeRestaurantId ?? null;
      }

      return session;
    },
  },
});
