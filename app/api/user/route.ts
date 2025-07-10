import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user stats
    const [matchesCount, friendsCount, birdiesCount, bingoSquaresCount, pendingFriendRequests] = await Promise.all([
      prisma.match.count({
        where: {
          OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
        },
      }),
      prisma.friend.count({
        where: {
          OR: [
            { userId: session.user.id, status: "ACCEPTED" },
            { friendId: session.user.id, status: "ACCEPTED" },
          ],
        },
      }),
      prisma.birdieEntry.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.bingoEntry.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.friend.count({
        where: {
          friendId: session.user.id,
          status: "PENDING",
        },
      }),
    ])

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      friendId: session.user.friendId,
      stats: {
        matches: matchesCount,
        friends: friendsCount,
        birdies: birdiesCount,
        bingoSquares: bingoSquaresCount,
        pendingFriendRequests,
      },
    })
  } catch (error) {
    console.error("[USER_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
