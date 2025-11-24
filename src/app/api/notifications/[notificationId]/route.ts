import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = params

    // TODO: Delete notification from database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
