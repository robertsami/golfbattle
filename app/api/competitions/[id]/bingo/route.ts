import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/competitions/[id]/bingo - Get bingo squares for a competition
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: competitionId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Validate the competition exists and is a bingo competition
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });
    
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }
    
    if (competition.type !== 'bingo') {
      return NextResponse.json(
        { error: 'This competition is not a bingo competition' },
        { status: 400 }
      );
    }
    
    // Build the query
    let whereClause: any = { competitionId };
    
    // Filter by user if provided
    if (userId) {
      whereClause.userId = userId;
    }
    
    // Get the bingo squares
    const bingoSquares = await prisma.bingoSquare.findMany({
      where: whereClause,
      orderBy: {
        squareNumber: 'asc',
      },
    });
    
    // If filtering by user, return a simple array
    if (userId) {
      return NextResponse.json(bingoSquares);
    }
    
    // Otherwise, group by user
    const squaresByUser: Record<string, any[]> = {};
    
    bingoSquares.forEach(square => {
      if (!squaresByUser[square.userId]) {
        squaresByUser[square.userId] = [];
      }
      squaresByUser[square.userId].push(square);
    });
    
    // Get user details for each user
    const userIds = Object.keys(squaresByUser);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
    
    // Create a map of user IDs to user details
    const userMap: Record<string, any> = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });
    
    // Format the response
    const result = Object.entries(squaresByUser).map(([userId, squares]) => ({
      user: userMap[userId],
      squares,
      completed: squares.filter(square => square.completed).length,
      total: squares.length,
      percentage: Math.round((squares.filter(square => square.completed).length / squares.length) * 100),
    }));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching bingo squares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bingo squares' },
      { status: 500 }
    );
  }
}

// PUT /api/competitions/[id]/bingo - Update a bingo square
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: competitionId } = params;
    const body = await request.json();
    const { squareId, completed, completedDate } = body;
    
    if (!squareId) {
      return NextResponse.json(
        { error: 'Square ID is required' },
        { status: 400 }
      );
    }
    
    // Validate the square exists and belongs to the competition
    const square = await prisma.bingoSquare.findFirst({
      where: {
        id: squareId,
        competitionId,
      },
    });
    
    if (!square) {
      return NextResponse.json(
        { error: 'Bingo square not found in this competition' },
        { status: 404 }
      );
    }
    
    // Update the square
    const updatedSquare = await prisma.bingoSquare.update({
      where: { id: squareId },
      data: {
        completed: completed !== undefined ? completed : undefined,
        completedDate: completedDate ? new Date(completedDate) : completed ? new Date() : undefined,
      },
    });
    
    return NextResponse.json(updatedSquare);
  } catch (error) {
    console.error('Error updating bingo square:', error);
    return NextResponse.json(
      { error: 'Failed to update bingo square' },
      { status: 500 }
    );
  }
}