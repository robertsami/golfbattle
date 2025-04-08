import { PrismaClient } from '@prisma/client';
import { add } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clean up existing data
  await cleanDatabase();

  // Create users
  console.log('Creating users...');
  const users = await createUsers();

  // Create matches
  console.log('Creating matches...');
  const matches = await createMatches(users);

  // Create competitions
  console.log('Creating competitions...');
  await createCompetitions(users);

  console.log('Seeding completed successfully!');
}

async function cleanDatabase() {
  // Delete all existing data in reverse order of dependencies
  await prisma.birdie.deleteMany();
  await prisma.bingoSquare.deleteMany();
  await prisma.competitionHole.deleteMany();
  await prisma.competitionParticipant.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.matchResult.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();
}

async function createUsers() {
  // Create test users
  const users = [
    {
      name: 'John Smith',
      email: 'john@example.com',
      friendId: 'john123',
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      friendId: 'mike456',
    },
    {
      name: 'Dave Wilson',
      email: 'dave@example.com',
      friendId: 'dave789',
    },
    {
      name: 'Robert Brown',
      email: 'robert@example.com',
      friendId: 'robert321',
    },
    {
      name: 'James Davis',
      email: 'james@example.com',
      friendId: 'james654',
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }

  // Make them all friends with each other
  for (let i = 0; i < createdUsers.length; i++) {
    for (let j = i + 1; j < createdUsers.length; j++) {
      await prisma.user.update({
        where: { id: createdUsers[i].id },
        data: {
          friends: {
            connect: { id: createdUsers[j].id },
          },
        },
      });

      await prisma.user.update({
        where: { id: createdUsers[j].id },
        data: {
          friends: {
            connect: { id: createdUsers[i].id },
          },
        },
      });
    }
  }

  return createdUsers;
}

async function createMatches(users: any[]) {
  const matches = [];

  // Create matches between users
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const match = await prisma.match.create({
        data: {
          player1Id: users[i].id,
          player2Id: users[j].id,
          title: `Match: ${users[i].name} vs ${users[j].name}`,
          startDate: add(new Date(), { days: -Math.floor(Math.random() * 30) }),
        },
      });

      // Add some results to the match
      const resultCount = Math.floor(Math.random() * 3) + 1;
      for (let k = 0; k < resultCount; k++) {
        const player1Score = Math.floor(Math.random() * 5);
        const player2Score = Math.floor(Math.random() * 5);
        
        await prisma.matchResult.create({
          data: {
            matchId: match.id,
            submitterId: Math.random() > 0.5 ? users[i].id : users[j].id,
            player1Score,
            player2Score,
            date: add(new Date(), { days: -Math.floor(Math.random() * 14) }),
            status: 'accepted',
          },
        });
      }

      // Update match scores based on results
      const results = await prisma.matchResult.findMany({
        where: { matchId: match.id },
      });

      let player1Score = 0;
      let player2Score = 0;

      results.forEach(result => {
        if (result.player1Score > result.player2Score) {
          player1Score++;
        } else if (result.player2Score > result.player1Score) {
          player2Score++;
        }
      });

      await prisma.match.update({
        where: { id: match.id },
        data: {
          player1Score,
          player2Score,
        },
      });

      matches.push(match);
    }
  }

  return matches;
}

