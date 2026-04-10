import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { getCurrentUser, createUser, updateUser } from '../utils/storage';
import { toast } from 'sonner';
import { Loader2, Heart, Users } from 'lucide-react';
import { Link } from 'react-router';

interface SimplePokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

const AVATAR_OPTIONS = ['🧢', '👨‍🦰', '👩‍🦰', '🧑', '👦', '👧', '🧔', '👨‍🎤', '👩‍🎤', '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️', '⚡', '🔥', '💧', '🌿'];

export function Profile() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'pokemon' | 'users'>('pokemon');
  
  const [isCreatingProfile, setIsCreatingProfile] = useState(!currentUser);
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || AVATAR_OPTIONS[0]);
  
  const [favoritePokemon, setFavoritePokemon] = useState<SimplePokemon[]>([]);
  const [teamPokemon, setTeamPokemon] = useState<SimplePokemon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserPokemon();
    }

    const handleUpdate = () => {
      if (currentUser) {
        loadUserPokemon();
      }
    };

    window.addEventListener('favoriteToggled', handleUpdate);
    window.addEventListener('teamUpdated', handleUpdate);

    return () => {
      window.removeEventListener('favoriteToggled', handleUpdate);
      window.removeEventListener('teamUpdated', handleUpdate);
    };
  }, [currentUser]);

  const loadUserPokemon = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Load favorites
      const favPromises = currentUser.favorites.map((id) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
      );
      const favs = await Promise.all(favPromises);
      setFavoritePokemon(favs);

      // Load team
      const teamPromises = currentUser.team.map((id) =>
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

  const handleSaveProfile = () => {
    if (!username.trim()) {
      toast.error('Digite um nome de usuário');
      return;
    }

    if (isCreatingProfile) {
      createUser(username.trim(), selectedAvatar, bio.trim());
      toast.success('Perfil criado com sucesso!');
      navigate('/');
      window.location.reload();
    } else {
      updateUser(currentUser!.username, {
        bio: bio.trim(),
        avatar: selectedAvatar,
      });
      toast.success('Perfil atualizado!');
      window.location.reload();
    }
  };

  if (isCreatingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />
        
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-6">Criar Perfil</h1>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu nome de usuário"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Avatar</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-3xl p-2 rounded border-2 transition-all hover:scale-110 ${
                        selectedAvatar === avatar
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveProfile} className="w-full" size="lg">
                Criar Perfil
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return null;
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
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="text-7xl">{currentUser.avatar}</div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{currentUser.username}</h1>
                  <p className="text-gray-600 max-w-xl">{currentUser.bio}</p>
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{currentUser.favorites.length} Favoritos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{currentUser.team.length}/6 no Time</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsCreatingProfile(true)}>Editar Perfil</Button>
            </div>
          </Card>

          {/* Team */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Meu Time</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : teamPokemon.length > 0 ? (
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
                {[...Array(6 - teamPokemon.length)].map((_, i) => (
                  <Card key={`empty-${i}`} className="p-4 border-dashed">
                    <div className="w-full h-32 flex items-center justify-center text-gray-400">
                      <Plus className="h-8 w-8" />
                    </div>
                    <p className="text-center text-gray-400 text-sm mt-2">Vazio</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-gray-500">
                <p>Você ainda não adicionou Pokémon ao seu time.</p>
                <p className="text-sm mt-2">Explore a Pokédex e adicione seus favoritos!</p>
              </Card>
            )}
          </div>

          {/* Favorites */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Pokémon Favoritos</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : favoritePokemon.length > 0 ? (
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
                <p>Você ainda não tem Pokémon favoritos.</p>
                <p className="text-sm mt-2">Clique no ❤️ nos cards dos Pokémon para adicioná-los!</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
