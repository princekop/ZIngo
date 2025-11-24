import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { BoostService } from '@/lib/boost.service';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id: boostId } = await params;
    await BoostService.removeBoost(boostId, session.user.id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error removing boost:', error);
    return new NextResponse(
      error.message || 'Internal Server Error',
      { status: error.message === 'Active boost not found or not assigned to a server' ? 404 : 500 }
    );
  }
}
