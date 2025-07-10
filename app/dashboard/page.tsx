import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckSquare, Grid3X3, Plus } from "lucide-react"
import { getAuthSession } from "@/auth"
import prisma from "@/lib/db"

export default async function Dashboard() {
  const session = await getAuthSession()

  if (!session) {
    return null
  }

  // Fetch user's active matches
  const activeMatches = await prisma.match.findMany({
    where: {
      OR: [{ player1Id: session.user.id }, { player2Id: session.user.id }],
      status: "ACTIVE",
    },
    include: {
      player1: true,
      player2: true,
      results: {
        orderBy: {
          date: "desc",
        },
        take: 1,
      },
    },
    take: 3,
  })

  // Fetch user's competitions
  const competitions = await prisma.competition.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      birdieEntries: true,
      bingoEntries: true,
    },
    take: 2,
  })

  // Count friends
  const friendsCount = await prisma.friend.count({
    where: {
      OR: [
        { userId: session.user.id, status: "ACCEPTED" },
        { friendId: session.user.id, status: "ACCEPTED" },
      ],
    },
  })

  // Count birdies
  const birdiesCount = await prisma.birdieEntry.count({
    where: {
      userId: session.user.id,
    },
  })

  // Count bingo squares
  const bingoSquaresCount = await prisma.bingoEntry.count({
    where: {
      userId: session.user.id,
    },
  })

  // Format matches for display
  const formattedMatches = activeMatches.map((match) => {
    const isPlayer1 = match.player1Id === session.user.id
    const opponent = isPlayer1 ? match.player2 : match.player1

    // Calculate scores
    let yourScore = 0
    let opponentScore = 0

    match.results.forEach((result) => {
      if (result.status === "ACCEPTED") {
        if (isPlayer1) {
          yourScore += result.player1Score > result.player2Score ? 1 : 0
          opponentScore += result.player2Score > result.player1Score ? 1 : 0
        } else {
          yourScore += result.player2Score > result.player1Score ? 1 : 0
          opponentScore += result.player1Score > result.player2Score ? 1 : 0
        }
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
    }
  })

  // Format competitions for display
  const formattedCompetitions = competitions.map((competition) => {
    const participants = competition.participants.length
    let progress = 0
    let total = 0

    if (competition.type === "BIRDIE_CHECKLIST") {
      // Count user's birdies in this competition
      progress = competition.birdieEntries.filter((entry) => entry.userId === session.user.id).length
      total = 18 // 18 holes
    } else if (competition.type === "BINGO") {
      // Count user's marked squares in this competition
      progress = competition.bingoEntries.filter((entry) => entry.userId === session.user.id).length
      total = competition.boardSize ? competition.boardSize * competition.boardSize : 25 // Default to 5x5
    }

    return {
      id: competition.id,
      title: competition.title,
      type: competition.type === "BIRDIE_CHECKLIST" ? "birdie-checklist" : "bingo",
      participants,
      progress,
      total,
    }
  })

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-green-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard title="Active Matches" value={activeMatches.length.toString()} />
        <StatsCard title="Friends" value={friendsCount.toString()} />
        <StatsCard title="Birdies Logged" value={birdiesCount.toString()} />
        <StatsCard title="Bingo Squares" value={bingoSquaresCount.toString()} />
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
            {formattedMatches.length > 0 ? (
              formattedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  opponent={match.opponent}
                  yourScore={match.yourScore}
                  opponentScore={match.opponentScore}
                  lastPlayed={match.lastPlayed}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No active matches. Start a new match to compete with friends!
                </CardContent>
              </Card>
            )}
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
            {formattedCompetitions.length > 0 ? (
              formattedCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  title={competition.title}
                  type={competition.type}
                  participants={competition.participants}
                  progress={competition.progress}
                  total={competition.total}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No competitions yet. Create one to get started!
                </CardContent>
              </Card>
            )}
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

function StatsCard({ title, value }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-4xl font-bold text-green-800 mb-2">{value}</div>
        <div className="text-gray-600">{title}</div>
      </CardContent>
    </Card>
  )
}

function MatchCard({ opponent, yourScore, opponentScore, lastPlayed }) {
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

function CompetitionCard({ title, type, participants, progress, total }) {
  const icon =
    type === "birdie-checklist" ? (
      <CheckSquare className="h-5 w-5 text-green-800" />
    ) : (
      <Grid3X3 className="h-5 w-5 text-green-800" />
    )

  const progressPercentage = (progress / total) * 100

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500">{participants} participants</p>
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
