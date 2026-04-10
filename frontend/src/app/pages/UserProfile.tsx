import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getUserData } from '../utils/storage';
import { Heart, Users, ArrowLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { User } from '../types/pokemon';

interface SimplePokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

export function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'pokemon' | 'users'>('pokemon');
  const [favoritePokemon, setFavoritePokemon] = useState<SimplePokemon[]>([]);
  const [teamPokemon, setTeamPokemon] = useState<SimplePokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [username]);

  const loadUser = async () => {
    const data = getUserData();
    const foundUser = data.users[username || ''];

    if (!foundUser) {
      setLoading(false);
      return;
    }

    setUser(foundUser);

    try {
      // Load favorites
      const favPromises = foundUser.favorites.map((id) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
      );
      const favs = await Promise.all(favPromises);
      setFavoritePokemon(favs);

      // Load team
      const teamPromises = foundUser.team.map((id) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
      );
      const team = await Promise.all(teamPromises);
      setTeamPokemon(team);
    } catch (error) {
      console.error('Error loading pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Usuário não encontrado</h2>
            <p className="text-gray-600 mb-4">O usuário que você procura não existe.</p>
            <Button asChild>
              <Link to="/">Voltar para Home</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
      />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="text-7xl">{user.avatar}</div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
                <p className="text-gray-600 max-w-xl">{user.bio}</p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">{user.favorites.length} Favoritos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{user.team.length}/6 no Time</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Team */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Time de {user.username}</h2>
            {teamPokemon.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {teamPokemon.map((pokemon) => (
                  <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all group cursor-pointer">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                        alt={pokemon.name}
                        className="w-full h-32 object-contain group-hover:scale-110 transition-transform"
                      />
                      <p className="text-center font-semibold capitalize mt-2">{pokemon.name}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-gray-500">
                <p>Este usuário ainda não montou um time.</p>
              </Card>
            )}
          </div>

          {/* Favorites */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Pokémon Favoritos</h2>
            {favoritePokemon.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favoritePokemon.map((pokemon) => (
                  <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all group cursor-pointer">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                        alt={pokemon.name}
                        className="w-full h-32 object-contain group-hover:scale-110 transition-transform"
                      />
                      <p className="text-center font-semibold capitalize mt-2">{pokemon.name}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-gray-500">
                <p>Este usuário ainda não tem Pokémon favoritos.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
