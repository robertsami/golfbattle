import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckSquare, Grid3X3, Plus } from "lucide-react"
import { StatsCardProps, DashboardMatchCardProps, CompetitionCardProps } from "@/types"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-green-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard title="Active Matches" value="3" />
        <StatsCard title="Friends" value="12" />
        <StatsCard title="Birdies Logged" value="24" />
        <StatsCard title="Bingo Boards" value="2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800">Active Matches</h2>
            <Link href="/matches/new">
              <Button size="sm" className="bg-green-800 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" /> New Match
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <MatchCard opponent="John Smith" yourScore={3} opponentScore={2} lastPlayed="2 days ago" />
            <MatchCard opponent="Mike Johnson" yourScore={1} opponentScore={4} lastPlayed="1 week ago" />
            <MatchCard opponent="Dave Wilson" yourScore={2} opponentScore={2} lastPlayed="3 days ago" />
          </div>

          <div className="mt-4 text-center">
            <Link href="/matches">
              <Button variant="outline" className="text-green-800 border-green-800 hover:bg-green-50">
                View All Matches
              </Button>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800">Competitions</h2>
            <Link href="/competitions/new">
              <Button size="sm" className="bg-green-800 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" /> New Competition
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <CompetitionCard
              title="Summer Birdie Challenge"
              type="birdie-checklist"
              participants={4}
              progress={7}
              total={18}
            />
            <CompetitionCard title="Golf Skills Bingo" type="bingo" participants={6} progress={12} total={25} />
          </div>

          <div className="mt-4 text-center">
            <Link href="/competitions">
              <Button variant="outline" className="text-green-800 border-green-800 hover:bg-green-50">
                View All Competitions
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-4xl font-bold text-green-800 mb-2">{value}</div>
        <div className="text-gray-600">{title}</div>
      </CardContent>
    </Card>
  )
}

function MatchCard({ opponent, yourScore, opponentScore, lastPlayed }: DashboardMatchCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">vs. {opponent}</h3>
            <p className="text-sm text-gray-500">Last played: {lastPlayed}</p>
          </div>
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
        </div>
      </CardContent>
    </Card>
  )
}

function CompetitionCard({ title, type, participants, progress, total }: CompetitionCardProps) {
  const icon =
    type === "birdie-checklist" ? (
      <CheckSquare className="h-5 w-5 text-green-800" />
    ) : (
      <Grid3X3 className="h-5 w-5 text-green-800" />
    )

  const progressPercentage = progress !== undefined && total !== undefined ? (progress / total) * 100 : 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500">{typeof participants === 'number' ? participants : participants?.length || 0} participants</p>
          <p className="text-sm font-medium">
            {progress}/{total}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-800 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </CardContent>
    </Card>
  )
}
