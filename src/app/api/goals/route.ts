import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const role = request.nextUrl.searchParams.get('role')
    const status = request.nextUrl.searchParams.get('status')

    let where: any = {}

    if (role === 'EMPLOYEE' && userId) {
      where.employeeId = userId
    } else if (role === 'MANAGER' && userId) {
      const teamMembers = await prisma.user.findMany({ where: { managerId: userId } })
      where.employeeId = { in: teamMembers.map((u: { id: string }) => u.id) }
    }
    if (status) where.status = status

    const goals = await prisma.goal.findMany({
      where,
      include: {
        thrustArea: true,
        employee: { select: { id: true, name: true, email: true, department: true, avatarColor: true } },
        checkIns: { orderBy: { createdAt: 'desc' } },
        approvals: { include: { manager: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(goals)
  } catch (error) {
    console.error('Goals GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, cycleId, thrustAreaId, title, description, uom, uomType, target, weightage } = body

    if (!employeeId || !thrustAreaId || !title || !uom || target == null || weightage == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validation: check weightage constraints
    const existingGoals = await prisma.goal.findMany({
      where: { employeeId, cycleId: cycleId || undefined },
    })

    if (existingGoals.length >= 8) {
      return Response.json({ error: 'Maximum 8 goals allowed per employee' }, { status: 400 })
    }

    if (weightage < 10) {
      return Response.json({ error: 'Minimum weightage per goal is 10%' }, { status: 400 })
    }

    const currentTotal = existingGoals.reduce((sum, g) => sum + g.weightage, 0)
    if (currentTotal + weightage > 100) {
      return Response.json({ error: `Total weightage would exceed 100%. Current: ${currentTotal}%, Adding: ${weightage}%` }, { status: 400 })
    }

    // Get active cycle if not provided
    let activeCycleId = cycleId
    if (!activeCycleId) {
      const activeCycle = await prisma.goalCycle.findFirst({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } })
      if (!activeCycle) return Response.json({ error: 'No active goal cycle found' }, { status: 400 })
      activeCycleId = activeCycle.id
    }

    const goal = await prisma.goal.create({
      data: {
        employeeId,
        cycleId: activeCycleId,
        thrustAreaId,
        title,
        description: description || '',
        uom,
        uomType: uomType || 'MIN',
        target: parseFloat(target),
        weightage: parseFloat(weightage),
        status: 'DRAFT',
      },
      include: { thrustArea: true },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: employeeId,
        action: 'CREATE',
        entityType: 'GOAL',
        entityId: goal.id,
        newValue: JSON.stringify({ title, weightage, target }),
      },
    })

    return Response.json(goal, { status: 201 })
  } catch (error) {
    console.error('Goals POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, ...updates } = body

    if (!id) return Response.json({ error: 'Goal ID required' }, { status: 400 })

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) return Response.json({ error: 'Goal not found' }, { status: 404 })

    // Handle different actions
    if (action === 'SUBMIT') {
      // Validate total weightage = 100%
      const allGoals = await prisma.goal.findMany({ where: { employeeId: goal.employeeId, cycleId: goal.cycleId } })
      const totalWeightage = allGoals.reduce((sum, g) => sum + g.weightage, 0)
      if (totalWeightage !== 100) {
        return Response.json({ error: `Total weightage must equal 100%. Current: ${totalWeightage}%` }, { status: 400 })
      }

      // Submit all draft goals for this employee+cycle
      await prisma.goal.updateMany({
        where: { employeeId: goal.employeeId, cycleId: goal.cycleId, status: 'DRAFT' },
        data: { status: 'SUBMITTED' },
      })

      return Response.json({ message: 'Goals submitted for approval' })
    }

    if (action === 'APPROVE') {
      const updated = await prisma.goal.update({
        where: { id },
        data: { status: 'APPROVED', isLocked: true, ...(updates.target != null ? { target: parseFloat(updates.target) } : {}), ...(updates.weightage != null ? { weightage: parseFloat(updates.weightage) } : {}) },
      })
      await prisma.goalApproval.create({
        data: { goalId: id, managerId: updates.managerId, status: 'APPROVED', comments: updates.comments || '' },
      })
      await prisma.auditLog.create({
        data: { userId: updates.managerId, action: 'APPROVE', entityType: 'GOAL', entityId: id, newValue: JSON.stringify({ status: 'APPROVED' }) },
      })
      return Response.json(updated)
    }

    if (action === 'REJECT') {
      const updated = await prisma.goal.update({ where: { id }, data: { status: 'REJECTED' } })
      await prisma.goalApproval.create({
        data: { goalId: id, managerId: updates.managerId, status: 'REJECTED', comments: updates.comments || '' },
      })
      await prisma.auditLog.create({
        data: { userId: updates.managerId, action: 'REJECT', entityType: 'GOAL', entityId: id, newValue: JSON.stringify({ status: 'REJECTED', comments: updates.comments }) },
      })
      return Response.json(updated)
    }

    if (action === 'REWORK') {
      const updated = await prisma.goal.update({ where: { id }, data: { status: 'REWORK' } })
      await prisma.goalApproval.create({
        data: { goalId: id, managerId: updates.managerId, status: 'REWORK', comments: updates.comments || '' },
      })
      return Response.json(updated)
    }

    if (action === 'UNLOCK') {
      const updated = await prisma.goal.update({ where: { id }, data: { isLocked: false } })
      await prisma.auditLog.create({
        data: { userId: updates.adminId, action: 'UNLOCK', entityType: 'GOAL', entityId: id, oldValue: JSON.stringify({ isLocked: true }), newValue: JSON.stringify({ isLocked: false }) },
      })
      return Response.json(updated)
    }

    // Regular update (only if not locked)
    if (goal.isLocked) {
      return Response.json({ error: 'Goal is locked. Contact admin to unlock.' }, { status: 403 })
    }

    const updated = await prisma.goal.update({ where: { id }, data: updates })
    return Response.json(updated)
  } catch (error) {
    console.error('Goals PUT error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return Response.json({ error: 'Goal ID required' }, { status: 400 })

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) return Response.json({ error: 'Goal not found' }, { status: 404 })
    if (goal.isLocked) return Response.json({ error: 'Cannot delete locked goal' }, { status: 403 })

    await prisma.checkIn.deleteMany({ where: { goalId: id } })
    await prisma.goalApproval.deleteMany({ where: { goalId: id } })
    await prisma.goal.delete({ where: { id } })

    return Response.json({ message: 'Goal deleted' })
  } catch (error) {
    console.error('Goals DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
