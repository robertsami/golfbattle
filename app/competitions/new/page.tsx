"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckSquare, Grid3X3, X, User, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function NewCompetitionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [competitionType, setCompetitionType] = useState("birdie-checklist")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [boardSize, setBoardSize] = useState("5")
  const [friends, setFriends] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("/api/friends")

        if (!response.ok) {
          throw new Error("Failed to fetch friends")
        }

        const data = await response.json()
        setFriends(data)
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

  const toggleFriendSelection = (friend) => {
    if (selectedFriends.some((f) => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id))
    } else {
      setSelectedFriends([...selectedFriends, friend])
    }
  }

  const handleCreateCompetition = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your competition",
        variant: "destructive",
      })
      return
    }

    if (selectedFriends.length === 0) {
      toast({
        title: "No participants selected",
        description: "Please select at least one friend to participate",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: description.trim() || undefined,
          type: competitionType,
          boardSize: competitionType === "bingo" ? boardSize : undefined,
          participantIds: selectedFriends.map((f) => f.id),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create competition")
      }

      const competition = await response.json()

      toast({
        title: "Competition created",
        description: `${title} has been created successfully`,
      })

      // Redirect to the competition page
      router.push(`/competitions/${competition.id}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create competition",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/competitions" className="inline-flex items-center text-green-800 hover:text-green-700 mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Competitions
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-green-800">Create New Competition</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Competition Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={competitionType} onValueChange={setCompetitionType} className="space-y-4">
                <div
                  className={`flex items-start space-x-3 p-3 rounded-md border ${
                    competitionType === "birdie-checklist" ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="birdie-checklist" id="birdie" />
                  <div className="flex flex-1 items-start space-x-3">
                    <CheckSquare className="h-5 w-5 text-green-800 mt-0.5" />
                    <div>
                      <Label htmlFor="birdie" className="text-base font-medium">
                        Birdie Checklist
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Compete to log birdies on all 18 holes of a course. Track who has achieved birdies on which
                        holes.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-start space-x-3 p-3 rounded-md border ${
                    competitionType === "bingo" ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="bingo" id="bingo" />
                  <div className="flex flex-1 items-start space-x-3">
                    <Grid3X3 className="h-5 w-5 text-green-800 mt-0.5" />
                    <div>
                      <Label htmlFor="bingo" className="text-base font-medium">
                        Bingo Board
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Create a custom bingo board with golf challenges. Mark squares as you complete them.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competition Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Competition Title</Label>
                <Input
                  id="title"
                  placeholder="Summer Birdie Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the rules and goals of your competition..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {competitionType === "bingo" && (
                <div>
                  <Label>Bingo Board Size</Label>
                  <RadioGroup value={boardSize} onValueChange={setBoardSize} className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="3x3" />
                      <Label htmlFor="3x3">3x3</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="4x4" />
                      <Label htmlFor="4x4">4x4</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5" id="5x5" />
                      <Label htmlFor="5x5">5x5</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invite Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Selected Friends ({selectedFriends.length})</Label>
                <div className="mt-2 min-h-10">
                  {selectedFriends.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full"
                        >
                          <span>{friend.name}</span>
                          <button
                            onClick={() => toggleFriendSelection(friend)}
                            className="text-green-800 hover:text-green-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No friends selected yet. Select friends below to invite them.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {isLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading friends...</div>
                ) : friends.length > 0 ? (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`p-2 rounded-md cursor-pointer transition-colors flex items-center justify-between ${
                        selectedFriends.some((f) => f.id === friend.id)
                          ? "bg-green-100 border border-green-300"
                          : "hover:bg-gray-100 border border-transparent"
                      }`}
                      onClick={() => toggleFriendSelection(friend)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{friend.name}</div>
                          <div className="text-xs text-gray-500">Friend ID: {friend.friendId}</div>
                        </div>
                      </div>
                      {selectedFriends.some((f) => f.id === friend.id) && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No friends found. Add some friends first to create a competition.
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  className="w-full bg-green-800 hover:bg-green-700"
                  onClick={handleCreateCompetition}
                  disabled={isSubmitting || selectedFriends.length === 0 || !title.trim()}
                >
                  {isSubmitting ? "Creating..." : "Create Competition"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
