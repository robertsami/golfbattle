"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckSquare, Grid3X3, X, User, Check, Loader2 } from "lucide-react"
import { Friend } from "@/types"
import { useSession } from "next-auth/react"
import { userAPI, competitionAPI } from "@/lib/api/client"

export default function NewCompetitionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [competitionType, setCompetitionType] = useState<string>("birdie-checklist")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])
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

  const toggleFriendSelection = (friend: any) => {
    if (selectedFriends.some((f) => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id))
    } else {
      setSelectedFriends([...selectedFriends, friend])
    }
  }

  const handleCreateCompetition = async () => {
    if (!title || !session?.user?.id) return
    
    try {
      setCreating(true)
      
      // Create the competition
      const newCompetition = await competitionAPI.createCompetition({
        title,
        description,
        type: competitionType,
        creatorId: session.user.id,
        startDate: new Date().toISOString(),
        status: 'active',
        participantIds: [
          session.user.id, // Include the current user
          ...selectedFriends.map(f => f.id.toString()) // Include selected friends
        ]
      })
      
      // Redirect to the new competition page
      router.push(`/competitions/${newCompetition.id}`)
    } catch (err: any) {
      console.error("Error creating competition:", err)
      alert("Failed to create competition: " + (err.message || "Unknown error"))
      setCreating(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center mb-8">
          <Link href="/competitions">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-green-800">New Competition</h1>
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
        <Link href="/competitions">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-green-800">New Competition</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Competition Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={competitionType}
                onValueChange={setCompetitionType}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="birdie-checklist" id="birdie" />
                  <Label
                    htmlFor="birdie"
                    className="flex items-center cursor-pointer"
                  >
                    <CheckSquare className="h-5 w-5 mr-2 text-green-800" />
                    <div>
                      <div className="font-medium">Birdie Checklist</div>
                      <div className="text-sm text-gray-500">
                        Track birdies on each hole of a course
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bingo" id="bingo" />
                  <Label
                    htmlFor="bingo"
                    className="flex items-center cursor-pointer"
                  >
                    <Grid3X3 className="h-5 w-5 mr-2 text-green-800" />
                    <div>
                      <div className="font-medium">Bingo Board</div>
                      <div className="text-sm text-gray-500">
                        Complete golf challenges in a bingo format
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competition Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Summer Birdie Challenge" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Add details about your competition..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invite Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center text-red-500 p-4">
                  Error loading friends: {error}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  You don't have any friends yet. Add some to invite to your competition!
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleFriendSelection(friend)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-green-800" />
                          </div>
                          <div>
                            <h3 className="font-medium">{friend.name}</h3>
                            <p className="text-sm text-gray-500">@{friend.friendId}</p>
                          </div>
                        </div>
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            selectedFriends.some((f) => f.id === friend.id)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {selectedFriends.some((f) => f.id === friend.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              className="bg-green-800 hover:bg-green-700"
              onClick={handleCreateCompetition}
              disabled={!title || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Competition"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}