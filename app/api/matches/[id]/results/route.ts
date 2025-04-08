import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/matches/[id]/results - Get all results for a match
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly awaited
    const { id: matchId } = await params;
    
    // Validate the match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Get all results for the match
    const results = await prisma.matchResult.findMany({
      where: { matchId },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching match results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match results' },
      { status: 500 }
    );
  }
}

// POST /api/matches/[id]/results - Add a result to a match
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly awaited
    const { id: matchId } = await params;
    const body = await request.json();
    const { player1Score, player2Score, date, submitterId } = body;
    
    // Validate required fields
    if (player1Score === undefined || player2Score === undefined || !date || !submitterId) {
      return NextResponse.json(
        { error: 'Player scores, date, and submitter ID are required' },
        { status: 400 }
      );
    }
    
    // Validate the match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: true,
        player2: true,
      },
    });
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Validate the submitter is one of the players
    if (submitterId !== match.player1Id && submitterId !== match.player2Id) {
      return NextResponse.json(
        { error: 'Only match participants can submit results' },
        { status: 403 }
      );
    }
    
    // Create the result
    const result = await prisma.matchResult.create({
      data: {
        matchId,
        submitterId,
        player1Score: parseInt(player1Score),
        player2Score: parseInt(player2Score),
        date: new Date(date),
        status: 'accepted', // Changed from 'pending' to 'accepted'
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // If the result is accepted (auto-accept if submitted by both players or for testing)
    // Update the match scores
    if (result.status === 'accepted') {
      // Get all accepted results
      const acceptedResults = await prisma.matchResult.findMany({
        where: {
          matchId,
          status: 'accepted',
        },
      });
      
      // Calculate the new match score
      let player1Wins = 0;
      let player2Wins = 0;
      
      acceptedResults.forEach(result => {
        if (result.player1Score > result.player2Score) {
          player1Wins++;
        } else if (result.player2Score > result.player1Score) {
          player2Wins++;
        }
      });
      
      // Update the match
      await prisma.match.update({
        where: { id: matchId },
        data: {
          player1Score: player1Wins,
          player2Score: player2Wins,
        },
      });
    }
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding match result:', error);
    return NextResponse.json(
      { error: 'Failed to add match result' },
      { status: 500 }
    );
  }
}