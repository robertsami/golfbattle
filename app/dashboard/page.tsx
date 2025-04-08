"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckSquare, Grid3X3, Trophy, ChevronRight, Loader2 } from "lucide-react"
import { competitionAPI, matchAPI, userAPI } from "@/lib/api/client"

// Mock user ID until we have authentication
const CURRENT_USER_ID = "placeholder-user-id";

export default function DashboardPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [stats, setStats] = useState({
    matchesPlayed: 0,
    birdiesRecorded: 0,
    bingoSquaresCompleted: 0,
  });
  const [loading, setLoading] = useState({
    competitions: true,
    matches: true,
    friends: true,
    stats: true,
  });
  const [error, setError] = useState({
    competitions: null,
    matches: null,
    friends: null,
    stats: null,
  });

  // Fetch competitions
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await competitionAPI.getCompetitions();
        // Sort by most recent
        const sortedData = [...data].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setCompetitions(sortedData.slice(0, 2)); // Just show the 2 most recent
      } catch (err: any) {
        console.error("Error fetching competitions:", err);
        setError(prev => ({ ...prev, competitions: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, competitions: false }));
      }
    };

    fetchCompetitions();
  }, []);

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchAPI.getMatches();
        // Sort by most recent
        const sortedData = [...data].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setMatches(sortedData.slice(0, 2)); // Just show the 2 most recent
      } catch (err: any) {
        console.error("Error fetching matches:", err);
        setError(prev => ({ ...prev, matches: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, matches: false }));
      }
    };

    fetchMatches();
  }, []);

  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await userAPI.getUsers();
        setFriends(data.slice(0, 3)); // Just show the first 3 friends
      } catch (err: any) {
        console.error("Error fetching friends:", err);
        setError(prev => ({ ...prev, friends: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, friends: false }));
      }
    };

    fetchFriends();
  }, []);

  // Calculate stats
  useEffect(() => {
    const calculateStats = async () => {
      try {
        // In a real app, we would fetch this from a dedicated stats endpoint
        // For now, we'll calculate based on the data we already have
        
        // Matches played
        const matchesPlayed = matches.length;
        
        // Count birdies and bingo squares
        let birdiesRecorded = 0;
        let bingoSquaresCompleted = 0;
        
        // For each competition, count birdies and bingo squares
        for (const competition of competitions) {
          if (competition.type === 'birdie-checklist') {
            // Count birdies
            competition.holes?.forEach((hole: any) => {
              birdiesRecorded += hole.birdies?.length || 0;
            });
          } else if (competition.type === 'bingo') {
            // Count completed bingo squares
            competition.participants?.forEach((participant: any) => {
              if (participant.bingoSquares) {
                bingoSquaresCompleted += participant.bingoSquares.filter((square: any) => square.completed).length;
              }
            });
          }
        }
        
        setStats({
          matchesPlayed,
          birdiesRecorded,
          bingoSquaresCompleted,
        });
      } catch (err: any) {
        console.error("Error calculating stats:", err);
        setError(prev => ({ ...prev, stats: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };

    if (!loading.competitions && !loading.matches) {
      calculateStats();
    }
  }, [competitions, matches, loading.competitions, loading.matches]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="competitions" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="competitions">Competitions</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
            </TabsList>

            <TabsContent value="competitions">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Active Competitions</h2>
                <Link href="/competitions">
                  <Button variant="outline" className="text-green-800">
                    View All
                  </Button>
                </Link>
              </div>

              {loading.competitions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-800" />
                </div>
              ) : error.competitions ? (
                <Card>
                  <CardContent className="p-6 text-center text-red-500">
                    Error loading competitions: {error.competitions}
                  </CardContent>
                </Card>
              ) : competitions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No active competitions. Create one to get started!
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {competitions.map((competition) => (
                    <CompetitionCard 
                      key={competition.id} 
                      title={competition.title}
                      type={competition.type}
                      participants={competition.participants?.length || 0}
                      progress={competition.type === 'birdie-checklist' 
                        ? competition.holes?.filter((h: any) => h.birdies?.length > 0).length || 0
                        : competition.participants?.reduce((acc: number, p: any) => acc + (p.progress || 0), 0) || 0
                      }
                      total={competition.type === 'birdie-checklist' ? 18 : 25}
                      competitionId={competition.id}
                    />
                  ))}
                </div>
              )}

              <div className="mt-8">
                <Link href="/competitions/new">
                  <Button className="w-full bg-green-800 hover:bg-green-700">Create New Competition</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="matches">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Matches</h2>
                <Link href="/matches">
                  <Button variant="outline" className="text-green-800">
                    View All
                  </Button>
                </Link>
              </div>

              {loading.matches ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-800" />
                </div>
              ) : error.matches ? (
                <Card>
                  <CardContent className="p-6 text-center text-red-500">
                    Error loading matches: {error.matches}
                  </CardContent>
                </Card>
              ) : matches.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No matches yet. Start a new match to get going!
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <MatchCard 
                      key={match.id}
                      matchId={match.id}
                      opponent={match.player1?.name || match.player2?.name || 'Opponent'}
                      yourScore={match.player1Score}
                      opponentScore={match.player2Score}
                      lastPlayed={formatDate(match.updatedAt)}
                      pendingResults={match.results?.filter((r: any) => r.status === 'pending').length || 0}
                    />
                  ))}
                </div>
              )}

              <div className="mt-8">
                <Link href="/matches/new">
                  <Button className="w-full bg-green-800 hover:bg-green-700">Start New Match</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Friends</h2>
              {loading.friends ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-green-800" />
                </div>
              ) : error.friends ? (
                <div className="text-center text-red-500 text-sm">
                  Error loading friends: {error.friends}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No friends yet. Add some to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <FriendCard 
                      key={friend.id}
                      friendId={friend.id}
                      name={friend.name} 
                    />
                  ))}
                </div>
              )}
              <div className="mt-6">
                <Link href="/friends">
                  <Button variant="outline" className="w-full">View All Friends</Button>
                </Link>
              </div>
              <div className="mt-2">
                <Link href="/friends/add">
                  <Button className="w-full bg-green-800 hover:bg-green-700">Add Friend</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Stats</h2>
              {loading.stats ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-green-800" />
                </div>
              ) : error.stats ? (
                <div className="text-center text-red-500 text-sm">
                  Error loading stats: {error.stats}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-green-800" />
                    <div>
                      <p className="text-sm text-gray-500">Matches Played</p>
                      <p className="font-medium">{stats.matchesPlayed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-green-800" />
                    <div>
                      <p className="text-sm text-gray-500">Birdies Recorded</p>
                      <p className="font-medium">{stats.birdiesRecorded}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Grid3X3 className="h-5 w-5 text-green-800" />
                    <div>
                      <p className="text-sm text-gray-500">Bingo Squares Completed</p>
                      <p className="font-medium">{stats.bingoSquaresCompleted}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function to format dates
function formatDate(dateString: string): string {
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

interface CompetitionCardProps {
  title: string;
  type: string;
  participants: number;
  progress: number;
  total: number;
  competitionId: string;
}

function CompetitionCard({ title, type, participants, progress, total, competitionId }: CompetitionCardProps) {
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
          <p className="text-sm text-gray-500">{participants} participants</p>
          <p className="text-sm font-medium">
            {progress}/{total}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-800 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="mt-3 flex justify-end">
          <Link href={`/competitions/${competitionId}`}>
            <Button variant="ghost" size="sm" className="text-green-800">
              View <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

interface MatchCardProps {
  matchId: string;
  opponent: string;
  yourScore: number;
  opponentScore: number;
  lastPlayed: string;
  pendingResults: number;
}

function MatchCard({ matchId, opponent, yourScore, opponentScore, lastPlayed, pendingResults }: MatchCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-800">vs. {opponent}</h3>
            <p className="text-sm text-gray-500">Last played: {lastPlayed}</p>
            {pendingResults > 0 && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                  {pendingResults} pending {pendingResults === 1 ? "result" : "results"}
                </span>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">
              {yourScore} - {opponentScore}
            </div>
            <p className="text-xs text-gray-500">Current Score</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Link href={`/matches/${matchId}`}>
            <Button variant="ghost" size="sm" className="text-green-800">
              View <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

interface FriendCardProps {
  friendId: string;
  name: string;
}

function FriendCard({ friendId, name }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-green-100 p-1.5 rounded-full">
          <Trophy className="h-4 w-4 text-green-800" />
        </div>
        <span className="font-medium">{name}</span>
      </div>
      <Link href={`/friends/${friendId}`}>
        <Button variant="ghost" size="sm" className="text-green-800 p-1">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}