"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Friend {
  id: string
  name: string
  friendId: string
}

export default function NewMatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [matchName, setMatchName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If the user was deep-linked with ?friendId=<id>, pre-select that friend
  const friendIdFromUrl = searchParams.get("friendId")

  /* ------------------------------------------------------------------
   * Load friends list
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch("/api/friends")
        if (!res.ok) throw new Error("Failed to fetch friends")
        const data: Friend[] = await res.json()

        setFriends(data)
        setFilteredFriends(data)

        if (friendIdFromUrl) {
          const preselected = data.find((f) => f.id === friendIdFromUrl)
          if (preselected) setSelectedFriend(preselected)
        }
      } catch (err) {
        console.error(err)
        toast({
          title: "Error",
          description: "Failed to load friends list",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFriends()
  }, [toast, friendIdFromUrl])

  /* ------------------------------------------------------------------
   * Client-side search filter
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFriends(friends)
      return
    }
    const term = searchTerm.toLowerCase()
    setFilteredFriends(
      friends.filter((f) => f.name.toLowerCase().includes(term) || f.friendId.toLowerCase().includes(term)),
    )
  }, [searchTerm, friends])

  /* ------------------------------------------------------------------
   * Submit new match
   * ---------------------------------------------------------------- */
  const handleCreateMatch = async () => {
    if (!selectedFriend) {
      toast({
        title: "No opponent selected",
        description: "Please choose a friend to create a match with.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player2Id: selectedFriend.id,
          name: matchName.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed to create match")
      const match = await res.json()

      toast({
        title: "Match created",
        description: `Match with ${selectedFriend.name} created successfully.`,
      })

      router.push(`/matches/${match.id}`)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Unable to create match",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ------------------------------------------------------------------ */

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/matches" className="mb-4 inline-flex items-center text-green-800 hover:text-green-700">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Matches
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-green-800">Create New Match</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* -------------------------------------------------------------
         * Friend selector
         * ----------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Select Opponent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-8"
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {isLoading ? (
                <p className="py-4 text-center text-gray-500">Loading friends...</p>
              ) : filteredFriends.length ? (
                filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full rounded-md p-3 text-left transition-colors ${
                      selectedFriend?.id === friend.id
                        ? "border border-green-300 bg-green-100"
                        : "border border-transparent hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-medium">{friend.name}</span>
                    <span className="block text-sm text-gray-500">Friend ID: {friend.friendId}</span>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-gray-500">
                  {searchTerm ? `No friends match “${searchTerm}”` : "No friends found"}
                </p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Link href="/friends/add">
                <Button variant="outline" className="border-green-800 text-green-800 hover:bg-green-50 bg-transparent">
                  <UserPlus className="mr-2 h-4 w-4" /> Add New Friend
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* -------------------------------------------------------------
         * Match details + submit
         * ----------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFriend ? (
              <>
                <div className="mb-6">
                  <Label className="text-base">Selected Opponent</Label>
                  <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-3">
                    <p className="font-medium">{selectedFriend.name}</p>
                    <p className="text-sm text-gray-500">Friend ID: {selectedFriend.friendId}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="matchName" className="text-base">
                    Match Name (optional)
                  </Label>
                  <Input
                    id="matchName"
                    className="mt-2"
                    placeholder="Summer 2025 Match"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave blank to use “Match vs. {selectedFriend.name}”</p>
                </div>

                <Button
                  disabled={isSubmitting}
                  onClick={handleCreateMatch}
                  className="w-full bg-green-800 hover:bg-green-700"
                >
                  {isSubmitting ? "Creating…" : "Create Match"}
                </Button>
              </>
            ) : (
              <p className="py-8 text-center text-gray-500">Select an opponent from the list to continue</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
