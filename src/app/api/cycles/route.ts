import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cycles = await prisma.goalCycle.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(cycles)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
