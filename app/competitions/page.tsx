"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, CheckSquare, Grid3X3, ChevronRight, Loader2 } from "lucide-react"
import { Competition, CompetitionCardProps } from "@/types"
import { competitionAPI } from "@/lib/api/client"

export default function CompetitionsPage() {
  const [birdieCompetitions, setBirdieCompetitions] = useState<any[]>([]);
  const [bingoCompetitions, setBingoCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const data = await competitionAPI.getCompetitions();
        
        // Split competitions by type
        const birdies = data.filter(comp => comp.type === 'birdie-checklist');
        const bingos = data.filter(comp => comp.type === 'bingo');
        
        setBirdieCompetitions(birdies);
        setBingoCompetitions(bingos);
      } catch (err: any) {
        console.error("Error fetching competitions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

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
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-800" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                Error loading competitions: {error}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {birdieCompetitions.length > 0 ? (
                birdieCompetitions.map((competition) => (
                  <CompetitionCard 
                    key={competition.id} 
                    competition={competition} 
                    type="birdie-checklist" 
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No birdie checklist competitions yet. Create one to get started!
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bingo">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-800" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                Error loading competitions: {error}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bingoCompetitions.length > 0 ? (
                bingoCompetitions.map((competition) => (
                  <CompetitionCard 
                    key={competition.id} 
                    competition={competition} 
                    type="bingo" 
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No bingo board competitions yet. Create one to get started!
                  </CardContent>
                </Card>
              )}
            </div>
          )}
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

  // Calculate progress
  let progress = 0;
  let total = 0;
  
  if (type === "birdie-checklist") {
    total = competition?.holes?.length || 18;
    progress = competition?.holes?.filter((h: any) => h.birdies?.length > 0).length || 0;
  } else if (type === "bingo") {
    total = 25; // 5x5 bingo board
    // Sum up completed squares across all participants
    const completedSquares = competition?.participants?.reduce((acc: number, p: any) => {
      return acc + (p.bingoSquares?.filter((s: any) => s.completed).length || 0);
    }, 0) || 0;
    progress = completedSquares;
  }

  const progressPercentage = total > 0 ? (progress / total) * 100 : 0;
  const participantCount = competition?.participants?.length || 0;
  const lastActivity = formatDate(competition?.updatedAt);

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
                  {participantCount} participants • Last activity: {lastActivity}
                </p>
                <p className="text-sm font-medium">
                  {progress}/{total}
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

// Helper function to format dates
function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
}