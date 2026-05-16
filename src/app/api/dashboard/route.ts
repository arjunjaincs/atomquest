import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const role = request.nextUrl.searchParams.get('role')
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

    let totalGoals = 0, approvedGoals = 0, pendingApprovals = 0, checkInsCompleted = 0, avgScore = 0
    let recentGoals: any[] = []

    if (role === 'EMPLOYEE') {
      const goals = await prisma.goal.findMany({
        where: { employeeId: userId },
        include: { thrustArea: true, checkIns: true },
        orderBy: { updatedAt: 'desc' },
      })
      totalGoals = goals.length
      approvedGoals = goals.filter(g => g.status === 'APPROVED').length
      pendingApprovals = goals.filter(g => g.status === 'SUBMITTED').length
      const allCheckIns = goals.flatMap(g => g.checkIns)
      checkInsCompleted = allCheckIns.length
      const scores = allCheckIns.filter(c => c.score != null).map(c => c.score!)
      avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      recentGoals = goals.slice(0, 5)
    } else if (role === 'MANAGER') {
      const teamMembers = await prisma.user.findMany({ where: { managerId: userId } })
      const teamIds = teamMembers.map(u => u.id)
      const goals = await prisma.goal.findMany({
        where: { employeeId: { in: teamIds } },
        include: { thrustArea: true, employee: true, checkIns: true },
        orderBy: { updatedAt: 'desc' },
      })
      totalGoals = goals.length
      approvedGoals = goals.filter(g => g.status === 'APPROVED').length
      pendingApprovals = goals.filter(g => g.status === 'SUBMITTED').length
      const allCheckIns = goals.flatMap(g => g.checkIns)
      checkInsCompleted = allCheckIns.length
      const scores = allCheckIns.filter(c => c.score != null).map(c => c.score!)
      avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      recentGoals = goals.slice(0, 5)
    } else {
      const goals = await prisma.goal.findMany({
        include: { thrustArea: true, employee: true, checkIns: true },
        orderBy: { updatedAt: 'desc' },
      })
      totalGoals = goals.length
      approvedGoals = goals.filter(g => g.status === 'APPROVED').length
      pendingApprovals = goals.filter(g => g.status === 'SUBMITTED').length
      const allCheckIns = goals.flatMap(g => g.checkIns)
      checkInsCompleted = allCheckIns.length
      const scores = allCheckIns.filter(c => c.score != null).map(c => c.score!)
      avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      recentGoals = goals.slice(0, 5)
    }

    return Response.json({
      stats: { totalGoals, approvedGoals, pendingApprovals, checkInsCompleted, avgScore },
      recentGoals,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
