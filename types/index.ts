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
  id: string;
  name: string;
  email: string | null;
  emailVerified: string | null;
  image: string | null;
  friendId: string;
  createdAt: string;
  updatedAt: string;
  
  // Client-side computed properties
  stats?: {
    matches: number;
    birdies: number;
    bingoSquares: number;
  };
}

export interface Match {
  id: string;
  status: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // From API response
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  player1: { id: string; name: string; friendId: string };
  player2: { id: string; name: string; friendId: string };
  results: MatchResult[];
  
  // Client-side computed properties
  opponent?: string;
  yourScore?: number;
  opponentScore?: number;
  lastPlayed?: string;
  pendingResults?: number;
}

export interface MatchResult {
  id: string;
  matchId: string;
  submitterId: string;
  player1Score: number;
  player2Score: number;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  submitter: {
    id: string;
    name: string;
  };
  
  // Client-side computed properties
  yourScore?: number;
  opponentScore?: number;
  submittedBy?: string;
}

export interface Competition {
  id: string;
  title: string;
  type: string;
  creatorId: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  
  // From API response
  creator: {
    id: string;
    name: string;
  };
  participants: {
    userId: string;
    competitionId: string;
    user: {
      id: string;
      name: string;
    };
    progress?: number;
    total?: number;
    percentage?: number;
  }[];
  holes: CompetitionHole[];
  
  // Client-side computed properties
  progress?: number;
  total?: number;
  lastActivity?: string;
}

export interface Participant {
  userId: string;
  competitionId: string;
  user: {
    id: string;
    name: string;
  };
  
  // Client-side computed properties
  id?: string; // For backward compatibility
  name?: string; // For backward compatibility
  completed?: number;
  progress?: number;
  total?: number;
  percentage?: number;
}

export interface CompetitionHole {
  id: string;
  competitionId: string;
  holeNumber: number;
  createdAt: string;
  updatedAt: string;
  birdies: Birdie[];
  
  // For backward compatibility
  number?: number;
}

export interface Birdie {
  id: string;
  competitionHoleId: string;
  achieverId: string;
  attesterId: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  achiever: {
    id: string;
    name: string;
  };
  attester: {
    id: string;
    name: string;
  } | null;
  
  // For backward compatibility
  userId?: string;
  attestedBy?: { id: string; name: string } | null;
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
  matchId: string;
  opponent: string;
  yourScore: number;
  opponentScore: number;
  lastPlayed: string;
  pendingResults?: number;
}

export interface DashboardMatchCardProps {
  matchId: string;
  opponent: string;
  yourScore: number;
  opponentScore: number;
  lastPlayed: string;
  pendingResults?: number;
}

export interface CompetitionCardProps {
  competitionId: string;
  title: string;
  type: string;
  participantCount: number;
  progress: number;
  total: number;
  lastActivity?: string;
}

export interface ResultCardProps {
  result: MatchResult;
}

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface PageParams {
  id: string;
}