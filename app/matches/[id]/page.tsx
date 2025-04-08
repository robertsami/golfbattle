"use client"

import { useState } from "react"
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
import { ArrowLeft, Plus, Check, X, Clock } from "lucide-react"
import { PageParams, ResultCardProps } from "@/types"

export default function MatchDetailPage({ params }: { params: PageParams }) {
  const matchId = params.id

  // Mock data for the match
  const match = {
    id: matchId,
    opponent: "John Smith",
    yourScore: 3,
    opponentScore: 2,
    status: "active",
    startDate: "June 1, 2023",
    results: [
      {
        id: 1,
        date: "June 1, 2023",
        yourScore: 72,
        opponentScore: 75,
        status: "accepted",
      },
      {
        id: 2,
        date: "June 15, 2023",
        yourScore: 74,
        opponentScore: 71,
        status: "accepted",
      },
      {
        id: 3,
        date: "July 2, 2023",
        yourScore: 70,
        opponentScore: 73,
        status: "accepted",
      },
      {
        id: 4,
        date: "July 20, 2023",
        yourScore: 75,
        opponentScore: 72,
        status: "pending",
        submittedBy: "opponent",
      },
    ],
  }

  const [isAddResultOpen, setIsAddResultOpen] = useState(false)
  const [newResult, setNewResult] = useState({
    date: new Date().toISOString().split("T")[0],
    yourScore: "",
    opponentScore: "",
  })

  const handleAddResult = () => {
    // In a real app, this would send the data to the server
    console.log("Adding new result:", newResult)
    setIsAddResultOpen(false)
    // Reset form
    setNewResult({
      date: new Date().toISOString().split("T")[0],
      yourScore: "",
      opponentScore: "",
    })
  }

  const acceptResult = (resultId: number) => {
    // In a real app, this would send the acceptance to the server
    console.log("Accepting result:", resultId)
  }

  const rejectResult = (resultId: number) => {
    // In a real app, this would send the rejection to the server
    console.log("Rejecting result:", resultId)
  }

  const pendingResults = match.results.filter((result) => result.status === "pending")
  const acceptedResults = match.results.filter((result) => result.status === "accepted")

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/matches" className="inline-flex items-center text-green-800 hover:text-green-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Matches
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">Match vs. {match.opponent}</h1>
          <Button onClick={() => setIsAddResultOpen(true)} className="bg-green-800 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> Add Result
          </Button>
        </div>
        <p className="text-gray-600">Started on {match.startDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Current Score</div>
              <div className="flex justify-center items-center gap-2 text-3xl font-bold">
                <span
                  className={
                    match.yourScore > match.opponentScore
                      ? "text-green-600"
                      : match.yourScore < match.opponentScore
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {match.yourScore}
                </span>
                <span className="text-gray-400">-</span>
                <span
                  className={
                    match.opponentScore > match.yourScore
                      ? "text-green-600"
                      : match.opponentScore < match.yourScore
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {match.opponentScore}
                </span>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium">You</span> vs. <span className="font-medium">{match.opponent}</span>
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
                <span className="text-gray-800">
                  {Math.round(
                    acceptedResults.reduce((sum, result) => sum + result.yourScore, 0) / acceptedResults.length,
                  )}
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-gray-800">
                  {Math.round(
                    acceptedResults.reduce((sum, result) => sum + result.opponentScore, 0) / acceptedResults.length,
                  )}
                </span>
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
                  opponent={match.opponent}
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
                  opponent={match.opponent}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Result</DialogTitle>
            <DialogDescription>Enter the scores for your match with {match.opponent}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date Played</Label>
              <Input
                id="date"
                type="date"
                value={newResult.date}
                onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="yourScore">Your Score</Label>
                <Input
                  id="yourScore"
                  type="number"
                  placeholder="72"
                  value={newResult.yourScore}
                  onChange={(e) => setNewResult({ ...newResult, yourScore: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="opponentScore">Opponent Score</Label>
                <Input
                  id="opponentScore"
                  type="number"
                  placeholder="75"
                  value={newResult.opponentScore}
                  onChange={(e) => setNewResult({ ...newResult, opponentScore: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddResultOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-800 hover:bg-green-700" onClick={handleAddResult}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ResultCard({ result, opponent, onAccept, onReject }: ResultCardProps) {
  return (
    <Card className={result.status === "pending" ? "border-amber-300" : ""}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">{result.date}</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-lg font-medium">
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
                <span className="mx-1 text-gray-400">-</span>
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

              {result.status === "pending" && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                  <Clock className="h-3 w-3 mr-1" /> Pending
                </span>
              )}
            </div>
          </div>

          {result.status === "pending" && result.submittedBy === "opponent" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => onReject(result.id)}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button size="sm" className="bg-green-800 hover:bg-green-700" onClick={() => onAccept(result.id)}>
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </div>
          )}

          {result.status === "pending" && result.submittedBy !== "opponent" && (
            <div className="text-sm text-gray-500">Waiting for {opponent} to accept</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
