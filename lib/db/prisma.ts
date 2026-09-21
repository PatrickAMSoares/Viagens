import { PrismaClient } from '@prisma/client'

/**
 * Singleton do Prisma. Em desenvolvimento o hot reload recria módulos a cada
 * alteração; sem o cache global isso abriria uma conexão nova a cada reload
 * até estourar o pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** O app funciona sem banco (catálogo estático) até o Supabase ser provisionado. */
export const temBanco = Boolean(process.env.DATABASE_URL)
