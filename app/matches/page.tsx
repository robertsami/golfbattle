import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ChevronRight } from "lucide-react"

export default function MatchesPage() {
  // Mock data for matches
  const matches = [
    {
      id: 1,
      opponent: "John Smith",
      yourScore: 3,
      opponentScore: 2,
      status: "active",
      lastPlayed: "2 days ago",
      pendingResults: 1,
    },
    {
      id: 2,
      opponent: "Mike Johnson",
      yourScore: 1,
      opponentScore: 4,
      status: "active",
      lastPlayed: "1 week ago",
      pendingResults: 0,
    },
    {
      id: 3,
      opponent: "Dave Wilson",
      yourScore: 2,
      opponentScore: 2,
      status: "active",
      lastPlayed: "3 days ago",
      pendingResults: 2,
    },
    {
      id: 4,
      opponent: "Robert Brown",
      yourScore: 5,
      opponentScore: 3,
      status: "completed",
      lastPlayed: "2 weeks ago",
      pendingResults: 0,
    },
    {
      id: 5,
      opponent: "James Davis",
      yourScore: 2,
      opponentScore: 5,
      status: "completed",
      lastPlayed: "1 month ago",
      pendingResults: 0,
    },
  ]

  const activeMatches = matches.filter((match) => match.status === "active")
  const completedMatches = matches.filter((match) => match.status === "completed")

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
              <MatchCard key={match.id} match={match} />
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
              <MatchCard key={match.id} match={match} />
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
