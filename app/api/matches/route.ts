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
    const status = url.searchParams.get("status") || "ACTIVE"

    // Get all matches for the current user
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
        status: status as any,
      },
      include: {
        player1: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        results: {
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error("[MATCHES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { player2Id, name } = await req.json()

    if (!player2Id) {
      return new NextResponse("Opponent ID is required", { status: 400 })
    }

    // Check if the players are friends
    const areFriends = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: player2Id, status: "ACCEPTED" },
          { userId: player2Id, friendId: session.user.id, status: "ACCEPTED" },
        ],
      },
    })

    if (!areFriends) {
      return new NextResponse("You can only create matches with friends", { status: 400 })
    }

    // Create a new match
    const match = await prisma.match.create({
      data: {
        player1Id: session.user.id,
        player2Id,
        name: name || undefined,
        status: "ACTIVE",
      },
    })

    return NextResponse.json(match)
  } catch (error) {
    console.error("[MATCHES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
