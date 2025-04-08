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
import { competitionAPI } from "@/lib/api/client"
import { useSession } from "next-auth/react"


export default function CompetitionDetailPage({ params }: { params: PageParams }) {
  // Use React.use to unwrap the params Promise
  const { id: competitionId } = React.use(params)
  const { data: session } = useSession()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch competition data
  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        setLoading(true)
        const data = await competitionAPI.getCompetition(competitionId)
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
  
  // Bingo state
  const [isAddBingoSquareOpen, setIsAddBingoSquareOpen] = useState(false)
  const [bingoSquareText, setBingoSquareText] = useState("")
  const [bingoSquarePosition, setBingoSquarePosition] = useState(0)

  const handleOpenAddBirdie = (holeNumber: number) => {
    setSelectedHole(holeNumber)
    setIsAddBirdieOpen(true)
  }

  const handleAddBirdie = async () => {
    if (!selectedHole || !session?.user?.id) {
      alert("You must be logged in to add a birdie");
      return;
    }
    
    try {
      // Get the current user ID from the session
      const userId = session.user.id;
      
      // Get the date from the date input
      const dateInput = document.getElementById('date') as HTMLInputElement;
      const dateValue = dateInput?.value || new Date().toISOString().split('T')[0];
      
      await competitionAPI.addBirdie(competitionId, {
        holeNumber: selectedHole,
        achieverId: userId,
        attesterId: attestedBy ? parseInt(attestedBy) : null,
        date: new Date(dateValue).toISOString()
      });
      
      // Refresh the competition data
      const updatedCompetition = await competitionAPI.getCompetition(competitionId);
      setCompetition(updatedCompetition);
      
      // Close the dialog
      setIsAddBirdieOpen(false);
      setSelectedHole(null);
      setAttestedBy("");
    } catch (error: any) {
      console.error("Error adding birdie:", error);
      alert("Failed to add birdie: " + (error.message || "Please try again."));
    }
  }
  
  const handleOpenAddBingoSquare = () => {
    setIsAddBingoSquareOpen(true);
  }
  
  const handleAddBingoSquare = async () => {
    if (!bingoSquareText || bingoSquarePosition < 0 || bingoSquarePosition > 24) {
      alert("Please enter valid square text and position (0-24)");
      return;
    }
    
    try {
      await competitionAPI.createBingoSquare(competitionId, {
        text: bingoSquareText,
        position: bingoSquarePosition
      });
      
      // Refresh the competition data
      const updatedCompetition = await competitionAPI.getCompetition(competitionId);
      setCompetition(updatedCompetition);
      
      // Close the dialog and reset form
      setIsAddBingoSquareOpen(false);
      setBingoSquareText("");
      setBingoSquarePosition(0);
    } catch (error) {
      console.error("Error adding bingo square:", error);
      alert("Failed to add bingo square. Please try again.");
    }
  }

  // Calculate progress for each participant
  const participantProgress = competition?.participants
    ?.map((participant: Participant) => {
      const completedHoles = competition?.holes?.filter((hole: CompetitionHole) =>
        hole.birdies.some((birdie: Birdie) => birdie.achieverId === participant.userId && birdie.date),
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
          <Card key={participant.userId}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="font-medium mb-2">{participant.user?.name}</div>
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
              <div key={hole.holeNumber} className="relative">
                <Button
                  variant="outline"
                  className={`w-full h-24 flex flex-col items-center justify-center ${
                    hole.birdies.some((birdie: Birdie) => birdie.achieverId === session?.user?.id && birdie.date)
                      ? "bg-green-100 border-green-500"
                      : ""
                  }`}
                  onClick={() => handleOpenAddBirdie(hole.holeNumber)}
                >
                  <div className="text-lg font-bold mb-1">Hole {hole.holeNumber}</div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {hole.birdies.map((birdie: Birdie, index: number) =>
                      birdie.date ? (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${birdie.achieverId === session?.user?.id ? "bg-green-600" : "bg-gray-400"}`}
                          title={`${birdie.achiever?.name || 'Unknown'} - ${new Date(birdie.date).toLocaleDateString()}`}
                        />
                      ) : null,
                    )}
                  </div>
                </Button>
                {hole.birdies.some((birdie: Birdie) => birdie.achieverId === session?.user?.id && birdie.date) && (
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
                    .filter((p: Participant) => p.userId !== session?.user?.id) // Filter out yourself
                    .map((participant: Participant) => (
                      <SelectItem key={participant.userId} value={participant.userId}>
                        {participant.user?.name}
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

      {/* Bingo Square Dialog */}
      <Dialog open={isAddBingoSquareOpen} onOpenChange={setIsAddBingoSquareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bingo Square</DialogTitle>
            <DialogDescription>Create a new square for your bingo card.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bingoText">Square Text</Label>
              <Input 
                id="bingoText" 
                value={bingoSquareText} 
                onChange={(e) => setBingoSquareText(e.target.value)} 
                placeholder="e.g., Hit a 300-yard drive"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bingoPosition">Position (0-24)</Label>
              <Input 
                id="bingoPosition" 
                type="number" 
                min="0" 
                max="24" 
                value={bingoSquarePosition} 
                onChange={(e) => setBingoSquarePosition(parseInt(e.target.value))} 
              />
              <p className="text-sm text-gray-500">Position 0 is top-left, 24 is bottom-right (5x5 grid)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBingoSquareOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-800 hover:bg-green-700" onClick={handleAddBingoSquare}>
              Add Square
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bingo Square Button - Only show for bingo competitions */}
      {competition?.type === 'bingo' && (
        <div className="mt-8">
          <Button 
            className="bg-green-800 hover:bg-green-700"
            onClick={handleOpenAddBingoSquare}
          >
            Add Bingo Square
          </Button>
        </div>
      )}
    </div>
  )
}
