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
    const { player1Score, player2Score, date } = await req.json()

    if (!player1Score || !player2Score || !date) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get the match
    const match = await prisma.match.findUnique({
      where: {
        id,
      },
    })

    if (!match) {
      return new NextResponse("Match not found", { status: 404 })
    }

    // Check if the current user is a participant
    if (match.player1Id !== session.user.id && match.player2Id !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Create a new result
    const result = await prisma.matchResult.create({
      data: {
        matchId: id,
        player1Score: Number.parseInt(player1Score),
        player2Score: Number.parseInt(player2Score),
        date: new Date(date),
        status: "PENDING",
        submitterId: session.user.id,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[MATCH_RESULTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
