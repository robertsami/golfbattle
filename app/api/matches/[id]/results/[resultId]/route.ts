import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string; resultId: string } }) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id, resultId } = params
    const { action } = await req.json()

    if (!action || !["accept", "reject"].includes(action)) {
      return new NextResponse("Invalid action", { status: 400 })
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

    // Get the result
    const result = await prisma.matchResult.findUnique({
      where: {
        id: resultId,
      },
    })

    if (!result) {
      return new NextResponse("Result not found", { status: 404 })
    }

    // Check if the current user is not the submitter
    if (result.submitterId === session.user.id) {
      return new NextResponse("You cannot accept/reject your own result", { status: 400 })
    }

    // Update the result
    const updatedResult = await prisma.matchResult.update({
      where: {
        id: resultId,
      },
      data: {
        status: action === "accept" ? "ACCEPTED" : "REJECTED",
      },
    })

    return NextResponse.json(updatedResult)
  } catch (error) {
    console.error("[MATCH_RESULT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
