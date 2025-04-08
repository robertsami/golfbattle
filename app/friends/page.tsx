import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, User, Trophy, CheckSquare, Grid3X3 } from "lucide-react"

export default function FriendsPage() {
  // Mock friends data
  const friends = [
    {
      id: 1,
      name: "John Smith",
      friendId: "john123",
      stats: {
        matches: 3,
        birdies: 12,
        bingoSquares: 8,
      },
    },
    {
      id: 2,
      name: "Mike Johnson",
      friendId: "mike456",
      stats: {
        matches: 1,
        birdies: 7,
        bingoSquares: 5,
      },
    },
    {
      id: 3,
      name: "Dave Wilson",
      friendId: "dave789",
      stats: {
        matches: 2,
        birdies: 9,
        bingoSquares: 10,
      },
    },
    {
      id: 4,
      name: "Robert Brown",
      friendId: "robert321",
      stats: {
        matches: 0,
        birdies: 5,
        bingoSquares: 3,
      },
    },
    {
      id: 5,
      name: "James Davis",
      friendId: "james654",
      stats: {
        matches: 4,
        birdies: 15,
        bingoSquares: 12,
      },
    },
  ]

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Friends</h1>
        <Link href="/friends/add">
          <Button className="bg-green-800 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" /> Add Friend
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search friends..." className="pl-8" />
        </div>
      </div>

      <div className="space-y-4">
        {friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  )
}

function FriendCard({ friend }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <User className="h-6 w-6 text-green-800" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{friend.name}</h3>
              <p className="text-sm text-gray-500">Friend ID: {friend.friendId}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-800" />
              <span className="text-sm">
                <span className="font-medium">{friend.stats.matches}</span> matches
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-800" />
              <span className="text-sm">
                <span className="font-medium">{friend.stats.birdies}</span> birdies
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-green-800" />
              <span className="text-sm">
                <span className="font-medium">{friend.stats.bingoSquares}</span> bingo squares
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/matches/new?friend=${friend.id}`}>
              <Button variant="outline" size="sm" className="text-green-800 border-green-800 hover:bg-green-50">
                Challenge
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
