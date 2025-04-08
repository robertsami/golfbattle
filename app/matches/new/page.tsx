"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, UserPlus } from "lucide-react"

export default function NewMatchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFriend, setSelectedFriend] = useState(null)

  // Mock friends data
  const friends = [
    { id: 1, name: "John Smith", friendId: "john123" },
    { id: 2, name: "Mike Johnson", friendId: "mike456" },
    { id: 3, name: "Dave Wilson", friendId: "dave789" },
    { id: 4, name: "Robert Brown", friendId: "robert321" },
    { id: 5, name: "James Davis", friendId: "james654" },
  ]

  const filteredFriends = searchTerm
    ? friends.filter(
        (friend) =>
          friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          friend.friendId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : friends

  const handleCreateMatch = () => {
    if (!selectedFriend) return

    // In a real app, this would send the data to the server
    console.log("Creating match with:", selectedFriend)

    // Redirect to the matches page
    window.location.href = "/matches"
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/matches" className="inline-flex items-center text-green-800 hover:text-green-700 mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Matches
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-green-800">Create New Match</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Select Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search friends..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedFriend?.id === friend.id
                          ? "bg-green-100 border border-green-300"
                          : "hover:bg-gray-100 border border-transparent"
                      }`}
                      onClick={() => setSelectedFriend(friend)}
                    >
                      <div className="font-medium">{friend.name}</div>
                      <div className="text-sm text-gray-500">Friend ID: {friend.friendId}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No friends found matching "{searchTerm}"</div>
                )}
              </div>

              <div className="mt-4 text-center">
                <Link href="/friends/add">
                  <Button variant="outline" className="text-green-800 border-green-800 hover:bg-green-50">
                    <UserPlus className="h-4 w-4 mr-2" /> Add New Friend
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFriend ? (
                <div>
                  <div className="mb-6">
                    <Label className="text-base">Selected Opponent</Label>
                    <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="font-medium">{selectedFriend.name}</div>
                      <div className="text-sm text-gray-500">Friend ID: {selectedFriend.friendId}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="matchName" className="text-base">
                      Match Name (Optional)
                    </Label>
                    <Input id="matchName" placeholder="Summer 2023 Match" className="mt-2" />
                    <p className="text-sm text-gray-500 mt-1">
                      If left blank, we'll use "Match vs. {selectedFriend.name}"
                    </p>
                  </div>

                  <Button className="w-full bg-green-800 hover:bg-green-700" onClick={handleCreateMatch}>
                    Create Match
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Select an opponent from the list to continue</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
