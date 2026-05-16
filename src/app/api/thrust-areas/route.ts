import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const thrustAreas = await prisma.thrustArea.findMany({ orderBy: { name: 'asc' } })
    return Response.json(thrustAreas)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
