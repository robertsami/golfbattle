"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, User, Trophy, CheckSquare, Grid3X3, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function FriendsPage() {
  const { toast } = useToast()
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const [friendsResponse, requestsResponse] = await Promise.all([
          fetch("/api/friends"),
          fetch("/api/friends/requests"),
        ])

        if (!friendsResponse.ok || !requestsResponse.ok) {
          throw new Error("Failed to fetch friends data")
        }

        const [friendsData, requestsData] = await Promise.all([friendsResponse.json(), requestsResponse.json()])

        setFriends(friendsData)
        setPendingRequests(requestsData)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load friends",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFriends()
  }, [toast])

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "accept",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept friend request")
      }

      // Update the UI
      const request = pendingRequests.find((r) => r.id === requestId)
      if (request) {
        // Remove from pending requests
        setPendingRequests(pendingRequests.filter((r) => r.id !== requestId))

        // Add to friends list
        setFriends([...friends, request.user])

        toast({
          title: "Friend request accepted",
          description: `You are now friends with ${request.user.name}`,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reject",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject friend request")
      }

      // Update the UI
      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId))

      toast({
        title: "Friend request rejected",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to reject friend request",
        variant: "destructive",
      })
    }
  }

  const filteredFriends = searchTerm
    ? friends.filter(
        (friend) =>
          friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          friend.friendId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : friends

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-green-800">Friends</h1>
          {pendingRequests.length > 0 && <Badge className="bg-amber-500">{pendingRequests.length} pending</Badge>}
        </div>
        <Link href="/friends/add">
          <Button className="bg-green-800 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" /> Add Friend
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="friends">
        <TabsList className="mb-6">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search friends..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Loading friends...</CardContent>
              </Card>
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => <FriendCard key={friend.id} friend={friend} />)
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  {searchTerm ? "No friends match your search" : "No friends yet. Add some friends to get started!"}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Loading requests...</CardContent>
              </Card>
            ) : pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => handleAcceptRequest(request.id)}
                  onReject={() => handleRejectRequest(request.id)}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">No pending friend requests</CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FriendCard({ friend }) {
  const [stats, setStats] = useState({
    matches: 0,
    birdies: 0,
    bingoSquares: 0,
  })

  useEffect(() => {
    // In a real app, we would fetch the friend's stats
    // For now, we'll use random numbers
    setStats({
      matches: Math.floor(Math.random() * 10),
      birdies: Math.floor(Math.random() * 20),
      bingoSquares: Math.floor(Math.random() * 15),
    })
  }, [friend.id])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              {friend.image ? (
                <img src={friend.image || "/placeholder.svg"} alt={friend.name} className="h-6 w-6 rounded-full" />
              ) : (
                <User className="h-6 w-6 text-green-800" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{friend.name}</h3>
              <p className="text-sm text-gray-500">Friend ID: {friend.friendId}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-800" />
              <span className="text-sm">
                <span className="font-medium">{stats.matches}</span> matches
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-800" />
              <span className="text-sm">
                <span className="font-medium">{stats.birdies}</span> birdies
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-green-800" />
              <span className="text-sm">
                <span className="font-medium">{stats.bingoSquares}</span> bingo squares
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/matches/new?friendId=${friend.id}`}>
              <Button variant="outline" size="sm" className="text-green-800 border-green-800 hover:bg-green-50">
                Challenge
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RequestCard({ request, onAccept, onReject }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Bell className="h-6 w-6 text-amber-800" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{request.user.name}</h3>
              <p className="text-sm text-gray-500">Friend ID: {request.user.friendId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={onReject}
            >
              Reject
            </Button>
            <Button size="sm" className="bg-green-800 hover:bg-green-700" onClick={onAccept}>
              Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
