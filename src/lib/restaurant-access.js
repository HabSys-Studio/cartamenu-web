import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const ROLE_HIERARCHY = {
  STAFF: 1,
  ADMIN: 2,
  OWNER: 3,
};

/**
 * Obtiene la sesión actual o lanza un error estructurado.
 */
export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    const error = new Error('No autenticado');
    error.status = 401;
    throw error;
  }

  return session;
}

/**
 * Verifica que el usuario autenticado tenga acceso al restaurante indicado
 * y cumpla con el rol mínimo requerido ('STAFF' | 'ADMIN' | 'OWNER').
 */
export async function requireRestaurantAccess(
  restaurantId,
  minRole = 'STAFF'
) {
  const session = await requireSession();

  if (!restaurantId || typeof restaurantId !== 'string') {
    const error = new Error('ID de restaurante inválido o faltante');
    error.status = 400;
    throw error;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    const error = new Error('Restaurante no encontrado');
    error.status = 404;
    throw error;
  }

  // Si el usuario tiene rol global de administrador de plataforma
  if (session.user.role === 'SUPERADMIN') {
    return {
      session,
      restaurant,
      membershipRole: 'OWNER',
    };
  }

  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: {
        userId: session.user.id,
        restaurantId,
      },
    },
  });

  if (!membership) {
    const error = new Error('No tenés permisos para acceder a este restaurante');
    error.status = 403;
    throw error;
  }

  const userLevel = ROLE_HIERARCHY[membership.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 1;

  if (userLevel < requiredLevel) {
    const error = new Error(
      `Se requiere rol ${minRole} o superior para realizar esta acción`
    );
    error.status = 403;
    throw error;
  }

  return {
    session,
    restaurant,
    membershipRole: membership.role,
  };
}

/**
 * Helper uniforme para capturar errores de autorización en Route Handlers (/api/*).
 */
export function handleApiAuthError(error) {
  const status = error?.status ?? 500;
  const message =
    status < 500 ? error.message : 'Error interno del servidor';

  return Response.json({ error: message }, { status });
}