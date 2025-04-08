/**
 * API client for interacting with the backend
 */

// Base API URL - empty for same-origin API routes
const API_BASE = '';

// Generic fetch function with error handling
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred while fetching data');
  }

  return data as T;
}

// User API functions
export const userAPI = {
  // Get all users
  getUsers: () => fetchAPI<any[]>('/api/users'),
  
  // Get a specific user
  getUser: (id: string) => fetchAPI<any>(`/api/users/${id}`),
  
  // Create a new user
  createUser: (userData: any) => fetchAPI<any>('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update a user
  updateUser: (id: string, userData: any) => fetchAPI<any>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Get user's friends
  getUserFriends: (id: string) => fetchAPI<any[]>(`/api/users/${id}/friends`),
  
  // Add a friend
  addFriend: (userId: string, friendId: string) => fetchAPI<any>(`/api/users/${userId}/friends`, {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  }),
};

// Match API functions
export const matchAPI = {
  // Get all matches
  getMatches: (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return fetchAPI<any[]>(`/api/matches${query}`);
  },
  
  // Get a specific match
  getMatch: (id: string) => fetchAPI<any>(`/api/matches/${id}`),
  
  // Create a new match
  createMatch: (matchData: any) => fetchAPI<any>('/api/matches', {
    method: 'POST',
    body: JSON.stringify(matchData),
  }),
  
  // Update a match
  updateMatch: (id: string, matchData: any) => fetchAPI<any>(`/api/matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(matchData),
  }),
  
  // Get match results
  getMatchResults: (id: string) => fetchAPI<any[]>(`/api/matches/${id}/results`),
  
  // Add a match result
  addMatchResult: (id: string, resultData: any) => fetchAPI<any>(`/api/matches/${id}/results`, {
    method: 'POST',
    body: JSON.stringify(resultData),
  }),
};

// Competition API functions
export const competitionAPI = {
  // Get all competitions
  getCompetitions: (userId?: string, type?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (type) params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI<any[]>(`/api/competitions${query}`);
  },
  
  // Get a specific competition
  getCompetition: (id: string) => fetchAPI<any>(`/api/competitions/${id}`),
  
  // Create a new competition
  createCompetition: (competitionData: any) => fetchAPI<any>('/api/competitions', {
    method: 'POST',
    body: JSON.stringify(competitionData),
  }),
  
  // Update a competition
  updateCompetition: (id: string, competitionData: any) => fetchAPI<any>(`/api/competitions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(competitionData),
  }),
  
  // Add a birdie to a competition
  addBirdie: (id: string, birdieData: any) => fetchAPI<any>(`/api/competitions/${id}/birdies`, {
    method: 'POST',
    body: JSON.stringify(birdieData),
  }),
  
  // Get bingo squares for a competition
  getBingoSquares: (id: string, userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return fetchAPI<any[]>(`/api/competitions/${id}/bingo${query}`);
  },
  
  // Update a bingo square
  updateBingoSquare: (id: string, squareData: any) => fetchAPI<any>(`/api/competitions/${id}/bingo`, {
    method: 'PUT',
    body: JSON.stringify(squareData),
  }),
};