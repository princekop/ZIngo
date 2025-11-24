import { prisma } from '@/lib/prisma';
import { MembershipTier } from '@prisma/client';

export class BoostService {
  private static readonly BOOST_VALUE = 10; // 1 boost = 10 rupees
  private static readonly BYTE_BOOSTS = 2; // Number of boosts for Byte members

  /**
   * Grant initial boosts to a new Byte member
   */
  static async grantInitialBoosts(userId: string, membershipId: string) {
    const membership = await prisma.userMembership.findUnique({
      where: { id: membershipId, userId },
      include: { tier: true }
    });

    if (!membership || membership.tier.name !== 'Byte' || membership.boostsGranted) {
      return [];
    }

    // Create the boosts
    const boosts = [];
    for (let i = 0; i < this.BYTE_BOOSTS; i++) {
      const boost = await prisma.userBoost.create({
        data: {
          userId,
          membershipId,
          value: 1, // 1 boost = 10 rupees value
          isActive: true,
        }
      });
      boosts.push(boost);
    }

    // Mark that boosts have been granted
    await prisma.userMembership.update({
      where: { id: membershipId },
      data: { boostsGranted: true }
    });

    return boosts;
  }

  /**
   * Apply a boost to a server
   */
  static async applyBoost(boostId: string, serverId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Verify the boost exists and belongs to the user
      const boost = await tx.userBoost.findUnique({
        where: { id: boostId, userId, isActive: true, serverId: null }
      });

      if (!boost) {
        throw new Error('Boost not found or already used');
      }

      // Update the boost to be assigned to the server
      const updatedBoost = await tx.userBoost.update({
        where: { id: boostId },
        data: { serverId, isActive: true },
        include: { server: true }
      });

      // Update the server's boost level
      await tx.server.update({
        where: { id: serverId },
        data: { boostLevel: { increment: boost.value } }
      });

      return updatedBoost;
    });
  }

  /**
   * Remove a boost from a server
   */
  static async removeBoost(boostId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const boost = await tx.userBoost.findUnique({
        where: { id: boostId, userId, isActive: true },
        include: { server: true }
      });

      if (!boost || !boost.serverId) {
        throw new Error('Active boost not found or not assigned to a server');
      }

      // Update the boost to be unassigned
      await tx.userBoost.update({
        where: { id: boostId },
        data: { serverId: null, isActive: false }
      });

      // Update the server's boost level
      await tx.server.update({
        where: { id: boost.serverId },
        data: { 
          boostLevel: { 
            decrement: boost.value 
          } 
        }
      });
    });
  }

  /**
   * Get all active boosts for a user
   */
  static async getUserBoosts(userId: string) {
    return prisma.userBoost.findMany({
      where: { 
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        membership: {
          include: {
            tier: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { serverId: 'asc' }, // Group by server
        { createdAt: 'asc' }  // Oldest first
      ]
    });
  }

  /**
   * Get all boosts for a server
   */
  static async getServerBoosts(serverId: string) {
    return prisma.userBoost.findMany({
      where: { 
        serverId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Check if a user can boost a server
   */
  static async canUserBoostServer(userId: string, serverId: string): Promise<boolean> {
    const [hasAvailableBoosts, isMember] = await Promise.all([
      // Check if user has available boosts
      prisma.userBoost.count({
        where: { 
          userId, 
          isActive: true, 
          serverId: null,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }) > 0,
      
      // Check if user is a member of the server (or owner)
      Promise.all([
        prisma.server.count({
          where: { id: serverId, ownerId: userId }
        }),
        prisma.serverMember.count({
          where: { serverId, userId }
        })
      ]).then(([ownerCount, memberCount]) => ownerCount > 0 || memberCount > 0)
    ]);

    return hasAvailableBoosts && isMember;
  }
}
