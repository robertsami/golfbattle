import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Users, CheckSquare, Grid3X3 } from "lucide-react"
import { FeatureCardProps } from "@/types"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">GolfDegens</h1>
          <Link href="/login">
            <Button variant="outline" className="text-white border-white hover:bg-green-700">
              Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-green-800">Track Your Golf Competitions</h2>
          <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
            Challenge friends, track matches, and compete in unique golf competitions with our easy-to-use platform.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-green-800 hover:bg-green-700">
              Get Started
            </Button>
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <FeatureCard
            icon={<Trophy className="h-10 w-10 text-green-800" />}
            title="1v1 Matches"
            description="Track long-running matches with multiple results and score verification."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-green-800" />}
            title="Friend System"
            description="Add friends using unique IDs and challenge them to competitions."
          />
          <FeatureCard
            icon={<CheckSquare className="h-10 w-10 text-green-800" />}
            title="Birdie Checklist"
            description="Compete to log birdies on all 18 holes with attestation."
          />
          <FeatureCard
            icon={<Grid3X3 className="h-10 w-10 text-green-800" />}
            title="Custom Bingo"
            description="Create custom bingo boards with configurable challenges."
          />
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} GolfDegens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center text-center">
        {icon}
        <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
