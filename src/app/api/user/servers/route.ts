import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const servers = await prisma.server.findMany({
      where: {
        ownerId: session.user.id
      },
      select: {
        id: true,
        name: true,
        icon: true,
        boostLevel: true,
        _count: {
          select: {
            members: true // This counts ServerMember records
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to match the expected format
    const transformedServers = servers.map(server => ({
      id: server.id,
      name: server.name,
      icon: server.icon,
      boostLevel: server.boostLevel,
      _count: {
        members: server._count.members
      }
    }));

    return NextResponse.json(transformedServers);
  } catch (error) {
    console.error('Error fetching user servers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
