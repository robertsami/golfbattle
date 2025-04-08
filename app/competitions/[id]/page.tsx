"use client"

import { useState } from "react"
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

export default function CompetitionDetailPage({ params }) {
  const competitionId = params.id

  // Mock data for the competition (birdie checklist example)
  const competition = {
    id: competitionId,
    title: "Summer Birdie Challenge",
    type: "birdie-checklist",
    participants: [
      { id: 1, name: "You" },
      { id: 2, name: "John Smith" },
      { id: 3, name: "Mike Johnson" },
      { id: 4, name: "Dave Wilson" },
    ],
    startDate: "June 1, 2023",
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      birdies: [
        { userId: 1, date: i < 7 ? "July 15, 2023" : null, attestedBy: i < 5 ? { id: 2, name: "John Smith" } : null },
        { userId: 2, date: i < 10 ? "July 10, 2023" : null, attestedBy: i < 8 ? { id: 1, name: "You" } : null },
        { userId: 3, date: i < 5 ? "July 5, 2023" : null, attestedBy: i < 3 ? { id: 4, name: "Dave Wilson" } : null },
        { userId: 4, date: i < 3 ? "July 1, 2023" : null, attestedBy: i < 2 ? { id: 3, name: "Mike Johnson" } : null },
      ],
    })),
  }

  const [isAddBirdieOpen, setIsAddBirdieOpen] = useState(false)
  const [selectedHole, setSelectedHole] = useState(null)
  const [attestedBy, setAttestedBy] = useState("")

  const handleOpenAddBirdie = (holeNumber) => {
    setSelectedHole(holeNumber)
    setIsAddBirdieOpen(true)
  }

  const handleAddBirdie = () => {
    // In a real app, this would send the data to the server
    console.log("Adding birdie for hole:", selectedHole, "attested by:", attestedBy)
    setIsAddBirdieOpen(false)
    setSelectedHole(null)
    setAttestedBy("")
  }

  // Calculate progress for each participant
  const participantProgress = competition.participants
    .map((participant) => {
      const completedHoles = competition.holes.filter((hole) =>
        hole.birdies.some((birdie) => birdie.userId === participant.id && birdie.date),
      ).length

      return {
        ...participant,
        completed: completedHoles,
        percentage: (completedHoles / 18) * 100,
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
          Started on {competition.startDate} • {competition.participants.length} participants
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

      <Card>
        <CardHeader>
          <CardTitle>Birdie Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {competition.holes.map((hole) => (
              <div key={hole.number} className="relative">
                <Button
                  variant="outline"
                  className={`w-full h-24 flex flex-col items-center justify-center ${
                    hole.birdies.some((birdie) => birdie.userId === 1 && birdie.date)
                      ? "bg-green-100 border-green-500"
                      : ""
                  }`}
                  onClick={() => handleOpenAddBirdie(hole.number)}
                >
                  <div className="text-lg font-bold mb-1">Hole {hole.number}</div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {hole.birdies.map((birdie, index) =>
                      birdie.date ? (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${birdie.userId === 1 ? "bg-green-600" : "bg-gray-400"}`}
                          title={`${competition.participants.find((p) => p.id === birdie.userId)?.name} - ${birdie.date}`}
                        />
                      ) : null,
                    )}
                  </div>
                </Button>
                {hole.birdies.some((birdie) => birdie.userId === 1 && birdie.date) && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddBirdieOpen} onOpenChange={setIsAddBirdieOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Birdie for Hole {selectedHole}</DialogTitle>
            <DialogDescription>Record your birdie achievement and optionally have someone attest it.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date Achieved</Label>
              <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attestedBy">Attested By (Optional)</Label>
              <Select value={attestedBy} onValueChange={setAttestedBy}>
                <SelectTrigger id="attestedBy">
                  <SelectValue placeholder="Select a friend to attest" />
                </SelectTrigger>
                <SelectContent>
                  {competition.participants
                    .filter((p) => p.id !== 1) // Filter out yourself
                    .map((participant) => (
                      <SelectItem key={participant.id} value={participant.id.toString()}>
                        {participant.name}
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
    </div>
  )
}
