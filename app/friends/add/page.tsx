"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export default function AddFriendPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [friendId, setFriendId] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResult, setSearchResult] = useState(null)

  const handleSearch = async () => {
    if (!friendId.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/users?friendId=${friendId}`)

      if (!response.ok) {
        throw new Error("Failed to search for user")
      }

      const data = await response.json()

      if (data.length > 0) {
        setSearchResult(data[0])
      } else {
        setSearchResult(null)
        toast({
          title: "User not found",
          description: "No user found with that Friend ID",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFriend = async () => {
    if (!searchResult) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          friendId: searchResult.friendId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add friend")
      }

      toast({
        title: "Friend request sent",
        description: `Friend request sent to ${searchResult.name}`,
      })

      // Update the search result to show pending status
      setSearchResult({
        ...searchResult,
        friendStatus: "PENDING",
        sentRequest: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to add friend",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyFriendId = () => {
    if (!session?.user?.friendId) return

    navigator.clipboard.writeText(session.user.friendId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: "Your Friend ID has been copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/friends" className="inline-flex items-center text-green-800 hover:text-green-700 mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Friends
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-green-800">Add Friend</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Find Friend by ID</CardTitle>
              <CardDescription>Enter your friend's unique ID to find and add them.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter friend ID" value={friendId} onChange={(e) => setFriendId(e.target.value)} />
                  <Button
                    onClick={handleSearch}
                    className="bg-green-800 hover:bg-green-700"
                    disabled={isLoading || !friendId.trim()}
                  >
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searchResult && (
                  <div className="mt-4">
                    <div className="p-4 border rounded-md bg-green-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-green-800" />
                        </div>
                        <div>
                          <h3 className="font-medium">{searchResult.name}</h3>
                          <p className="text-sm text-gray-500">Friend ID: {searchResult.friendId}</p>
                        </div>
                      </div>

                      {searchResult.friendStatus === "ACCEPTED" ? (
                        <div className="mt-4 text-center text-green-700 font-medium">Already friends</div>
                      ) : searchResult.friendStatus === "PENDING" ? (
                        <div className="mt-4 text-center text-amber-700 font-medium">
                          {searchResult.sentRequest
                            ? "Friend request pending"
                            : "Friend request received - check your notifications"}
                        </div>
                      ) : (
                        <Button
                          className="w-full mt-4 bg-green-800 hover:bg-green-700"
                          onClick={handleAddFriend}
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending request..." : "Add Friend"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Share Your Friend ID</CardTitle>
              <CardDescription>Share your unique friend ID with others so they can add you.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Your Friend ID</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={session?.user?.friendId || ""} readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyFriendId}
                      className="text-green-800 border-green-800 hover:bg-green-50"
                      disabled={!session?.user?.friendId}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600">
                  <p>
                    Share this ID with your golf buddies so they can add you as a friend. They'll need to enter this ID
                    in their "Add Friend" page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
