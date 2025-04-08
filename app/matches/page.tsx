"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ChevronRight, Loader2 } from "lucide-react"
import { Match } from "@/types"
import { useSession } from "next-auth/react"
import { matchAPI } from "@/lib/api/client"
import { formatDate } from "@/lib/utils"

export default function MatchesPage() {
  const { data: session } = useSession()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        const userId = session?.user?.id
        
        if (!userId) {
          // If not logged in, we'll show empty state
          setMatches([])
          return
        }
        
        const data = await matchAPI.getMatches(userId)
        setMatches(data)
      } catch (err: any) {
        console.error("Error fetching matches:", err)
        setError(err.message || "Failed to load matches")
      } finally {
        setLoading(false)
      }
    }
    
    fetchMatches()
  }, [session?.user?.id])

  // Filter matches by status
  const activeMatches = matches.filter((match) => match.status === "active")
  const completedMatches = matches.filter((match) => match.status === "completed")

  // Show loading state
  if (loading) {
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Matches</h1>
          <Link href="/matches/new">
            <Button className="bg-green-800 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" /> New Match
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            Error loading matches: {error}
          </CardContent>
        </Card>
      </div>
    )
  }

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

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Active Matches</h2>
        {activeMatches.length > 0 ? (
          <div className="space-y-4">
            {activeMatches.map((match) => (
              <MatchCard key={match.id} match={match} currentUserId={session?.user?.id} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No active matches. Start a new match to compete with friends!
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Completed Matches</h2>
        {completedMatches.length > 0 ? (
          <div className="space-y-4">
            {completedMatches.map((match) => (
              <MatchCard key={match.id} match={match} currentUserId={session?.user?.id} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">No completed matches yet.</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

interface MatchCardProps {
  match: any;
  currentUserId?: string;
}

function MatchCard({ match, currentUserId }: MatchCardProps) {
  // Determine if the current user is player1 or player2
  const isPlayer1 = match.player1Id === currentUserId;
  
  // Get the opponent's name
  const opponentName = isPlayer1 ? match.player2?.name : match.player1?.name;
  
  // Get the scores (from the perspective of the current user)
  const yourScore = isPlayer1 ? match.player1Score : match.player2Score;
  const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
  
  // Count pending results
  const pendingResults = match.results?.filter((r: any) => r.status === 'pending').length || 0;
  
  // Format the last played date
  const lastPlayed = formatDate(match.updatedAt || match.startDate);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <Link href={`/matches/${match.id}`} className="block p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-800">vs. {opponentName || 'Opponent'}</h3>
              <p className="text-sm text-gray-500">Last played: {lastPlayed}</p>
              {pendingResults > 0 && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                    {pendingResults} pending {pendingResults === 1 ? "result" : "results"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold">
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
                <span className="mx-1">-</span>
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
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}