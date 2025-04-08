"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, User, Trophy, CheckSquare, Grid3X3, Loader2 } from "lucide-react"
import { Friend } from "@/types"
import { useSession } from "next-auth/react"
import { userAPI } from "@/lib/api/client"

export default function FriendsPage() {
  const { data: session } = useSession()
  const [friends, setFriends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true)
        const userId = session?.user?.id
        
        if (!userId) {
          // If not logged in, we'll show empty state
          setFriends([])
          return
        }
        
        const data = await userAPI.getUserFriends(userId)
        setFriends(data)
      } catch (err: any) {
        console.error("Error fetching friends:", err)
        setError(err.message || "Failed to load friends")
      } finally {
        setLoading(false)
      }
    }
    
    fetchFriends()
  }, [session?.user?.id])

  // Filter friends by search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    friend.friendId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Friends</h1>
          <Link href="/friends/add">
            <Button className="bg-green-800 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" /> Add Friend
            </Button>
          </Link>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-800" />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Friends</h1>
          <Link href="/friends/add">
            <Button className="bg-green-800 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" /> Add Friend
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            Error loading friends: {error}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Friends</h1>
        <Link href="/friends/add">
          <Button className="bg-green-800 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" /> Add Friend
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search friends..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredFriends.length > 0 ? (
        <div className="space-y-4">
          {filteredFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {friends.length === 0
              ? "You don't have any friends yet. Add some to get started!"
              : "No friends match your search."}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FriendCard({ friend }: { friend: any }) {
  // Calculate stats
  const matchesCount = friend.matchesAsPlayer1?.length || 0 + friend.matchesAsPlayer2?.length || 0;
  const birdiesCount = friend.birdies?.length || 0;
  const bingoSquaresCount = friend.bingoSquares?.filter((square: any) => square.completed)?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              {friend.image ? (
                <img src={friend.image} alt={friend.name} className="h-10 w-10 rounded-full" />
              ) : (
                <User className="h-6 w-6 text-green-800" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{friend.name}</h3>
              <p className="text-sm text-gray-500">@{friend.friendId}</p>
            </div>
          </div>

          <Link href={`/friends/${friend.id}`}>
            <Button variant="outline" size="sm" className="text-green-800">
              View Profile
            </Button>
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1 text-green-800">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">{matchesCount}</span>
            </div>
            <p className="text-xs text-gray-500">Matches</p>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1 text-green-800">
              <CheckSquare className="h-4 w-4" />
              <span className="font-medium">{birdiesCount}</span>
            </div>
            <p className="text-xs text-gray-500">Birdies</p>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-1 text-green-800">
              <Grid3X3 className="h-4 w-4" />
              <span className="font-medium">{bingoSquaresCount}</span>
            </div>
            <p className="text-xs text-gray-500">Bingo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}