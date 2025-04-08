import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/competitions/[id]/birdies - Add a birdie to a competition
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly awaited
    const { id: competitionId } = await params;
    const body = await request.json();
    const { holeNumber, achieverId, attesterId, date } = body;
    
    // Validate required fields
    if (!holeNumber || !achieverId || !date) {
      return NextResponse.json(
        { error: 'Hole number, achiever ID, and date are required' },
        { status: 400 }
      );
    }
    
    // Validate the competition exists and is a birdie checklist
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });
    
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }
    
    if (competition.type !== 'birdie-checklist') {
      return NextResponse.json(
        { error: 'This competition is not a birdie checklist' },
        { status: 400 }
      );
    }
    
    // Validate the hole exists
    const hole = await prisma.competitionHole.findUnique({
      where: {
        competitionId_holeNumber: {
          competitionId,
          holeNumber: parseInt(holeNumber),
        },
      },
    });
    
    if (!hole) {
      return NextResponse.json(
        { error: 'Hole not found in this competition' },
        { status: 404 }
      );
    }
    
    // Validate the achiever is a participant
    const achieverParticipant = await prisma.competitionParticipant.findUnique({
      where: {
        competitionId_userId: {
          competitionId,
          userId: achieverId,
        },
      },
    });
    
    if (!achieverParticipant) {
      return NextResponse.json(
        { error: 'Achiever is not a participant in this competition' },
        { status: 400 }
      );
    }
    
    // Validate the attester is a participant if provided
    if (attesterId) {
      const attesterParticipant = await prisma.competitionParticipant.findUnique({
        where: {
          competitionId_userId: {
            competitionId,
            userId: attesterId,
          },
        },
      });
      
      if (!attesterParticipant) {
        return NextResponse.json(
          { error: 'Attester is not a participant in this competition' },
          { status: 400 }
        );
      }
    }
    
    // Check if the achiever already has a birdie for this hole
    const existingBirdie = await prisma.birdie.findUnique({
      where: {
        competitionHoleId_achieverId: {
          competitionHoleId: hole.id,
          achieverId,
        },
      },
    });
    
    if (existingBirdie) {
      return NextResponse.json(
        { error: 'Achiever already has a birdie for this hole' },
        { status: 409 }
      );
    }
    
    // Create the birdie
    const birdie = await prisma.birdie.create({
      data: {
        competitionHoleId: hole.id,
        achieverId,
        attesterId,
        date: new Date(date),
      },
      include: {
        achiever: {
          select: {
            id: true,
            name: true,
          },
        },
        attester: attesterId ? {
          select: {
            id: true,
            name: true,
          },
        } : undefined,
      },
    });
    
    return NextResponse.json(birdie, { status: 201 });
  } catch (error) {
    console.error('Error adding birdie:', error);
    return NextResponse.json(
      { error: 'Failed to add birdie' },
      { status: 500 }
    );
  }
}