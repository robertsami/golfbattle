"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ChevronRight, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MatchesPage() {
  const { toast } = useToast()
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`/api/matches?status=${activeTab.toUpperCase()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch matches")
        }

        const data = await response.json()
        setMatches(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load matches",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [toast, activeTab])

  // Format matches for display
  const formattedMatches = matches.map((match) => {
    const isPlayer1 = match.player1.id === match.player1Id
    const opponent = isPlayer1 ? match.player2 : match.player1

    // Calculate scores
    let yourScore = 0
    let opponentScore = 0
    let pendingResults = 0

    match.results.forEach((result) => {
      if (result.status === "ACCEPTED") {
        if (isPlayer1) {
          yourScore += result.player1Score > result.player2Score ? 1 : 0
          opponentScore += result.player2Score > result.player1Score ? 1 : 0
        } else {
          yourScore += result.player2Score > result.player1Score ? 1 : 0
          opponentScore += result.player1Score > result.player2Score ? 1 : 0
        }
      } else if (result.status === "PENDING") {
        pendingResults++
      }
    })

    // Calculate last played date
    const lastPlayed = match.results.length > 0 ? formatTimeAgo(match.results[0].date) : formatTimeAgo(match.createdAt)

    return {
      id: match.id,
      opponent: opponent.name,
      yourScore,
      opponentScore,
      lastPlayed,
      pendingResults,
      status: match.status,
    }
  })

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Matches</h1>
        <Link href="/matches/new">
          <Button className="bg-green-800 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> New Match
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Matches</TabsTrigger>
          <TabsTrigger value="completed">Completed Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Loading matches...</CardContent>
              </Card>
            ) : formattedMatches.length > 0 ? (
              formattedMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No active matches. Start a new match to compete with friends!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Loading matches...</CardContent>
              </Card>
            ) : formattedMatches.length > 0 ? (
              formattedMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">No completed matches yet.</CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MatchCard({ match }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <Link href={`/matches/${match.id}`} className="block p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800">vs. {match.opponent}</h3>
              <p className="text-sm text-gray-500">Last played: {match.lastPlayed}</p>
              {match.pendingResults > 0 && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {match.pendingResults} pending {match.pendingResults === 1 ? "result" : "results"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold">
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
                <span className="mx-1">-</span>
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
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

// Helper function to format dates as "X time ago"
function formatTimeAgo(date) {
  const now = new Date()
  const diffInMs = now.getTime() - new Date(date).getTime()
  const diffInSecs = Math.floor(diffInMs / 1000)
  const diffInMins = Math.floor(diffInSecs / 60)
  const diffInHours = Math.floor(diffInMins / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)

  if (diffInSecs < 60) return "just now"
  if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? "minute" : "minutes"} ago`
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`
  return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
}
