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
    const { action } = await req.json()

    if (!action || !["accept", "reject"].includes(action)) {
      return new NextResponse("Invalid action", { status: 400 })
    }

    // Find the friend request
    const friendRequest = await prisma.friend.findUnique({
      where: {
        id,
      },
    })

    if (!friendRequest) {
      return new NextResponse("Friend request not found", { status: 404 })
    }

    // Check if the current user is the recipient of the request
    if (friendRequest.friendId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update the friend request status
    const updatedRequest = await prisma.friend.update({
      where: {
        id,
      },
      data: {
        status: action === "accept" ? "ACCEPTED" : "REJECTED",
      },
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("[FRIEND_REQUEST_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
