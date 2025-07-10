import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params
    const { squares } = await req.json()

    if (!squares || !Array.isArray(squares)) {
      return new NextResponse("Invalid squares data", { status: 400 })
    }

    // Get the competition
    const competition = await prisma.competition.findUnique({
      where: {
        id,
      },
    })

    if (!competition) {
      return new NextResponse("Competition not found", { status: 404 })
    }

    // Check if the current user is the creator
    if (competition.creatorId !== session.user.id) {
      return new NextResponse("Only the creator can update square descriptions", { status: 401 })
    }

    // Check if the competition is a bingo board
    if (competition.type !== "BINGO") {
      return new NextResponse("This is not a bingo competition", { status: 400 })
    }

    // Update each square
    const updates = []
    for (const square of squares) {
      if (!square.id || !square.description) continue

      updates.push(
        prisma.bingoSquare.update({
          where: {
            id: square.id,
          },
          data: {
            description: square.description,
          },
        }),
      )
    }

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[COMPETITION_BINGO_SQUARES_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