async function createCompetitions(users: any[]) {
  // Create a birdie checklist competition
  const birdieCompetition = await prisma.competition.create({
    data: {
      title: 'Summer Birdie Challenge',
      type: 'birdie-checklist',
      creatorId: users[0].id,
      startDate: add(new Date(), { days: -30 }),
    },
  });

  // Add participants
  for (const user of users) {
    await prisma.competitionParticipant.create({
      data: {
        competitionId: birdieCompetition.id,
        userId: user.id,
      },
    });
  }

  // Create holes
  for (let i = 1; i <= 18; i++) {
    const hole = await prisma.competitionHole.create({
      data: {
        competitionId: birdieCompetition.id,
        holeNumber: i,
      },
    });

    // Add some birdies
    if (i <= 10) { // Only add birdies for the first 10 holes
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const randomAttesterIndex = (randomUserIndex + 1) % users.length;

      if (Math.random() > 0.3) { // 70% chance to have a birdie
        await prisma.birdie.create({
          data: {
            competitionHoleId: hole.id,
            achieverId: users[randomUserIndex].id,
            attesterId: users[randomAttesterIndex].id,
            date: add(new Date(), { days: -Math.floor(Math.random() * 20) }),
          },
        });
      }
    }
  }

  // Create a bingo competition
  const bingoCompetition = await prisma.competition.create({
    data: {
      title: 'Golf Skills Bingo',
      type: 'bingo',
      creatorId: users[1].id,
      startDate: add(new Date(), { days: -20 }),
    },
  });

  // Add participants
  for (const user of users) {
    await prisma.competitionParticipant.create({
      data: {
        competitionId: bingoCompetition.id,
        userId: user.id,
      },
    });
  }

  // Default bingo challenges
  const bingoSquares = [
    'Birdie on a par 3',
    'Birdie on a par 4',
    'Birdie on a par 5',
    'Three pars in a row',
    'Hit all fairways on front 9',
    'Hit all greens on back 9',
    'No three-putts for 9 holes',
    'Chip in from off the green',
    'Sand save',
    'Up and down from 50+ yards',
    'Drive over 250 yards',
    'Putt over 20 feet',
    'Par or better on a hole with water',
    'Par or better on a hole with bunker',
    'Finish a round with the same ball',
    'Beat your handicap on 9 holes',
    'No double bogeys for 9 holes',
    'Play a round in under 4 hours',
    'Hit 5 fairways in a row',
    'Hit 5 greens in a row',
    'Make 3 one-putts in a row',
    'Par the hardest hole on the course',
    'Birdie the easiest hole on the course',
    'Play a round with no penalty strokes',
    'Play a round with no lost balls',
  ];

  // Create bingo squares for each participant
  for (const user of users) {
    // Select 25 random challenges or use defaults if not enough
    const selectedChallenges = [...bingoSquares]
      .sort(() => 0.5 - Math.random())
      .slice(0, 25);
    
    for (let i = 0; i < 25; i++) {
      const completed = Math.random() > 0.7; // 30% chance to be completed
      
      await prisma.bingoSquare.create({
        data: {
          competitionId: bingoCompetition.id,
          userId: user.id,
          squareNumber: i + 1,
          description: selectedChallenges[i],
          completed,
          completedDate: completed ? add(new Date(), { days: -Math.floor(Math.random() * 15) }) : null,
        },
      });
    }
  }

  // Create another birdie competition
  const birdieCompetition2 = await prisma.competition.create({
    data: {
      title: 'Club Championship Birdie Race',
      type: 'birdie-checklist',
      creatorId: users[2].id,
      startDate: add(new Date(), { days: -15 }),
    },
  });

  // Add participants (just a subset)
  for (let i = 0; i < 3; i++) {
    await prisma.competitionParticipant.create({
      data: {
        competitionId: birdieCompetition2.id,
        userId: users[i].id,
      },
    });
  }

  // Create holes
  for (let i = 1; i <= 18; i++) {
    const hole = await prisma.competitionHole.create({
      data: {
        competitionId: birdieCompetition2.id,
        holeNumber: i,
      },
    });

    // Add some birdies (fewer than the first competition)
    if (i <= 5) { // Only add birdies for the first 5 holes
      const randomUserIndex = Math.floor(Math.random() * 3); // Only first 3 users
      const randomAttesterIndex = (randomUserIndex + 1) % 3;

      if (Math.random() > 0.5) { // 50% chance to have a birdie
        await prisma.birdie.create({
          data: {
            competitionHoleId: hole.id,
            achieverId: users[randomUserIndex].id,
            attesterId: users[randomAttesterIndex].id,
            date: add(new Date(), { days: -Math.floor(Math.random() * 10) }),
          },
        });
      }
    }
  }

  // Create another bingo competition
  const bingoCompetition2 = await prisma.competition.create({
    data: {
      title: 'Course Challenge Bingo',
      type: 'bingo',
      creatorId: users[3].id,
      startDate: add(new Date(), { days: -10 }),
    },
  });

  // Add participants (just a subset)
  for (let i = 2; i < 5; i++) {
    await prisma.competitionParticipant.create({
      data: {
        competitionId: bingoCompetition2.id,
        userId: users[i].id,
      },
    });
  }

  // Create bingo squares for each participant
  for (let i = 2; i < 5; i++) {
    const user = users[i];
    // Select 25 random challenges or use defaults if not enough
    const selectedChallenges = [...bingoSquares]
      .sort(() => 0.5 - Math.random())
      .slice(0, 25);
    
    for (let j = 0; j < 25; j++) {
      const completed = Math.random() > 0.8; // 20% chance to be completed
      
      await prisma.bingoSquare.create({
        data: {
          competitionId: bingoCompetition2.id,
          userId: user.id,
          squareNumber: j + 1,
          description: selectedChallenges[j],
          completed,
          completedDate: completed ? add(new Date(), { days: -Math.floor(Math.random() * 8) }) : null,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });