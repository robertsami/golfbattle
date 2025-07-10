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
    const { holeNumber, date, attestedById } = await req.json()

    if (!holeNumber || !date) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get the competition
    const competition = await prisma.competition.findUnique({
      where: {
        id,
      },
      include: {
        participants: true,
      },
    })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    // Check if the competition is a birdie checklist
    if (competition.type !== "BIRDIE_CHECKLIST") {
      return new NextResponse("This is not a birdie checklist competition", { status: 400 })
    }

    // Check if the current user is a participant
    const isParticipant = competition.participants.some((p) => p.userId === session.user.id)

    if (!isParticipant) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if the hole number is valid (1-18)
    if (holeNumber < 1 || holeNumber > 18) {
      return new NextResponse("Invalid hole number", { status: 400 })
    }

    // Check if the user already has a birdie for this hole
    const existingBirdie = await prisma.birdieEntry.findUnique({
      where: {
        competitionId_userId_holeNumber: {
          competitionId: id,
          userId: session.user.id,
          holeNumber: Number.parseInt(holeNumber),
        },
      },
    })

    if (existingBirdie) {
      return new NextResponse("You already have a birdie for this hole", { status: 400 })
    }

    // If attestedById is provided, check if they are a participant
    if (attestedById) {
      const isAttesterParticipant = competition.participants.some((p) => p.userId === attestedById)

      if (!isAttesterParticipant) {
        return new NextResponse("Attester is not a participant", { status: 400 })
      }
    }

    // Create a new birdie entry
    const birdie = await prisma.birdieEntry.create({
      data: {
        competitionId: id,
        userId: session.user.id,
        holeNumber: Number.parseInt(holeNumber),
        date: new Date(date),
        attestedById: attestedById || null,
      },
    })

    return NextResponse.json(birdie)
  } catch (error) {
    console.error("[COMPETITION_BIRDIES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
