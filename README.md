# Golf Battle

A web application for tracking long-running golf competitions between friends.

## Features

- Track matches against friends
- Create and participate in birdie checklist competitions
- Create and participate in golf bingo competitions
- Track scores and progress over time

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/golfbattle.git
   cd golfbattle
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` with your PostgreSQL connection string

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

This application is configured for easy deployment on Vercel with Vercel Postgres.

### Steps to deploy:

1. Push your code to GitHub.

2. Create a new project on Vercel and import your GitHub repository.

3. Set up Vercel Postgres:
   - Go to the Storage tab in your Vercel project
   - Create a new Postgres database
   - Vercel will automatically add the required environment variables

4. Deploy the application:
   - Vercel will automatically detect the Next.js framework
   - The deployment will include running the Prisma migrations

5. Your application is now live!

## Database Schema

The application uses the following database models:

- **User**: Represents a user of the application
- **Match**: Represents a match between two users
- **MatchResult**: Represents a result submitted for a match
- **Competition**: Represents a competition (birdie checklist or bingo)
- **CompetitionParticipant**: Links users to competitions
- **CompetitionHole**: Represents a hole in a birdie checklist competition
- **Birdie**: Represents a birdie achieved on a hole
- **BingoSquare**: Represents a square in a bingo competition

## API Routes

The application provides the following API endpoints:

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get a specific user
- `PUT /api/users/[id]` - Update a user
- `DELETE /api/users/[id]` - Delete a user
- `GET /api/users/[id]/friends` - Get all friends of a user
- `POST /api/users/[id]/friends` - Add a friend

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create a new match
- `GET /api/matches/[id]` - Get a specific match
- `PUT /api/matches/[id]` - Update a match
- `DELETE /api/matches/[id]` - Delete a match
- `GET /api/matches/[id]/results` - Get all results for a match
- `POST /api/matches/[id]/results` - Add a result to a match

### Competitions
- `GET /api/competitions` - Get all competitions
- `POST /api/competitions` - Create a new competition
- `GET /api/competitions/[id]` - Get a specific competition
- `PUT /api/competitions/[id]` - Update a competition
- `DELETE /api/competitions/[id]` - Delete a competition
- `POST /api/competitions/[id]/birdies` - Add a birdie to a competition
- `GET /api/competitions/[id]/bingo` - Get bingo squares for a competition
- `PUT /api/competitions/[id]/bingo` - Update a bingo square

## License

This project is licensed under the MIT License - see the LICENSE file for details.