import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/competitions/[id] - Get a specific competition
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: competitionId } = params;
    
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                friendId: true,
              },
            },
          },
        },
        holes: {
          orderBy: {
            holeNumber: 'asc',
          },
          include: {
            birdies: {
              include: {
                achiever: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                attester: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }
    
    // For birdie checklist, calculate progress for each participant
    if (competition.type === 'birdie-checklist') {
      const participantsWithProgress = competition.participants.map(participant => {
        const completedHoles = competition.holes.filter(hole => 
          hole.birdies.some(birdie => birdie.achieverId === participant.userId)
        ).length;
        
        return {
          ...participant,
          progress: completedHoles,
          total: competition.holes.length,
          percentage: Math.round((completedHoles / competition.holes.length) * 100),
        };
      });
      
      return NextResponse.json({
        ...competition,
        participants: participantsWithProgress,
      });
    }
    
    // For bingo competitions, fetch the bingo squares
    if (competition.type === 'bingo') {
      const bingoSquares = await prisma.bingoSquare.findMany({
        where: {
          competitionId: competitionId,
        },
        orderBy: {
          squareNumber: 'asc',
        },
      });
      
      // Group squares by user
      const squaresByUser: Record<string, any[]> = {};
      
      bingoSquares.forEach(square => {
        if (!squaresByUser[square.userId]) {
          squaresByUser[square.userId] = [];
        }
        squaresByUser[square.userId].push(square);
      });
      
      // Calculate progress for each participant
      const participantsWithProgress = competition.participants.map(participant => {
        const userSquares = squaresByUser[participant.userId] || [];
        const completedSquares = userSquares.filter(square => square.completed).length;
        
        return {
          ...participant,
          bingoSquares: userSquares,
          progress: completedSquares,
          total: 25, // 5x5 bingo board
          percentage: Math.round((completedSquares / 25) * 100),
        };
      });
      
      return NextResponse.json({
        ...competition,
        participants: participantsWithProgress,
      });
    }
    
    return NextResponse.json(competition);
  } catch (error) {
    console.error('Error fetching competition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
      { status: 500 }
    );
  }
}

// PUT /api/competitions/[id] - Update a competition
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: competitionId } = params;
    const body = await request.json();
    const { title, endDate } = body;
    
    // Validate the competition exists
    const existingCompetition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });
    
    if (!existingCompetition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }
    
    // Update the competition
    const updatedCompetition = await prisma.competition.update({
      where: { id: competitionId },
      data: {
        title: title !== undefined ? title : undefined,
        endDate: endDate !== undefined ? new Date(endDate) : undefined,
      },
    });
    
    return NextResponse.json(updatedCompetition);
  } catch (error) {
    console.error('Error updating competition:', error);
    return NextResponse.json(
      { error: 'Failed to update competition' },
      { status: 500 }
    );
  }
}

// DELETE /api/competitions/[id] - Delete a competition
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: competitionId } = params;
    
    // Validate the competition exists
    const existingCompetition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });
    
    if (!existingCompetition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }
    
    // Delete the competition
    await prisma.competition.delete({
      where: { id: competitionId },
    });
    
    return NextResponse.json(
      { message: 'Competition deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting competition:', error);
    return NextResponse.json(
      { error: 'Failed to delete competition' },
      { status: 500 }
    );
  }
}