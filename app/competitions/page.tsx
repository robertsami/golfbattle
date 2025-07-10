"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, CheckSquare, Grid3X3, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CompetitionsPage() {
  const { toast } = useToast()
  const [competitions, setCompetitions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("birdie")

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const type = activeTab === "birdie" ? "BIRDIE_CHECKLIST" : "BINGO"
        const response = await fetch(`/api/competitions?type=${type}`)

        if (!response.ok) {
          throw new Error("Failed to fetch competitions")
        }

        const data = await response.json()
        setCompetitions(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load competitions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompetitions()
  }, [toast, activeTab])

  // Format competitions for display
  const formattedCompetitions = competitions.map((competition) => {
    const participants = competition.participants.length
    let progress = 0
    let total = 0
    let lastActivity = "No activity yet"

    if (competition.type === "BIRDIE_CHECKLIST") {
      // Count user's birdies in this competition
      const userEntries = competition.birdieEntries.filter(
        (entry) => entry.userId === competition.participants[0].userId,
      )
      progress = userEntries.length
      total = 18 // 18 holes

      // Get the most recent activity
      if (competition.birdieEntries.length > 0) {
        const latestEntry = [...competition.birdieEntries].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        lastActivity = formatTimeAgo(latestEntry.date)
      }
    } else if (competition.type === "BINGO") {
      // Count user's marked squares in this competition
      const userEntries = competition.bingoEntries.filter(
        (entry) => entry.userId === competition.participants[0].userId,
      )
      progress = userEntries.length
      total = competition.boardSize ? competition.boardSize * competition.boardSize : 25 // Default to 5x5

      // Get the most recent activity
      if (competition.bingoEntries.length > 0) {
        const latestEntry = [...competition.bingoEntries].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        lastActivity = formatTimeAgo(latestEntry.date)
      }
    }

    return {
      id: competition.id,
      title: competition.title,
      type: competition.type === "BIRDIE_CHECKLIST" ? "birdie-checklist" : "bingo",
      participants,
      progress,
      total,
      lastActivity,
    }
  })

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Competitions</h1>
        <Link href="/competitions/new">
          <Button className="bg-green-800 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> New Competition
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="birdie" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="birdie">Birdie Checklist</TabsTrigger>
          <TabsTrigger value="bingo">Bingo Board</TabsTrigger>
        </TabsList>

        <TabsContent value="birdie">
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Loading competitions...</CardContent>
              </Card>
            ) : formattedCompetitions.length > 0 ? (
              formattedCompetitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} type="birdie-checklist" />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No birdie checklist competitions yet. Create one to get started!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bingo">
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Loading competitions...</CardContent>
              </Card>
            ) : formattedCompetitions.length > 0 ? (
              formattedCompetitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} type="bingo" />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No bingo board competitions yet. Create one to get started!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CompetitionCard({ competition, type }) {
  const icon =
    type === "birdie-checklist" ? (
      <CheckSquare className="h-5 w-5 text-green-800" />
    ) : (
      <Grid3X3 className="h-5 w-5 text-green-800" />
    )

  const progressPercentage = (competition.progress / competition.total) * 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <Link href={`/competitions/${competition.id}`} className="block p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {icon}
                <h3 className="font-medium text-gray-800">{competition.title}</h3>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  {competition.participants} participants • Last activity: {competition.lastActivity}
                </p>
                <p className="text-sm font-medium">
                  {competition.progress}/{competition.total}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-800 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
            <div className="ml-4">
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
