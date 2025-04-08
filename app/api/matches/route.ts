import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/matches - Get all matches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let whereClause = {};
    
    // Filter by user if userId is provided
    if (userId) {
      whereClause = {
        OR: [
          { player1Id: userId },
          { player2Id: userId },
        ],
      };
    }
    
    const matches = await prisma.match.findMany({
      where: whereClause,
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
          take: 5,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

// POST /api/matches - Create a new match
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player1Id, player2Id, title } = body;
    
    // Validate required fields
    if (!player1Id || !player2Id) {
      return NextResponse.json(
        { error: 'Both player IDs are required' },
        { status: 400 }
      );
    }
    
    // Validate players exist
    const player1 = await prisma.user.findUnique({
      where: { id: player1Id },
    });
    
    const player2 = await prisma.user.findUnique({
      where: { id: player2Id },
    });
    
    if (!player1 || !player2) {
      return NextResponse.json(
        { error: 'One or both players not found' },
        { status: 404 }
      );
    }
    
    // Create the match
    const match = await prisma.match.create({
      data: {
        player1Id,
        player2Id,
        title: title || `Match: ${player1.name} vs ${player2.name}`,
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
    
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}