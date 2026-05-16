import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { computeScore } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const goalId = request.nextUrl.searchParams.get('goalId')
    const employeeId = request.nextUrl.searchParams.get('employeeId')
    const managerId = request.nextUrl.searchParams.get('managerId')

    let where: any = {}
    if (goalId) where.goalId = goalId
    if (employeeId) where.employeeId = employeeId
    if (managerId) {
      const teamMembers = await prisma.user.findMany({ where: { managerId } })
      where.employeeId = { in: teamMembers.map(u => u.id) }
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: {
        goal: { include: { thrustArea: true, employee: { select: { id: true, name: true, avatarColor: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(checkIns)
  } catch (error) {
    console.error('CheckIn GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { goalId, quarter, achievement, status, employeeComment, employeeId } = body

    if (!goalId || !quarter || !employeeId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const goal = await prisma.goal.findUnique({ where: { id: goalId } })
    if (!goal) return Response.json({ error: 'Goal not found' }, { status: 404 })

    const score = computeScore(goal.uom as any, goal.uomType as any, goal.target, achievement || 0)

    const existing = await prisma.checkIn.findFirst({ where: { goalId, quarter } })

    let checkIn
    if (existing) {
      checkIn = await prisma.checkIn.update({
        where: { id: existing.id },
        data: { achievement: parseFloat(achievement) || 0, status: status || existing.status, employeeComment: employeeComment || existing.employeeComment, score },
      })
    } else {
      checkIn = await prisma.checkIn.create({
        data: { goalId, quarter, achievement: parseFloat(achievement) || 0, status: status || 'NOT_STARTED', employeeComment: employeeComment || '', employeeId, score },
      })
    }

    await prisma.auditLog.create({
      data: { userId: employeeId, action: existing ? 'UPDATE' : 'CREATE', entityType: 'CHECKIN', entityId: checkIn.id, newValue: JSON.stringify({ quarter, achievement, status, score }) },
    })

    return Response.json(checkIn, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('CheckIn POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, managerComment, managerId } = body

    if (!id) return Response.json({ error: 'CheckIn ID required' }, { status: 400 })

    const checkIn = await prisma.checkIn.update({
      where: { id },
      data: { managerComment, managerId },
    })

    return Response.json(checkIn)
  } catch (error) {
    console.error('CheckIn PUT error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
