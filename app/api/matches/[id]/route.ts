import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/matches/[id] - Get a specific match
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: matchId } = params;
    
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: {
          select: {
            id: true,
            name: true,
            friendId: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            friendId: true,
          },
        },
        results: {
          orderBy: {
            date: 'desc',
          },
          include: {
            submitter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    );
  }
}

// PUT /api/matches/[id] - Update a match
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: matchId } = params;
    const body = await request.json();
    const { title, status } = body;
    
    // Validate the match exists
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
    });
    
    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Update the match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        title: title !== undefined ? title : undefined,
        status: status !== undefined ? status : undefined,
      },
      include: {
        player1: {
          select: {
            id: true,
            name: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}

// DELETE /api/matches/[id] - Delete a match
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: matchId } = params;
    
    // Validate the match exists
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
    });
    
    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Delete the match
    await prisma.match.delete({
      where: { id: matchId },
    });
    
    return NextResponse.json(
      { message: 'Match deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    );
  }
}