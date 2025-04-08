// Common types for the application
import { Session } from "next-auth";

// Extend the Session type to include the user id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      friendId?: string | null;
    };
  }
}

export interface Friend {
  id: number;
  name: string;
  friendId: string;
  image?: string | null;
  stats?: {
    matches: number;
    birdies: number;
    bingoSquares: number;
  };
}

export interface Match {
  id: string | number;
  opponent: string;
  yourScore: number;
  opponentScore: number;
  status: string;
  startDate?: string;
  results?: MatchResult[];
  lastPlayed?: string;
  pendingResults?: number;
  
  // Additional properties used in the dashboard
  player1?: { id: string; name: string };
  player2?: { id: string; name: string };
  player1Id?: string;
  player2Id?: string;
  player1Score?: number;
  player2Score?: number;
  updatedAt?: string;
}

export interface MatchResult {
  id: number;
  date: string;
  yourScore: number;
  opponentScore: number;
  status: string;
  submittedBy?: string;
}

export interface Competition {
  id: string | number;
  title: string;
  type: string;
  participants: Participant[];
  startDate?: string;
  holes?: CompetitionHole[];
  progress?: number;
  total?: number;
  lastActivity?: string;
  updatedAt?: string;
}

export interface Participant {
  id: number;
  name: string;
  completed?: number;
  percentage?: number;
}

export interface CompetitionHole {
  number: number;
  birdies: Birdie[];
}

export interface Birdie {
  userId: number;
  date: string | null;
  attestedBy: { id: number; name: string } | null;
}

export interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
}

export interface MatchCardProps {
  match: Match;
}

export interface DashboardMatchCardProps {
  opponent: string;
  yourScore: number;
  opponentScore: number;
  lastPlayed: string;
}

export interface CompetitionCardProps {
  competition?: Competition;
  title?: string;
  type?: string;
  participants?: Participant[] | number;
  progress?: number;
  total?: number;
  lastActivity?: string;
}

export interface ResultCardProps {
  result: MatchResult;
  opponent: string;
  onAccept: (resultId: number) => void;
  onReject: (resultId: number) => void;
}

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface PageParams extends Promise<{ id: string }> {
  id: string;
}