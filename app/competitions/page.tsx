import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, CheckSquare, Grid3X3, ChevronRight } from "lucide-react"
import { Competition, CompetitionCardProps } from "@/types"

export default function CompetitionsPage() {
  // Mock data for competitions
  const birdieCompetitions = [
    {
      id: 1,
      title: "Summer Birdie Challenge",
      participants: 4,
      progress: 7,
      total: 18,
      lastActivity: "2 days ago",
      type: "birdie-checklist",
      startDate: "June 1, 2023",
    },
    {
      id: 2,
      title: "Club Championship Birdie Race",
      participants: 8,
      progress: 12,
      total: 18,
      lastActivity: "1 week ago",
      type: "birdie-checklist",
      startDate: "May 15, 2023",
    },
  ]

  const bingoCompetitions = [
    {
      id: 3,
      title: "Golf Skills Bingo",
      participants: 6,
      progress: 12,
      total: 25,
      lastActivity: "3 days ago",
      type: "bingo",
      startDate: "June 10, 2023",
    },
    {
      id: 4,
      title: "Course Challenge Bingo",
      participants: 5,
      progress: 8,
      total: 25,
      lastActivity: "5 days ago",
      type: "bingo",
      startDate: "June 5, 2023",
    },
  ]

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

      <Tabs defaultValue="birdie" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="birdie">Birdie Checklist</TabsTrigger>
          <TabsTrigger value="bingo">Bingo Board</TabsTrigger>
        </TabsList>

        <TabsContent value="birdie">
          <div className="space-y-4">
            {birdieCompetitions.length > 0 ? (
              birdieCompetitions.map((competition) => (
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
            {bingoCompetitions.length > 0 ? (
              bingoCompetitions.map((competition) => (
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

function CompetitionCard({ competition, type }: CompetitionCardProps) {
  const icon =
    type === "birdie-checklist" ? (
      <CheckSquare className="h-5 w-5 text-green-800" />
    ) : (
      <Grid3X3 className="h-5 w-5 text-green-800" />
    )

  const progressPercentage = competition && competition.progress && competition.total 
    ? (competition.progress / competition.total) * 100
    : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <Link href={`/competitions/${competition?.id || ''}`} className="block p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {icon}
                <h3 className="font-medium text-gray-800">{competition?.title || ''}</h3>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  {typeof competition?.participants === 'number' ? competition?.participants : competition?.participants?.length || 0} participants • Last activity: {competition?.lastActivity || 'N/A'}
                </p>
                <p className="text-sm font-medium">
                  {competition?.progress || 0}/{competition?.total || 0}
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
