import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        friendId: true,
        email: true,
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, friendId } = body;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Generate a unique friendId if not provided
    const generatedFriendId = friendId || `golf_${Math.random().toString(36).substring(2, 10)}`;
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        friendId: generatedFriendId,
      },
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this email or friendId already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}