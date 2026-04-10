import { User, UserData } from '../types/pokemon';

const STORAGE_KEY = 'pokedex_users';

// Initialize default data
const initializeData = (): UserData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Create default users with some sample data
  const defaultData: UserData = {
    currentUser: null,
    users: {
      'ash_ketchum': {
        username: 'ash_ketchum',
        avatar: '🧢',
        bio: 'Gotta catch em all! Treinador Pokémon de Pallet Town.',
        favorites: [25, 6, 143, 448, 94],
        team: [25, 6, 143, 3, 9, 94],
        createdAt: new Date().toISOString(),
      },
      'misty_water': {
        username: 'misty_water',
        avatar: '💧',
        bio: 'Líder de ginásio especialista em Pokémon do tipo Água.',
        favorites: [121, 54, 120, 116, 186],
        team: [121, 54, 120, 61, 186, 130],
        createdAt: new Date().toISOString(),
      },
      'brock_rock': {
        username: 'brock_rock',
        avatar: '🪨',
        bio: 'Criador Pokémon e especialista em tipo Pedra.',
        favorites: [95, 74, 185, 208, 213],
        team: [95, 74, 208, 377, 185, 213],
        createdAt: new Date().toISOString(),
      },
    },
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
};

export const getUserData = (): UserData => {
  return initializeData();
};

export const saveUserData = (data: UserData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getCurrentUser = (): User | null => {
  const data = getUserData();
  if (!data.currentUser) return null;
  return data.users[data.currentUser] || null;
};

export const setCurrentUser = (username: string): void => {
  const data = getUserData();
  data.currentUser = username;
  saveUserData(data);
};

export const createUser = (username: string, avatar: string, bio: string): User => {
  const data = getUserData();
  
  const newUser: User = {
    username,
    avatar,
    bio,
    favorites: [],
    team: [],
    createdAt: new Date().toISOString(),
  };
  
  data.users[username] = newUser;
  data.currentUser = username;
  saveUserData(data);
  
  return newUser;
};

export const updateUser = (username: string, updates: Partial<User>): void => {
  const data = getUserData();
  if (data.users[username]) {
    data.users[username] = { ...data.users[username], ...updates };
    saveUserData(data);
  }
};

export const toggleFavorite = (pokemonId: number): void => {
  const data = getUserData();
  if (!data.currentUser) return;
  
  const user = data.users[data.currentUser];
  if (user.favorites.includes(pokemonId)) {
    user.favorites = user.favorites.filter(id => id !== pokemonId);
  } else {
    user.favorites.push(pokemonId);
  }
  
  saveUserData(data);
};

export const addToTeam = (pokemonId: number): boolean => {
  const data = getUserData();
  if (!data.currentUser) return false;
  
  const user = data.users[data.currentUser];
  if (user.team.length >= 6) return false;
  if (user.team.includes(pokemonId)) return false;
  
  user.team.push(pokemonId);
  saveUserData(data);
  return true;
};

export const removeFromTeam = (pokemonId: number): void => {
  const data = getUserData();
  if (!data.currentUser) return;
  
  const user = data.users[data.currentUser];
  user.team = user.team.filter(id => id !== pokemonId);
  saveUserData(data);
};

export const getAllUsers = (): User[] => {
  const data = getUserData();
  return Object.values(data.users);
};

export const searchUsers = (query: string): User[] => {
  const users = getAllUsers();
  const lowerQuery = query.toLowerCase();
  return users.filter(user => 
    user.username.toLowerCase().includes(lowerQuery) ||
    user.bio.toLowerCase().includes(lowerQuery)
  );
};
