import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rules = await prisma.escalationRule.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(rules)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rule = await prisma.escalationRule.create({ data: body })
    return Response.json(rule, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    const rule = await prisma.escalationRule.update({ where: { id }, data })
    return Response.json(rule)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
