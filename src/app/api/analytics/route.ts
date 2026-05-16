import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: { thrustArea: true, employee: true, checkIns: true },
    })
    type GoalWithRelations = (typeof goals)[number]

    const employees = await prisma.user.findMany({ where: { role: 'EMPLOYEE' } })

    const totalGoals = goals.length
    const totalEmployees = employees.length
    const approvedGoals = goals.filter((g: GoalWithRelations) => g.status === 'APPROVED').length

    // Avg completion score
    const allCheckIns = goals.flatMap((g: GoalWithRelations) => g.checkIns)
    type CheckInType = GoalWithRelations['checkIns'][number]
    const scores = allCheckIns.filter((c: CheckInType) => c.score != null).map((c: CheckInType) => c.score!)
    const avgCompletion = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0

    // Check-in rate
    const goalsWithCheckIn = goals.filter((g: GoalWithRelations) => g.checkIns.length > 0).length
    const checkInRate = totalGoals > 0 ? (goalsWithCheckIn / totalGoals) * 100 : 0

    // Status distribution
    const statusMap: Record<string, number> = {}
    goals.forEach((g: GoalWithRelations) => { statusMap[g.status] = (statusMap[g.status] || 0) + 1 })
    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

    // Thrust area distribution
    const taMap: Record<string, number> = {}
    goals.forEach((g: GoalWithRelations) => {
      const name = g.thrustArea?.name || 'Unknown'
      taMap[name] = (taMap[name] || 0) + 1
    })
    const thrustAreaDistribution = Object.entries(taMap).map(([name, count]) => ({ name, count }))

    // Department completion
    const deptGoals: Record<string, { total: number; approved: number }> = {}
    goals.forEach((g: GoalWithRelations) => {
      const dept = g.employee?.department || 'Unknown'
      if (!deptGoals[dept]) deptGoals[dept] = { total: 0, approved: 0 }
      deptGoals[dept].total++
      if (g.status === 'APPROVED') deptGoals[dept].approved++
    })
    const departmentCompletion = Object.entries(deptGoals).map(([department, d]) => ({
      department,
      rate: d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0,
    }))

    return Response.json({
      totalGoals, totalEmployees, avgCompletion, checkInRate,
      statusDistribution, thrustAreaDistribution, departmentCompletion,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
