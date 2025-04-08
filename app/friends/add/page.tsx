"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check, User, Loader2, AlertCircle } from "lucide-react"
import { Friend } from "@/types"
import { useSession } from "next-auth/react"
import { userAPI } from "@/lib/api/client"
import { toast } from "@/components/ui/use-toast"

export default function AddFriendPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [friendId, setFriendId] = useState("")
  const [copied, setCopied] = useState(false)
  const [searchResult, setSearchResult] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myFriendId, setMyFriendId] = useState<string>("")

  // Fetch current user's friend ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (session?.user?.id) {
        try {
          const user = await userAPI.getUser(session.user.id)
          if (user && user.friendId) {
            setMyFriendId(user.friendId)
          }
        } catch (err) {
          console.error("Error fetching current user:", err)
          setMyFriendId("Not available")
        }
      }
    }
    
    fetchCurrentUser()
  }, [session?.user?.id])

  const handleSearch = async () => {
    if (!friendId.trim()) return
    
    setIsSearching(true)
    setError(null)
    setSearchResult(null)
    
    try {
      // Search for user by friendId
      const users = await userAPI.searchUsers({ friendId: friendId.trim() })
      
      if (users && users.length > 0) {
        // Found a user with this friendId
        setSearchResult(users[0])
      } else {
        setError("No user found with this Friend ID")
      }
    } catch (err: any) {
      console.error("Error searching for user:", err)
      setError(err.message || "Failed to search for user")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddFriend = async () => {
    if (!searchResult || !session?.user?.id) return
    
    setIsAdding(true)
    
    try {
      // Add friend using the API
      await userAPI.addFriend(session.user.id, searchResult.id)
      
      // Show success message
      toast({
        title: "Friend added successfully!",
        description: `${searchResult.name} has been added to your friends list.`,
      })
      
      // Redirect to the friends page
      router.push("/friends")
    } catch (err: any) {
      console.error("Error adding friend:", err)
      
      // Show error message
      toast({
        title: "Failed to add friend",
        description: err.message || "An error occurred while adding friend",
        variant: "destructive",
      })
      
      setIsAdding(false)
    }
  }

  const copyFriendId = () => {
    navigator.clipboard.writeText(myFriendId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
                  <Input 
                    placeholder="Enter friend ID" 
                    value={friendId} 
                    onChange={(e) => setFriendId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isSearching}
                  />
                  <Button 
                    onClick={handleSearch} 
                    className="bg-green-800 hover:bg-green-700"
                    disabled={isSearching || !friendId.trim()}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                {searchResult && (
                  <div className="mt-4">
                    <div className="p-4 border rounded-md bg-green-50">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          {searchResult.image ? (
                            <img src={searchResult.image} alt={searchResult.name} className="h-5 w-5 rounded-full" />
                          ) : (
                            <User className="h-5 w-5 text-green-800" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{searchResult.name}</h3>
                          <p className="text-sm text-gray-500">Friend ID: {searchResult.friendId}</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-green-800 hover:bg-green-700" 
                        onClick={handleAddFriend}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Add Friend'
                        )}
                      </Button>
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
                    {!session ? (
                      <Input value="Please sign in to see your Friend ID" readOnly disabled />
                    ) : !myFriendId ? (
                      <div className="flex-1 flex items-center justify-center p-2 bg-gray-100 rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <Input value={myFriendId} readOnly />
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyFriendId}
                      className="text-green-800 border-green-800 hover:bg-green-50"
                      disabled={!myFriendId || !session}
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
