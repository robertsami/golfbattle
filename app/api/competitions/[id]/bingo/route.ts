import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params
    const { squareId, date, attestedById } = await req.json()

    if (!squareId || !date) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get the competition
    const competition = await prisma.competition.findUnique({
      where: {
        id,
      },
      include: {
        participants: true,
        bingoSquares: true,
      },
    })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    // Check if the competition is a bingo board
    if (competition.type !== "BINGO") {
      return new NextResponse("This is not a bingo competition", { status: 400 })
    }

    // Check if the current user is a participant
    const isParticipant = competition.participants.some((p) => p.userId === session.user.id)

    if (!isParticipant) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if the square exists and belongs to this competition
    const square = competition.bingoSquares.find((s) => s.id === squareId)

    if (!square) {
      return new NextResponse("Square not found", { status: 404 })
    }

    // Check if the user already has an entry for this square
    const existingEntry = await prisma.bingoEntry.findUnique({
      where: {
        squareId_userId: {
          squareId,
          userId: session.user.id,
        },
      },
    })

    if (existingEntry) {
      return new NextResponse("You already have an entry for this square", { status: 400 })
    }

    // If attestedById is provided, check if they are a participant
    if (attestedById) {
      const isAttesterParticipant = competition.participants.some((p) => p.userId === attestedById)

      if (!isAttesterParticipant) {
        return new NextResponse("Attester is not a participant", { status: 400 })
      }
    }

    // Create a new bingo entry
    const entry = await prisma.bingoEntry.create({
      data: {
        squareId,
        competitionId: id,
        userId: session.user.id,
        date: new Date(date),
        attestedById: attestedById || null,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error("[COMPETITION_BINGO_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
