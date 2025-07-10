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
    const type = url.searchParams.get("type")

    // Get all competitions for the current user
    const competitions = await prisma.competition.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
        ...(type ? { type: type as any } : {}),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        birdieEntries: true,
        bingoEntries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(competitions)
  } catch (error) {
    console.error("[COMPETITIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, description, type, boardSize, participantIds } = await req.json()

    if (!title || !type || !participantIds || participantIds.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create a new competition
    const competition = await prisma.competition.create({
      data: {
        title,
        description,
        type: type === "birdie-checklist" ? "BIRDIE_CHECKLIST" : "BINGO",
        boardSize: type === "bingo" ? Number.parseInt(boardSize) : null,
        creatorId: session.user.id,
        participants: {
          create: [
            // Add the creator
            { userId: session.user.id },
            // Add other participants
            ...participantIds.map((id: string) => ({ userId: id })),
          ],
        },
      },
    })

    // If it's a bingo competition, create the squares
    if (type === "bingo") {
      const size = Number.parseInt(boardSize) || 5
      const squares = []

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          squares.push({
            competitionId: competition.id,
            row,
            column: col,
            description: `Square ${row * size + col + 1}`,
          })
        }
      }

      await prisma.bingoSquare.createMany({
        data: squares,
      })
    }

    return NextResponse.json(competition)
  } catch (error) {
    console.error("[COMPETITIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
