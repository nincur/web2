import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ResultsService {
  // Store drawn numbers for the current closed round
  async storeDrawnNumbers(numbers: number[]): Promise<boolean> {
    // Get the latest round
    const latestRound = await prisma.round.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // Validation: round must exist, be closed, and have no drawn numbers yet
    if (!latestRound) {
      return false; // No round exists
    }

    if (latestRound.isActive) {
      return false; // Round is still active
    }

    if (latestRound.drawnNumbers.length > 0) {
      return false; // Numbers already drawn for this round
    }

    // Store the numbers
    await prisma.round.update({
      where: { id: latestRound.id },
      data: { drawnNumbers: numbers },
    });

    return true;
  }
}

export const resultsService = new ResultsService();
