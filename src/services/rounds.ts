import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoundsService {
  // Create a new round and deactivate all previous rounds
  async createNewRound(): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Deactivate all existing rounds
      await tx.round.updateMany({
        where: { isActive: true },
        data: { isActive: false, closedAt: new Date() },
      });

      // Create new active round
      await tx.round.create({
        data: {
          isActive: true,
          drawnNumbers: [],
        },
      });
    });
  }

  // Close the current active round
  async closeCurrentRound(): Promise<void> {
    await prisma.round.updateMany({
      where: { isActive: true },
      data: { isActive: false, closedAt: new Date() },
    });
  }

  // Get the current active round
  async getCurrentRound() {
    return await prisma.round.findFirst({
      where: { isActive: true },
    });
  }

  // Get the most recent round (whether active or not)
  async getLatestRound() {
    return await prisma.round.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Count tickets in the current round
  async countTicketsInCurrentRound(): Promise<number> {
    const currentRound = await this.getCurrentRound();
    if (!currentRound) return 0;

    return await prisma.ticket.count({
      where: { roundId: currentRound.id },
    });
  }
}

export const roundsService = new RoundsService();
