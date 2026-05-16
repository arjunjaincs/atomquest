import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'json'

    const goals = await prisma.goal.findMany({
      include: {
        employee: { select: { name: true, email: true, department: true } },
        thrustArea: { select: { name: true } },
        checkIns: { orderBy: { quarter: 'asc' } },
      },
      orderBy: [{ employee: { department: 'asc' } }, { employee: { name: 'asc' } }],
    })

    if (format === 'csv') {
      const headers = ['Employee', 'Email', 'Department', 'Thrust Area', 'Goal Title', 'UoM', 'Target', 'Weightage', 'Status', 'Q1 Achievement', 'Q1 Score', 'Q2 Achievement', 'Q2 Score', 'Q3 Achievement', 'Q3 Score', 'Q4 Achievement', 'Q4 Score']
      const rows = goals.map(g => {
        const getCI = (q: string) => g.checkIns.find(c => c.quarter === q)
        return [
          g.employee?.name, g.employee?.email, g.employee?.department,
          g.thrustArea?.name, g.title, g.uom, g.target, g.weightage, g.status,
          getCI('Q1')?.achievement ?? '', getCI('Q1')?.score ?? '',
          getCI('Q2')?.achievement ?? '', getCI('Q2')?.score ?? '',
          getCI('Q3')?.achievement ?? '', getCI('Q3')?.score ?? '',
          getCI('Q4')?.achievement ?? '', getCI('Q4')?.score ?? '',
        ].map(v => `"${v}"`).join(',')
      })

      const csv = [headers.join(','), ...rows].join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="goalflow-report.csv"',
        },
      })
    }

    return Response.json(goals)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
