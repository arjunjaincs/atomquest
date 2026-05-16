import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, department: true, designation: true, avatarColor: true, manager: { select: { name: true } }, _count: { select: { goals: true } } },
      orderBy: { name: 'asc' },
    })
    return Response.json(users)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
