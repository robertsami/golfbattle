"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function CompetitionDetailPage({ params }) {
  const competitionId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [competition, setCompetition] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddBirdieOpen, setIsAddBirdieOpen] = useState(false)
  const [isAddBingoOpen, setIsAddBingoOpen] = useState(false)
  const [selectedHole, setSelectedHole] = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [attestedBy, setAttestedBy] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await fetch(`/api/competitions/${competitionId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch competition")
        }

        const data = await response.json()
        setCompetition(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load competition details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompetition()
  }, [competitionId, toast])

  const handleOpenAddBirdie = (holeNumber) => {
    setSelectedHole(holeNumber)
    setIsAddBirdieOpen(true)
  }

  const handleOpenAddBingo = (squareId) => {
    setSelectedSquare(squareId)
    setIsAddBingoOpen(true)
  }

  const handleAddBirdie = async () => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/birdies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          holeNumber: selectedHole,
          date,
          attestedById: attestedBy || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add birdie")
      }

      // Update the competition data
      const updatedCompetition = { ...competition }
      const birdie = await response.json()
      updatedCompetition.birdieEntries.push(birdie)
      setCompetition(updatedCompetition)

      setIsAddBirdieOpen(false)
      setSelectedHole(null)
      setAttestedBy("")

      toast({
        title: "Birdie added",
        description: `Birdie for hole ${selectedHole} has been logged`,
      })

      // Refresh the data
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to add birdie",
        variant: "destructive",
      })
    }
  }

  const handleAddBingo = async () => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/bingo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          squareId: selectedSquare,
          date,
          attestedById: attestedBy || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to mark bingo square")
      }

      // Update the competition data
      const updatedCompetition = { ...competition }
      const entry = await response.json()
      updatedCompetition.bingoEntries.push(entry)
      setCompetition(updatedCompetition)

      setIsAddBingoOpen(false)
      setSelectedSquare(null)
      setAttestedBy("")

      toast({
        title: "Square marked",
        description: "Bingo square has been marked as completed",
      })

      // Refresh the data
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to mark bingo square",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading competition details...</p>
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Competition not found</p>
          <Link href="/competitions" className="text-green-800 hover:underline mt-4 inline-block">
            Back to Competitions
          </Link>
        </div>
      </div>
    )
  }

  // Calculate progress for each participant
  const participantProgress = competition.participants
    .map((participant) => {
      let completedItems = 0
      let total = 0

      if (competition.type === "BIRDIE_CHECKLIST") {
        // Count birdies for this participant
        completedItems = competition.birdieEntries.filter((entry) => entry.userId === participant.userId).length
        total = 18 // 18 holes
      } else if (competition.type === "BINGO") {
        // Count marked squares for this participant
        completedItems = competition.bingoEntries.filter((entry) => entry.userId === participant.userId).length
        total = competition.boardSize ? competition.boardSize * competition.boardSize : 25 // Default to 5x5
      }

      return {
        ...participant.user,
        completed: completedItems,
        percentage: (completedItems / total) * 100,
      }
    })
    .sort((a, b) => b.completed - a.completed)

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/competitions" className="inline-flex items-center text-green-800 hover:text-green-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Competitions
        </Link>
        <h1 className="text-3xl font-bold text-green-800">{competition.title}</h1>
        <p className="text-gray-600">
          Started on {new Date(competition.createdAt).toLocaleDateString()} • {competition.participants.length}{" "}
          participants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {participantProgress.map((participant) => (
          <Card key={participant.id}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="font-medium mb-2">{participant.name}</div>
                <div className="text-3xl font-bold text-green-800 mb-2">{participant.completed}/18</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div className="bg-green-800 h-2 rounded-full" style={{ width: `${participant.percentage}%` }}></div>
                </div>
                <div className="text-sm text-gray-500">{Math.round(participant.percentage)}% complete</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {competition.type === "BIRDIE_CHECKLIST" ? (
        <Card>
          <CardHeader>
            <CardTitle>Birdie Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((holeNumber) => {
                // Check if the current user has a birdie for this hole
                const userBirdie = competition.birdieEntries.find(
                  (entry) => entry.holeNumber === holeNumber && entry.userId === competition.participants[0].userId,
                )

                // Get all birdies for this hole
                const holeBirdies = competition.birdieEntries.filter((entry) => entry.holeNumber === holeNumber)

                return (
                  <div key={holeNumber} className="relative">
                    <Button
                      variant="outline"
                      className={`w-full h-24 flex flex-col items-center justify-center ${
                        userBirdie ? "bg-green-100 border-green-500" : ""
                      }`}
                      onClick={() => handleOpenAddBirdie(holeNumber)}
                      disabled={!!userBirdie} // Disable if user already has a birdie
                    >
                      <div className="text-lg font-bold mb-1">Hole {holeNumber}</div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {holeBirdies.map((birdie, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full ${
                              birdie.userId === competition.participants[0].userId ? "bg-green-600" : "bg-gray-400"
                            }`}
                            title={`${
                              competition.participants.find((p) => p.userId === birdie.userId)?.user.name
                            } - ${new Date(birdie.date).toLocaleDateString()}`}
                          />
                        ))}
                      </div>
                    </Button>
                    {userBirdie && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Bingo Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {competition.bingoSquares.map((square) => {
                // Check if the current user has marked this square
                const userEntry = competition.bingoEntries.find(
                  (entry) => entry.squareId === square.id && entry.userId === competition.participants[0].userId,
                )

                // Get all entries for this square
                const squareEntries = competition.bingoEntries.filter((entry) => entry.squareId === square.id)

                return (
                  <div key={square.id} className="relative">
                    <Button
                      variant="outline"
                      className={`w-full h-24 flex flex-col items-center justify-center text-center p-1 ${
                        userEntry ? "bg-green-100 border-green-500" : ""
                      }`}
                      onClick={() => handleOpenAddBingo(square.id)}
                      disabled={!!userEntry} // Disable if user already marked this square
                    >
                      <div className="text-sm">{square.description}</div>
                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {squareEntries.map((entry, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full ${
                              entry.userId === competition.participants[0].userId ? "bg-green-600" : "bg-gray-400"
                            }`}
                            title={`${
                              competition.participants.find((p) => p.userId === entry.userId)?.user.name
                            } - ${new Date(entry.date).toLocaleDateString()}`}
                          />
                        ))}
                      </div>
                    </Button>
                    {userEntry && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog for adding a birdie */}
      <Dialog open={isAddBirdieOpen} onOpenChange={setIsAddBirdieOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Birdie for Hole {selectedHole}</DialogTitle>
            <DialogDescription>Record your birdie achievement and optionally have someone attest it.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date Achieved</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attestedBy">Attested By (Optional)</Label>
              <Select value={attestedBy} onValueChange={setAttestedBy}>
                <SelectTrigger id="attestedBy">
                  <SelectValue placeholder="Select a friend to attest" />
                </SelectTrigger>
                <SelectContent>
                  {competition.participants
                    .filter((p) => p.userId !== competition.participants[0].userId) // Filter out yourself
                    .map((participant) => (
                      <SelectItem key={participant.userId} value={participant.userId}>
                        {participant.user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Having someone attest adds credibility to your achievement.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBirdieOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-800 hover:bg-green-700" onClick={handleAddBirdie}>
              Log Birdie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for marking a bingo square */}
      <Dialog open={isAddBingoOpen} onOpenChange={setIsAddBingoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Bingo Square</DialogTitle>
            <DialogDescription>Record your achievement and optionally have someone attest it.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date Achieved</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attestedBy">Attested By (Optional)</Label>
              <Select value={attestedBy} onValueChange={setAttestedBy}>
                <SelectTrigger id="attestedBy">
                  <SelectValue placeholder="Select a friend to attest" />
                </SelectTrigger>
                <SelectContent>
                  {competition.participants
                    .filter((p) => p.userId !== competition.participants[0].userId) // Filter out yourself
                    .map((participant) => (
                      <SelectItem key={participant.userId} value={participant.userId}>
                        {participant.user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Having someone attest adds credibility to your achievement.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBingoOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-800 hover:bg-green-700" onClick={handleAddBingo}>
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
