import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, avatarColor: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return Response.json(logs)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
