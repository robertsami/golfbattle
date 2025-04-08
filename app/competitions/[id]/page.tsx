"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Competition, Participant, CompetitionHole, Birdie, PageParams } from "@/types"
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


export default function CompetitionDetailPage({ params }: { params: PageParams }) {
  // Use React.use to unwrap the params Promise
  const { id: competitionId } = React.use(params)
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch competition data
  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        setLoading(true)
        const data = await fetch(`/api/competitions/${competitionId}`).then(res => res.json())
        setCompetition(data)
      } catch (err: any) {
        console.error("Error fetching competition:", err)
        setError(err.message || "Failed to load competition")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompetition()
  }, [competitionId])

  const [isAddBirdieOpen, setIsAddBirdieOpen] = useState(false)
  const [selectedHole, setSelectedHole] = useState<number | null>(null)
  const [attestedBy, setAttestedBy] = useState("")

  const handleOpenAddBirdie = (holeNumber: number) => {
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
  const participantProgress = competition?.participants
    ?.map((participant: Participant) => {
      const completedHoles = competition?.holes?.filter((hole: CompetitionHole) =>
        hole.birdies.some((birdie: Birdie) => birdie.userId === participant.id && birdie.date),
      ).length || 0;

      return {
        ...participant,
        completed: completedHoles,
        percentage: (completedHoles / 18) * 100,
      }
    })
    ?.sort((a: Participant & { completed: number }, b: Participant & { completed: number }) => b.completed - a.completed) || []

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/competitions" className="inline-flex items-center text-green-800 hover:text-green-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Competitions
        </Link>
        <h1 className="text-3xl font-bold text-green-800">{competition?.title}</h1>
        <p className="text-gray-600">
          Started on {competition?.startDate} • {competition?.participants?.length} participants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {participantProgress.map((participant: Participant & { completed: number, percentage: number }) => (
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
            {competition?.holes?.map((hole: CompetitionHole) => (
              <div key={hole.number} className="relative">
                <Button
                  variant="outline"
                  className={`w-full h-24 flex flex-col items-center justify-center ${
                    hole.birdies.some((birdie: Birdie) => birdie.userId === 1 && birdie.date)
                      ? "bg-green-100 border-green-500"
                      : ""
                  }`}
                  onClick={() => handleOpenAddBirdie(hole.number)}
                >
                  <div className="text-lg font-bold mb-1">Hole {hole.number}</div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {hole.birdies.map((birdie: Birdie, index: number) =>
                      birdie.date ? (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${birdie.userId === 1 ? "bg-green-600" : "bg-gray-400"}`}
                          title={`${competition?.participants?.find((p: Participant) => p.id === birdie.userId)?.name} - ${birdie.date}`}
                        />
                      ) : null,
                    )}
                  </div>
                </Button>
                {hole.birdies.some((birdie: Birdie) => birdie.userId === 1 && birdie.date) && (
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
                  {competition?.participants
                    .filter((p: Participant) => p.id !== 1) // Filter out yourself
                    .map((participant: Participant) => (
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
