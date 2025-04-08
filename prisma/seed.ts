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
      image: 'https://ui-avatars.com/api/?name=John+Smith&background=0D8ABC&color=fff',
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      friendId: 'mike456',
      image: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=0D8ABC&color=fff',
    },
    {
      name: 'Dave Wilson',
      email: 'dave@example.com',
      friendId: 'dave789',
      image: 'https://ui-avatars.com/api/?name=Dave+Wilson&background=0D8ABC&color=fff',
    },
    {
      name: 'Robert Brown',
      email: 'robert@example.com',
      friendId: 'robert321',
      image: 'https://ui-avatars.com/api/?name=Robert+Brown&background=0D8ABC&color=fff',
    },
    {
      name: 'James Davis',
      email: 'james@example.com',
      friendId: 'james654',
      image: 'https://ui-avatars.com/api/?name=James+Davis&background=0D8ABC&color=fff',
    },
    // Add a user that represents the current user for testing
    {
      name: 'Current User',
      email: 'current@example.com',
      friendId: 'current123',
      image: 'https://ui-avatars.com/api/?name=Current+User&background=0D8ABC&color=fff',
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
  const currentUser = users.find(u => u.email === 'current@example.com');
  
  if (!currentUser) {
    throw new Error('Current user not found in users array');
  }

  // Create matches between current user and other users
  for (let i = 0; i < users.length; i++) {
    // Skip if this is the current user
    if (users[i].id === currentUser.id) continue;
    
    // Create a match between current user and another user
    const match = await prisma.match.create({
      data: {
        player1Id: currentUser.id,
        player2Id: users[i].id,
        title: `Match: ${currentUser.name} vs ${users[i].name}`,
        startDate: add(new Date(), { days: -Math.floor(Math.random() * 30) }),
        status: Math.random() > 0.2 ? 'active' : 'completed',
      },
    });

    // Add some results to the match
    const resultCount = Math.floor(Math.random() * 3) + 1;
    for (let k = 0; k < resultCount; k++) {
      // Generate realistic golf scores (around par 72)
      const player1Score = 70 + Math.floor(Math.random() * 8); // 70-77
      const player2Score = 70 + Math.floor(Math.random() * 8); // 70-77
      
      // Create a result with a random status
      const status = Math.random() > 0.2 ? 'accepted' : (Math.random() > 0.5 ? 'pending' : 'rejected');
      
      await prisma.matchResult.create({
        data: {
          matchId: match.id,
          submitterId: Math.random() > 0.5 ? currentUser.id : users[i].id,
          player1Score,
          player2Score,
          date: add(new Date(), { days: -Math.floor(Math.random() * 14) }),
          status,
        },
      });
    }

    // Update match scores based on accepted results
    const results = await prisma.matchResult.findMany({
      where: { 
        matchId: match.id,
        status: 'accepted'
      },
    });

    let player1Score = 0;
    let player2Score = 0;

    results.forEach(result => {
      if (result.player1Score < result.player2Score) {
        player1Score++;
      } else if (result.player2Score < result.player1Score) {
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
  
  // Create some matches between other users
  for (let i = 0; i < users.length; i++) {
    // Skip if this is the current user
    if (users[i].id === currentUser.id) continue;
    
    for (let j = i + 1; j < users.length; j++) {
      // Skip if this is the current user
      if (users[j].id === currentUser.id) continue;
      
      // Only create a match with 50% probability to avoid too many matches
      if (Math.random() > 0.5) continue;
      
      const match = await prisma.match.create({
        data: {
          player1Id: users[i].id,
          player2Id: users[j].id,
          title: `Match: ${users[i].name} vs ${users[j].name}`,
          startDate: add(new Date(), { days: -Math.floor(Math.random() * 30) }),
          status: Math.random() > 0.2 ? 'active' : 'completed',
        },
      });

      // Add some results to the match
      const resultCount = Math.floor(Math.random() * 3) + 1;
      for (let k = 0; k < resultCount; k++) {
        const player1Score = 70 + Math.floor(Math.random() * 8); // 70-77
        const player2Score = 70 + Math.floor(Math.random() * 8); // 70-77
        
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
        if (result.player1Score < result.player2Score) {
          player1Score++;
        } else if (result.player2Score < result.player1Score) {
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
  const currentUser = users.find(u => u.email === 'current@example.com');
  
  if (!currentUser) {
    throw new Error('Current user not found in users array');
  }

  // Create a birdie checklist competition created by the current user
  const birdieCompetition = await prisma.competition.create({
    data: {
      title: 'Summer Birdie Challenge',
      type: 'birdie-checklist',
      creatorId: currentUser.id,
      startDate: add(new Date(), { days: -30 }),
      status: 'active',
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

    // Add birdies for the current user on some holes
    if (i <= 7) { // Current user has birdies on first 7 holes
      const randomAttesterIndex = Math.floor(Math.random() * (users.length - 1));
      const attesterId = users[randomAttesterIndex].id === currentUser.id ? 
                         users[(randomAttesterIndex + 1) % users.length].id : 
                         users[randomAttesterIndex].id;
      
      await prisma.birdie.create({
        data: {
          competitionHoleId: hole.id,
          achieverId: currentUser.id,
          attesterId: attesterId,
          date: add(new Date(), { days: -Math.floor(Math.random() * 20) }),
        },
      });
    }

    // Add birdies for other users
    for (const user of users) {
      if (user.id === currentUser.id) continue; // Skip current user as we already added their birdies
      
      // Different probability of birdies for different users
      const probability = user.name === 'John Smith' ? 0.6 : 
                         user.name === 'Mike Johnson' ? 0.4 : 
                         user.name === 'Dave Wilson' ? 0.3 : 0.2;
      
      if (Math.random() < probability && i <= 10) { // Only add birdies for the first 10 holes
        const randomAttesterIndex = Math.floor(Math.random() * (users.length - 1));
        const attesterId = users[randomAttesterIndex].id === user.id ? 
                          users[(randomAttesterIndex + 1) % users.length].id : 
                          users[randomAttesterIndex].id;
        
        await prisma.birdie.create({
          data: {
            competitionHoleId: hole.id,
            achieverId: user.id,
            attesterId: attesterId,
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
      status: 'active',
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
    
    // Different completion rates for different users
    let completionRate = 0.3; // Default 30% completion rate
    
    if (user.id === currentUser.id) {
      completionRate = 0.5; // Current user has 50% completion rate
    } else if (user.name === 'John Smith') {
      completionRate = 0.4; // John has 40% completion rate
    } else if (user.name === 'Mike Johnson') {
      completionRate = 0.2; // Mike has 20% completion rate
    }
    
    for (let i = 0; i < 25; i++) {
      const completed = Math.random() < completionRate;
      
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
      status: 'active',
    },
  });

  // Add participants (current user and a subset of others)
  const participantIds = [currentUser.id, users[0].id, users[1].id];
  for (const userId of participantIds) {
    await prisma.competitionParticipant.create({
      data: {
        competitionId: birdieCompetition2.id,
        userId,
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

    // Add birdies for current user
    if (i <= 5) { // Current user has birdies on first 5 holes
      const attesterId = users[0].id;
      
      await prisma.birdie.create({
        data: {
          competitionHoleId: hole.id,
          achieverId: currentUser.id,
          attesterId,
          date: add(new Date(), { days: -Math.floor(Math.random() * 10) }),
        },
      });
    }

    // Add birdies for other participants
    for (let j = 0; j < 2; j++) { // First 2 users (excluding current user)
      const userId = users[j].id;
      
      if (i <= 3 && Math.random() > 0.5) { // 50% chance to have a birdie on first 3 holes
        const attesterId = j === 0 ? users[1].id : users[0].id;
        
        await prisma.birdie.create({
          data: {
            competitionHoleId: hole.id,
            achieverId: userId,
            attesterId,
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
      status: 'active',
    },
  });

  // Add participants (current user and a subset)
  const bingoParticipantIds = [currentUser.id, users[2].id, users[3].id];
  for (const userId of bingoParticipantIds) {
    await prisma.competitionParticipant.create({
      data: {
        competitionId: bingoCompetition2.id,
        userId,
      },
    });
  }

  // Create bingo squares for each participant
  for (const userId of bingoParticipantIds) {
    // Select 25 random challenges
    const selectedChallenges = [...bingoSquares]
      .sort(() => 0.5 - Math.random())
      .slice(0, 25);
    
    // Different completion rates
    let completionRate = 0.2; // Default 20% completion rate
    
    if (userId === currentUser.id) {
      completionRate = 0.3; // Current user has 30% completion rate
    }
    
    for (let j = 0; j < 25; j++) {
      const completed = Math.random() < completionRate;
      
      await prisma.bingoSquare.create({
        data: {
          competitionId: bingoCompetition2.id,
          userId,
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