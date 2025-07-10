import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params

    // Get the competition
    const competition = await prisma.competition.findUnique({
      where: {
        id,
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
        bingoSquares: {
          include: {
            entries: true,
          },
        },
        bingoEntries: true,
      },
    })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    // Check if the current user is a participant
    const isParticipant = competition.participants.some((p) => p.userId === session.user.id)

    if (!isParticipant) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(competition)
  } catch (error) {
    console.error("[COMPETITION_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
