import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: {
          select: {
            id: true,
            name: true,
            friendId: true,
          },
        },
        matchesAsPlayer1: {
          include: {
            player2: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        matchesAsPlayer2: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        participatingIn: {
          include: {
            competition: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Combine matches where user is player1 or player2
    const matches = [
      ...user.matchesAsPlayer1.map(match => ({
        ...match,
        opponent: match.player2,
        isPlayer1: true,
      })),
      ...user.matchesAsPlayer2.map(match => ({
        ...match,
        opponent: match.player1,
        isPlayer1: false,
      })),
    ];
    
    // Format the response
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      friendId: user.friendId,
      friends: user.friends,
      matches,
      competitions: user.participatingIn.map(p => p.competition),
    };
    
    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const body = await request.json();
    const { name, email } = body;
    
    // Validate the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    
    // Validate the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}