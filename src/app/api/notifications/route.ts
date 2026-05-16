import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const unread = request.nextUrl.searchParams.get('unread')

    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

    let where: any = { userId }
    if (unread === 'true') where.isRead = false

    if (unread === 'true') {
      const count = await prisma.notification.count({ where })
      return Response.json({ count })
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return Response.json(notifications)
  } catch (error) {
    console.error('Notification error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (id) {
      await prisma.notification.update({ where: { id }, data: { isRead: true } })
    }
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
