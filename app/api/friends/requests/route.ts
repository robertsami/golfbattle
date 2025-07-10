import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all pending friend requests received by the user
    const pendingRequests = await prisma.friend.findMany({
      where: {
        friendId: session.user.id,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            friendId: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(pendingRequests)
  } catch (error) {
    console.error("[FRIEND_REQUESTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
