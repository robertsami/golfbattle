"use client"

import React, { useState, useEffect } from "react"
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
import { ArrowLeft, Plus, Check, X, Clock, Loader2 } from "lucide-react"
import { PageParams, ResultCardProps, Match, MatchResult } from "@/types"
import { useSession } from "next-auth/react"
import { matchAPI } from "@/lib/api/client"
import { formatDate } from "@/lib/utils"

export default function MatchDetailPage({ params }: { params: PageParams }) {
  const { data: session } = useSession()
  // Use React.use to unwrap the params Promise
  const { id: matchId } = React.use(params)
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddResultOpen, setIsAddResultOpen] = useState<boolean>(false)
  const [newResult, setNewResult] = useState<{
    yourScore: string;
    opponentScore: string;
    date: string;
  }>({
    yourScore: "",
    opponentScore: "",
    date: new Date().toISOString().split('T')[0]
  })

  // Fetch match data
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true)
        const data = await matchAPI.getMatch(matchId)
        setMatch(data)
      } catch (err: any) {
        console.error("Error fetching match:", err)
        setError(err.message || "Failed to load match")
      } finally {
        setLoading(false)
      }
    }
    
    fetchMatch()
  }, [matchId])

  const handleAddResult = async () => {
    // In a real app, this would submit to the API
    setIsAddResultOpen(false)
    
    try {
      await matchAPI.addMatchResult(matchId, {
        player1Score: parseInt(newResult.yourScore),
        player2Score: parseInt(newResult.opponentScore),
        submitterId: session?.user?.id,
        date: new Date(newResult.date).toISOString(),
      })
      
      // Refresh match data
      const updatedMatch = await matchAPI.getMatch(matchId)
      setMatch(updatedMatch)
      
      // Reset form
      setNewResult({
        yourScore: "",
        opponentScore: "",
        date: new Date().toISOString().split('T')[0]
      })
    } catch (err: any) {
      console.error("Error adding result:", err)
      // Show error message to user
      alert("Failed to add result: " + (err.message || "Unknown error"))
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
          <h1 className="text-3xl font-bold text-green-800">Match Details</h1>
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
        <div className="flex items-center mb-8">
          <Link href="/matches">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-green-800">Match Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            Error loading match: {error}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center mb-8">
          <Link href="/matches">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-green-800">Match Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Match not found
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine if the current user is player1 or player2
  const currentUserId = session?.user?.id
  const isPlayer1 = match.player1Id === currentUserId
  
  // Get the opponent's name
  const opponentName = isPlayer1 ? match.player2?.name : match.player1?.name
  
  // Get the scores (from the perspective of the current user)
  const yourScore = isPlayer1 ? match.player1Score : match.player2Score
  const opponentScore = isPlayer1 ? match.player2Score : match.player1Score
  
  // Format the start date
  const startDate = formatDate(match.startDate)
  
  // Process results
  const results = match.results?.map((result: any) => ({
    id: result.id,
    date: formatDate(result.date),
    yourScore: isPlayer1 ? result.player1Score : result.player2Score,
    opponentScore: isPlayer1 ? result.player2Score : result.player1Score,
    status: result.status,
    submittedBy: result.submitter?.name || 'Unknown',
  })) || []

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center mb-8">
        <Link href="/matches">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-green-800">Match Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">vs. {opponentName || 'Opponent'}</h2>
                  <p className="text-gray-500">Started {startDate}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    <span
                      className={
                        (yourScore || 0) > (opponentScore || 0)
                          ? "text-green-600"
                          : (yourScore || 0) < (opponentScore || 0)
                            ? "text-red-600"
                            : "text-gray-600"
                      }
                    >
                      {yourScore}
                    </span>
                    <span className="mx-2">-</span>
                    <span
                      className={
                        (opponentScore || 0) > (yourScore || 0)
                          ? "text-green-600"
                          : (opponentScore || 0) < (yourScore || 0)
                            ? "text-red-600"
                            : "text-gray-600"
                      }
                    >
                      {opponentScore}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Current Score</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-green-800 hover:bg-green-700"
                  onClick={() => setIsAddResultOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Result
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="results">
            <TabsList className="mb-6">
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Match Results</h2>
              {results.filter((r: MatchResult) => r.status === 'accepted').length > 0 ? (
                <div className="space-y-4">
                  {results
                    .filter((r: MatchResult) => r.status === 'accepted')
                    .map((result: MatchResult) => (
                      <ResultCard key={result.id} result={result} />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No results yet. Add your first result!
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Match Info</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{match.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Players</p>
                  <p className="font-medium">You vs. {opponentName || 'Opponent'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Results</p>
                  <p className="font-medium">{results.filter((r: MatchResult) => r.status === 'accepted').length} submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddResultOpen} onOpenChange={setIsAddResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Match Result</DialogTitle>
            <DialogDescription>
              Enter the scores for your match with {opponentName || 'your opponent'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="matchDate">Date</Label>
                <Input
                  id="matchDate"
                  type="date"
                  value={newResult.date}
                  onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yourScore">Your Score</Label>
                  <Input
                    id="yourScore"
                    type="number"
                    value={newResult.yourScore}
                    onChange={(e) => setNewResult({ ...newResult, yourScore: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="opponentScore">{opponentName || 'Opponent'}'s Score</Label>
                  <Input
                    id="opponentScore"
                    type="number"
                    value={newResult.opponentScore}
                    onChange={(e) => setNewResult({ ...newResult, opponentScore: e.target.value })}
                  />
                </div>
              </div>
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

function ResultCard({ result }: ResultCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{new Date(result.date).toLocaleDateString()}</p>
            <p className="text-xs text-gray-400">Submitted by {result.submitter?.name || 'Unknown'}</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">
              <span
                className={
                  result.yourScore < result.opponentScore
                    ? "text-green-600"
                    : result.yourScore > result.opponentScore
                      ? "text-red-600"
                      : "text-gray-600"
                }
              >
                {result.yourScore}
              </span>
              <span className="mx-1">-</span>
              <span
                className={
                  result.opponentScore < result.yourScore
                    ? "text-green-600"
                    : result.opponentScore > result.yourScore
                      ? "text-red-600"
                      : "text-gray-600"
                }
              >
                {result.opponentScore}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PendingResultCard({ result }: { result: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-medium">Pending Approval</p>
            </div>
            <p className="text-sm text-gray-500">{result.date}</p>
            <p className="text-xs text-gray-400">Submitted by {result.submittedBy}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold">
              {result.yourScore} - {result.opponentScore}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full text-green-600">
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full text-red-600">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}