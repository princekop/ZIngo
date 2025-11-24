import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { BoostService } from '@/lib/boost.service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const boosts = await BoostService.getUserBoosts(session.user.id);
    return NextResponse.json(boosts);
  } catch (error) {
    console.error('Error fetching boosts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { boostId, serverId } = await req.json();
    
    if (!boostId || !serverId) {
      return new NextResponse('Missing boostId or serverId', { status: 400 });
    }

    // Verify the server exists and the user owns it
    const server = await prisma.server.findUnique({
      where: { id: serverId, ownerId: session.user.id }
    });

    if (!server) {
      return new NextResponse('Server not found or access denied', { status: 404 });
    }

    const updatedBoost = await BoostService.applyBoost(boostId, serverId, session.user.id);
    return NextResponse.json(updatedBoost);
  } catch (error: any) {
    console.error('Error applying boost:', error);
    return new NextResponse(
      error.message || 'Internal Server Error', 
      { status: 500 }
    );
  }
}
