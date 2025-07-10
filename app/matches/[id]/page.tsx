"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ArrowLeft, Plus, Check, X, Clock, User, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function MatchDetailPage({ params }) {
  const matchId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [match, setMatch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddResultOpen, setIsAddResultOpen] = useState(false)
  const [newResult, setNewResult] = useState({
    date: new Date().toISOString().split("T")[0],
    yourScore: "",
    opponentScore: "",
  })

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`/api/matches/${matchId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch match")
        }

        const data = await response.json()
        setMatch(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load match details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatch()
  }, [matchId, toast])

  const handleAddResult = async () => {
    if (!newResult.yourScore || !newResult.opponentScore || !newResult.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Determine if the current user is player1 or player2
      const isPlayer1 = match.player1.id === match.player1Id

      // Map the scores correctly based on who is submitting
      const player1Score = isPlayer1 ? newResult.yourScore : newResult.opponentScore
      const player2Score = isPlayer1 ? newResult.opponentScore : newResult.yourScore

      const response = await fetch(`/api/matches/${matchId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1Score,
          player2Score,
          date: newResult.date,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add result")
      }

      const result = await response.json()

      // Update the match with the new result
      setMatch({
        ...match,
        results: [result, ...match.results],
      })

      setIsAddResultOpen(false)

      // Reset form
      setNewResult({
        date: new Date().toISOString().split("T")[0],
        yourScore: "",
        opponentScore: "",
      })

      toast({
        title: "Result added",
        description: "Your match result has been submitted",
      })

      // Refresh the data
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to add result",
        variant: "destructive",
      })
    }
  }

  const acceptResult = async (resultId) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/results/${resultId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "accept",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept result")
      }

      // Update the result status in the UI
      setMatch({
        ...match,
        results: match.results.map((result) => (result.id === resultId ? { ...result, status: "ACCEPTED" } : result)),
      })

      toast({
        title: "Result accepted",
        description: "The match result has been accepted",
      })

      // Refresh the data
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to accept result",
        variant: "destructive",
      })
    }
  }

  const rejectResult = async (resultId) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/results/${resultId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reject",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject result")
      }

      // Update the result status in the UI
      setMatch({
        ...match,
        results: match.results.map((result) => (result.id === resultId ? { ...result, status: "REJECTED" } : result)),
      })

      toast({
        title: "Result rejected",
        description: "The match result has been rejected",
      })

      // Refresh the data
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to reject result",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading match details...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Match not found</p>
          <Link href="/matches" className="text-green-800 hover:underline mt-4 inline-block">
            Back to Matches
          </Link>
        </div>
      </div>
    )
  }

  // Determine if the current user is player1 or player2
  const isPlayer1 = match.player1.id === match.player1Id
  const opponent = isPlayer1 ? match.player2 : match.player1

  // Calculate scores
  let yourScore = 0
  let opponentScore = 0

  const acceptedResults = match.results.filter((result) => result.status === "ACCEPTED")
  const pendingResults = match.results.filter((result) => result.status === "PENDING")

  acceptedResults.forEach((result) => {
    if (isPlayer1) {
      yourScore += result.player1Score > result.player2Score ? 1 : 0
      opponentScore += result.player2Score > result.player1Score ? 1 : 0
    } else {
      yourScore += result.player2Score > result.player1Score ? 1 : 0
      opponentScore += result.player1Score > result.player2Score ? 1 : 0
    }
  })

  // Calculate average scores
  const yourAvgScore =
    acceptedResults.length > 0
      ? Math.round(
          acceptedResults.reduce((sum, result) => sum + (isPlayer1 ? result.player1Score : result.player2Score), 0) /
            acceptedResults.length,
        )
      : 0

  const opponentAvgScore =
    acceptedResults.length > 0
      ? Math.round(
          acceptedResults.reduce((sum, result) => sum + (isPlayer1 ? result.player2Score : result.player1Score), 0) /
            acceptedResults.length,
        )
      : 0

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/matches" className="inline-flex items-center text-green-800 hover:text-green-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Matches
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">Match vs. {opponent.name}</h1>
          <Button onClick={() => setIsAddResultOpen(true)} className="bg-green-800 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> Add Result
          </Button>
        </div>
        <p className="text-gray-600">Started on {new Date(match.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Current Score</div>
              <div className="flex justify-center items-center gap-2 text-3xl font-bold">
                <span
                  className={
                    yourScore > opponentScore
                      ? "text-green-600"
                      : yourScore < opponentScore
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {yourScore}
                </span>
                <span className="text-gray-400">-</span>
                <span
                  className={
                    opponentScore > yourScore
                      ? "text-green-600"
                      : opponentScore < yourScore
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {opponentScore}
                </span>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium">You</span> vs. <span className="font-medium">{opponent.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Total Results</div>
              <div className="text-3xl font-bold text-gray-800">{match.results.length}</div>
              <div className="mt-2 text-sm text-gray-600">
                {acceptedResults.length} accepted, {pendingResults.length} pending
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Average Score</div>
              <div className="flex justify-center items-center gap-2 text-3xl font-bold">
                <span className="text-gray-800">{yourAvgScore || "-"}</span>
                <span className="text-gray-400">-</span>
                <span className="text-gray-800">{opponentAvgScore || "-"}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">Your average vs. Opponent average</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {match.results.length > 0 ? (
              match.results.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  opponent={opponent}
                  isPlayer1={isPlayer1}
                  onAccept={acceptResult}
                  onReject={rejectResult}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No results yet. Add your first result to get started!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingResults.length > 0 ? (
              pendingResults.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  opponent={opponent}
                  isPlayer1={isPlayer1}
                  onAccept={acceptResult}
                  onReject={rejectResult}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">No pending results to review.</CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddResultOpen} onOpenChange={setIsAddResultOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Match Result</DialogTitle>
            <DialogDescription>
              Enter the golf scores from your round with {opponent.name}. Lower scores are better in golf.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date Played</Label>
              <Input
                id="date"
                type="date"
                value={newResult.date}
                onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Golf Scores (Strokes)</div>

              {/* Your Score */}
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <Label htmlFor="yourScore" className="font-medium text-green-700">
                    Your Score
                  </Label>
                </div>
                <Input
                  id="yourScore"
                  type="number"
                  placeholder="e.g., 72"
                  value={newResult.yourScore}
                  onChange={(e) => setNewResult({ ...newResult, yourScore: e.target.value })}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">Enter your total strokes for the round</p>
              </div>

              {/* Opponent Score */}
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <Label htmlFor="opponentScore" className="font-medium text-blue-700">
                    {opponent.name}'s Score
                  </Label>
                </div>
                <Input
                  id="opponentScore"
                  type="number"
                  placeholder="e.g., 75"
                  value={newResult.opponentScore}
                  onChange={(e) => setNewResult({ ...newResult, opponentScore: e.target.value })}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">Enter {opponent.name}'s total strokes for the round</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Remember:</strong> In golf, the lowest score wins. Both players will need to accept this result
                before it counts toward your match score.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddResultOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-800 hover:bg-green-700" onClick={handleAddResult}>
              Submit Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ResultCard({ result, opponent, isPlayer1, onAccept, onReject }) {
  // Determine if the current user submitted this result
  const isSubmitter = result.submitter.id === (isPlayer1 ? result.match.player1Id : result.match.player2Id)

  // Format the scores based on who is viewing
  const yourScore = isPlayer1 ? result.player1Score : result.player2Score
  const opponentScore = isPlayer1 ? result.player2Score : result.player1Score

  return (
    <Card className={result.status === "PENDING" ? "border-amber-300" : ""}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">{new Date(result.date).toLocaleDateString()}</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-lg font-medium">
                <span
                  className={
                    yourScore < opponentScore
                      ? "text-green-600"
                      : yourScore > opponentScore
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {yourScore}
                </span>
                <span className="mx-1 text-gray-400">-</span>
                <span
                  className={
                    opponentScore < yourScore
                      ? "text-green-600"
                      : opponentScore > yourScore
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {opponentScore}
                </span>
              </div>

              {result.status === "PENDING" && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                  <Clock className="h-3 w-3 mr-1" /> Pending
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Submitted by: {result.submitter.name}
              {yourScore < opponentScore && <span className="ml-2 text-green-600 font-medium">You won!</span>}
              {yourScore > opponentScore && <span className="ml-2 text-red-600 font-medium">{opponent.name} won</span>}
              {yourScore === opponentScore && <span className="ml-2 text-gray-600 font-medium">Tie</span>}
            </div>
          </div>

          {result.status === "PENDING" && !isSubmitter && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => onReject(result.id)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button size="sm" className="bg-green-800 hover:bg-green-700" onClick={() => onAccept(result.id)}>
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </div>
          )}

          {result.status === "PENDING" && isSubmitter && (
            <div className="text-sm text-gray-500">Waiting for {opponent.name} to accept</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
