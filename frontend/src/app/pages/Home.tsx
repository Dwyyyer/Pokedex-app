import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { PokemonCard } from '../components/PokemonCard';
import { UserCard } from '../components/UserCard';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { searchUsers, getCurrentUser } from '../utils/storage';

interface PokemonListItem {
  name: string;
  url: string;
}

interface SimplePokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'pokemon' | 'users'>('pokemon');
  const [pokemonList, setPokemonList] = useState<SimplePokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadPokemon(0);
  }, []);

  const loadPokemon = async (startOffset: number) => {
    try {
      if (startOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${startOffset}`
      );
      const data = await response.json();

      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon: PokemonListItem) => {
          const detailResponse = await fetch(pokemon.url);
          return detailResponse.json();
        })
      );

      if (startOffset === 0) {
        setPokemonList(pokemonDetails);
      } else {
        setPokemonList((prev) => [...prev, ...pokemonDetails]);
      }

      setHasMore(data.next !== null);
      setOffset(startOffset + limit);
    } catch (error) {
      console.error('Error loading pokemon:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPokemon(offset);
    }
  };

  const filteredPokemon = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pokemon.id.toString().includes(searchQuery)
  );

  const filteredUsers = searchUsers(searchQuery);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
      />

      <main className="container mx-auto px-4 py-8">
        {!currentUser && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo à Pokédex Social! 👋</h2>
            <p className="mb-4">
              Crie seu perfil para adicionar Pokémons favoritos, montar seu time e conectar-se com outros treinadores!
            </p>
            <Button variant="secondary" asChild>
              <a href="/profile">Criar Perfil</a>
            </Button>
          </div>
        )}

        {searchType === 'pokemon' ? (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">
                {searchQuery ? 'Resultados da Busca' : 'Todos os Pokémon'}
              </h2>
              <p className="text-gray-600">
                {searchQuery
                  ? `${filteredPokemon.length} Pokémon encontrados`
                  : `Explorando ${pokemonList.length} Pokémon`}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPokemon.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      id={pokemon.id}
                      name={pokemon.name}
                      image={pokemon.sprites.other['official-artwork'].front_default}
                      types={pokemon.types.map((t) => t.type.name)}
                    />
                  ))}
                </div>

                {!searchQuery && hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        'Carregar Mais'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Treinadores</h2>
              <p className="text-gray-600">
                {filteredUsers.length} treinadores encontrados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.username}
                  username={user.username}
                  avatar={user.avatar}
                  bio={user.bio}
                  favoriteCount={user.favorites.length}
                  teamCount={user.team.length}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
