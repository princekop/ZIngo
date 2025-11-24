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

    // Get all servers where user is a member
    const memberServers = await prisma.serverMember.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            icon: true,
            boostLevel: true,
            ownerId: true,
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // Transform data and separate owned vs joined servers
    const transformedServers = memberServers.map(member => ({
      id: member.server.id,
      name: member.server.name,
      icon: member.server.icon,
      boostLevel: member.server.boostLevel,
      memberCount: member.server._count.members,
      isOwner: member.server.ownerId === session.user.id
    }));

    // Sort: owners first, then by name
    const sortedServers = transformedServers.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sortedServers);
  } catch (error) {
    console.error('Error fetching joined servers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
