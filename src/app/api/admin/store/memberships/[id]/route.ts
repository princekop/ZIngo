import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { id } = await params;

    // Update membership status to canceled instead of deleting
    await prisma.userMembership.update({
      where: { id },
      data: { status: 'canceled' }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error revoking membership:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
