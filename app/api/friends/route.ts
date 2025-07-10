import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all accepted friends
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: "ACCEPTED" },
          { friendId: session.user.id, status: "ACCEPTED" },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            friendId: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            friendId: true,
            image: true,
          },
        },
      },
    })

    // Transform the data to get a clean list of friends
    const formattedFriends = friends.map((friendship) => {
      // If the current user is the "user" in the relationship, return the "friend"
      if (friendship.userId === session.user.id) {
        return friendship.friend
      }
      // Otherwise, return the "user"
      return friendship.user
    })

    return NextResponse.json(formattedFriends)
  } catch (error) {
    console.error("[FRIENDS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { friendId } = await req.json()

    if (!friendId) {
      return new NextResponse("Friend ID is required", { status: 400 })
    }

    // Find the user with the given friendId
    const friendUser = await prisma.user.findUnique({
      where: {
        friendId: friendId,
      },
    })

    if (!friendUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if they're trying to add themselves
    if (friendUser.id === session.user.id) {
      return new NextResponse("Cannot add yourself as a friend", { status: 400 })
    }

    // Check if a friend request already exists
    const existingRequest = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: friendUser.id },
          { userId: friendUser.id, friendId: session.user.id },
        ],
      },
    })

    if (existingRequest) {
      return new NextResponse("Friend request already exists", { status: 400 })
    }

    // Create a new friend request
    const friendRequest = await prisma.friend.create({
      data: {
        userId: session.user.id,
        friendId: friendUser.id,
        status: "PENDING",
      },
    })

    return NextResponse.json(friendRequest)
  } catch (error) {
    console.error("[FRIENDS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
