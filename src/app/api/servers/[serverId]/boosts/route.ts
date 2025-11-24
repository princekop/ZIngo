import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { BoostService } from '@/lib/boost.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { serverId } = await params;
    const serverBoosts = await BoostService.getServerBoosts(serverId);
    
    return NextResponse.json(serverBoosts);
  } catch (error) {
    console.error('Error fetching server boosts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
