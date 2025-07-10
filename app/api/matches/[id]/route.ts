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

    // Get the match
    const match = await prisma.match.findUnique({
      where: {
        id,
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
          include: {
            submitter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!match) {
      return new NextResponse("Match not found", { status: 404 })
    }

    // Check if the current user is a participant
    if (match.player1Id !== session.user.id && match.player2Id !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error("[MATCH_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params
    const { status } = await req.json()

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

    // Update the match
    const updatedMatch = await prisma.match.update({
      where: {
        id,
      },
      data: {
        status: status as any,
      },
    })

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error("[MATCH_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
