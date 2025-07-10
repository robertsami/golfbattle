import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const query = url.searchParams.get("q")
    const friendId = url.searchParams.get("friendId")

    if (!query && !friendId) {
      return new NextResponse("Search query or friendId is required", { status: 400 })
    }

    let whereClause = {}

    if (friendId) {
      whereClause = {
        friendId: {
          equals: friendId,
        },
      }
    } else {
      whereClause = {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            friendId: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      }
    }

    // Search for users
    const users = await prisma.user.findMany({
      where: {
        ...whereClause,
        id: {
          not: session.user.id, // Exclude the current user
        },
      },
      select: {
        id: true,
        name: true,
        friendId: true,
        image: true,
      },
      take: 10,
    })

    // For each user, check if they are already friends or have a pending request
    const usersWithFriendStatus = await Promise.all(
      users.map(async (user) => {
        const friendRelation = await prisma.friend.findFirst({
          where: {
            OR: [
              { userId: session.user.id, friendId: user.id },
              { userId: user.id, friendId: session.user.id },
            ],
          },
        })

        return {
          ...user,
          friendStatus: friendRelation ? friendRelation.status : null,
          // If the current user sent the request
          sentRequest: friendRelation && friendRelation.userId === session.user.id,
        }
      }),
    )

    return NextResponse.json(usersWithFriendStatus)
  } catch (error) {
    console.error("[SEARCH_USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
