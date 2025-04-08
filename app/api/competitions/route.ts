import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/competitions - Get all competitions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    
    let whereClause: any = {};
    
    // Filter by type if provided
    if (type) {
      whereClause.type = type;
    }
    
    // Filter by user if userId is provided
    if (userId) {
      whereClause.OR = [
        { creatorId: userId },
        {
          participants: {
            some: {
              userId,
            },
          },
        },
      ];
    }
    
    const competitions = await prisma.competition.findMany({
      where: whereClause,
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
              },
            },
          },
        },
        holes: {
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
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    // Calculate progress for each competition
    const competitionsWithProgress = competitions.map(competition => {
      if (competition.type === 'birdie-checklist') {
        // For each participant, calculate how many holes they've completed
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
        
        return {
          ...competition,
          participants: participantsWithProgress,
        };
      }
      
      return competition;
    });
    
    return NextResponse.json(competitionsWithProgress);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

// POST /api/competitions - Create a new competition
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, creatorId, participantIds } = body;
    
    // Validate required fields
    if (!title || !type || !creatorId) {
      return NextResponse.json(
        { error: 'Title, type, and creator ID are required' },
        { status: 400 }
      );
    }
    
    // Validate the creator exists
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
    });
    
    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }
    
    // Create the competition with a transaction to ensure all related data is created
    const competition = await prisma.$transaction(async (tx) => {
      // Create the competition
      const newCompetition = await tx.competition.create({
        data: {
          title,
          type,
          creatorId,
        },
      });
      
      // Add the creator as a participant
      await tx.competitionParticipant.create({
        data: {
          competitionId: newCompetition.id,
          userId: creatorId,
        },
      });
      
      // Add other participants if provided
      if (participantIds && participantIds.length > 0) {
        const participantData = participantIds
          .filter((id: string) => id !== creatorId) // Exclude creator as they're already added
          .map((userId: string) => ({
            competitionId: newCompetition.id,
            userId,
          }));
        
        if (participantData.length > 0) {
          await tx.competitionParticipant.createMany({
            data: participantData,
          });
        }
      }
      
      // For birdie checklist, create 18 holes
      if (type === 'birdie-checklist') {
        const holeData = Array.from({ length: 18 }, (_, i) => ({
          competitionId: newCompetition.id,
          holeNumber: i + 1,
        }));
        
        await tx.competitionHole.createMany({
          data: holeData,
        });
      }
      
      // For bingo, create bingo squares
      if (type === 'bingo') {
        // Default bingo challenges
        const bingoSquares = [
          'Birdie on a par 3',
          'Birdie on a par 4',
          'Birdie on a par 5',
          'Three pars in a row',
          'Hit all fairways on front 9',
          'Hit all greens on back 9',
          'No three-putts for 9 holes',
          'Chip in from off the green',
          'Sand save',
          'Up and down from 50+ yards',
          'Drive over 250 yards',
          'Putt over 20 feet',
          'Par or better on a hole with water',
          'Par or better on a hole with bunker',
          'Finish a round with the same ball',
          'Beat your handicap on 9 holes',
          'No double bogeys for 9 holes',
          'Play a round in under 4 hours',
          'Hit 5 fairways in a row',
          'Hit 5 greens in a row',
          'Make 3 one-putts in a row',
          'Par the hardest hole on the course',
          'Birdie the easiest hole on the course',
          'Play a round with no penalty strokes',
          'Play a round with no lost balls',
        ];
        
        // Create 25 squares (5x5 bingo board) for each participant
        const participants = [creatorId, ...(participantIds || [])];
        
        for (const userId of participants) {
          // Select 25 random challenges or use defaults if not enough
          const selectedChallenges = bingoSquares
            .sort(() => 0.5 - Math.random())
            .slice(0, 25);
          
          const squareData = selectedChallenges.map((description, i) => ({
            competitionId: newCompetition.id,
            userId,
            squareNumber: i + 1,
            description,
          }));
          
          await tx.bingoSquare.createMany({
            data: squareData,
          });
        }
      }
      
      return newCompetition;
    });
    
    // Fetch the complete competition with all related data
    const completeCompetition = await prisma.competition.findUnique({
      where: { id: competition.id },
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
              },
            },
          },
        },
        holes: {
          include: {
            birdies: true,
          },
        },
      },
    });
    
    return NextResponse.json(completeCompetition, { status: 201 });
  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    );
  }
}