import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTicketData {
  idNumber: string;
  selectedNumbers: number[];
}

export class TicketsService {
  // Create a new ticket in the current active round
  async createTicket(data: CreateTicketData): Promise<string> {
    // Get current active round
    const currentRound = await prisma.round.findFirst({
      where: { isActive: true },
    });

    if (!currentRound) {
      throw new Error('No active round available');
    }

    // Create ticket and return its UUID
    const ticket = await prisma.ticket.create({
      data: {
        roundId: currentRound.id,
        idNumber: data.idNumber,
        selectedNumbers: data.selectedNumbers,
      },
    });

    return ticket.id;
  }

  // Get ticket details by ID
  async getTicketById(ticketId: string) {
    return await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        round: true,
      },
    });
  }
}

export const ticketsService = new TicketsService();
