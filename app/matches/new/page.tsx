"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, UserPlus, Loader2 } from "lucide-react"
import { Friend } from "@/types"
import { useSession } from "next-auth/react"
import { userAPI, matchAPI } from "@/lib/api/client"

export default function NewMatchPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState<boolean>(false)

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

  const filteredFriends = searchTerm
    ? friends.filter(
        (friend) =>
          friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          friend.friendId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : friends

  const handleCreateMatch = async () => {
    if (!selectedFriend || !session?.user?.id) return
    
    try {
      setCreating(true)
      
      const newMatch = await matchAPI.createMatch({
        player1Id: session.user.id,
        player2Id: selectedFriend.id,
        title: `Match: ${session.user.name} vs ${selectedFriend.name}`,
        startDate: new Date().toISOString(),
        status: 'active',
      })
      
      // Redirect to the new match page
      router.push(`/matches/${newMatch.id}`)
    } catch (err: any) {
      console.error("Error creating match:", err)
      alert("Failed to create match: " + (err.message || "Unknown error"))
      setCreating(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center mb-8">
          <Link href="/matches">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-green-800">New Match</h1>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center mb-8">
        <Link href="/matches">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-green-800">New Match</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Select Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search friends..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {error ? (
                <div className="text-center text-red-500 p-4">
                  Error loading friends: {error}
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  {friends.length === 0
                    ? "You don't have any friends yet. Add some to start a match!"
                    : "No friends match your search."}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedFriend?.id === friend.id
                          ? "bg-green-100 border border-green-300"
                          : "hover:bg-gray-100 border border-transparent"
                      }`}
                      onClick={() => setSelectedFriend(friend)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <UserPlus className="h-5 w-5 text-green-800" />
                          </div>
                          <div>
                            <h3 className="font-medium">{friend.name}</h3>
                            <p className="text-sm text-gray-500">@{friend.friendId}</p>
                          </div>
                        </div>
                        {selectedFriend?.id === friend.id && (
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFriend ? (
                <div>
                  <div className="mb-6">
                    <Label htmlFor="opponent">Opponent</Label>
                    <div className="p-3 bg-gray-50 rounded-md mt-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <UserPlus className="h-5 w-5 text-green-800" />
                        </div>
                        <div>
                          <h3 className="font-medium">{selectedFriend.name}</h3>
                          <p className="text-sm text-gray-500">@{selectedFriend.friendId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-green-800 hover:bg-green-700"
                    onClick={handleCreateMatch}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Match"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Select an opponent to continue
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}