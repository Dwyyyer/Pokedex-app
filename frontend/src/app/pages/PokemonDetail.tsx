import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Heart, Plus, Minus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  getTypeColor,
  formatPokemonId,
  capitalizeFirst,
  formatStatName,
  formatWeight,
  formatHeight,
  getTypeWeaknesses,
  getTypeResistances,
} from '../utils/pokemon';
import { getCurrentUser, toggleFavorite, addToTeam, removeFromTeam } from '../utils/storage';
import { toast } from 'sonner';
import { Pokemon, PokemonSpecies, EvolutionChain } from '../types/pokemon';
import { cn } from '../components/ui/utils';

export function PokemonDetail() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'pokemon' | 'users'>('pokemon');

  const currentUser = getCurrentUser();
  const isFavorite = currentUser?.favorites.includes(Number(id)) || false;
  const isInTeam = currentUser?.team.includes(Number(id)) || false;

  useEffect(() => {
    loadPokemonDetail();
  }, [id]);

  const loadPokemonDetail = async () => {
    try {
      setLoading(true);

      // Load pokemon data
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const pokemonData = await pokemonResponse.json();
      setPokemon(pokemonData);

      // Load species data
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      const speciesData = await speciesResponse.json();
      setSpecies(speciesData);

      // Load evolution chain
      if (speciesData.evolution_chain) {
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData: EvolutionChain = await evolutionResponse.json();
        const chain = parseEvolutionChain(evolutionData.chain);
        setEvolutionChain(chain);
      }
    } catch (error) {
      console.error('Error loading pokemon detail:', error);
      toast.error('Erro ao carregar detalhes do Pokémon');
    } finally {
      setLoading(false);
    }
  };

  const parseEvolutionChain = (chain: any): any[] => {
    const evolutions: any[] = [];
    let current = chain;

    while (current) {
      const idFromUrl = current.species.url.split('/').filter(Boolean).pop();
      evolutions.push({
        id: Number(idFromUrl),
        name: current.species.name,
      });

      current = current.evolves_to[0];
    }

    return evolutions;
  };

  const handleToggleFavorite = () => {
    if (!currentUser) {
      toast.error('Faça login para adicionar favoritos');
      return;
    }
    toggleFavorite(Number(id));
    window.dispatchEvent(new Event('favoriteToggled'));
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  const handleToggleTeam = () => {
    if (!currentUser) {
      toast.error('Faça login para montar seu time');
      return;
    }

    if (isInTeam) {
      removeFromTeam(Number(id));
      toast.success('Removido do time');
    } else {
      const success = addToTeam(Number(id));
      if (success) {
        toast.success('Adicionado ao time');
      } else {
        toast.error('Seu time já está completo (máximo 6 Pokémon)');
      }
    }
    window.dispatchEvent(new Event('teamUpdated'));
  };

  const navigatePokemon = (direction: 'prev' | 'next') => {
    const currentId = Number(id);
    const newId = direction === 'prev' ? currentId - 1 : currentId + 1;
    if (newId > 0 && newId <= 1025) {
      window.location.href = `/pokemon/${newId}`;
    }
  };

  if (loading || !pokemon) {
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

  const types = pokemon.types.map((t) => t.type.name);
  const mainType = types[0];
  const weaknesses = getTypeWeaknesses(types);
  const resistances = getTypeResistances(types);
  const description = species?.flavor_text_entries.find((entry) => entry.language.name === 'en')
    ?.flavor_text.replace(/\f/g, ' ');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
      />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigatePokemon('prev')}
              disabled={Number(id) <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigatePokemon('next')}
              disabled={Number(id) >= 1025}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[400px,1fr] gap-6">
          {/* Left Side - Pokemon Image Card */}
          <div>
            <Card 
              className="sticky top-24 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${getTypeColor(mainType)}40 0%, ${getTypeColor(mainType)}20 100%)`,
              }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-1">{formatPokemonId(pokemon.id)}</p>
                    <h1 className="text-4xl font-bold capitalize mb-3">{pokemon.name}</h1>
                    <div className="flex gap-2">
                      {types.map((type) => (
                        <Badge
                          key={type}
                          className="capitalize font-semibold px-3 py-1"
                          style={{
                            backgroundColor: getTypeColor(type),
                            color: 'white',
                          }}
                        >
                          {capitalizeFirst(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {currentUser && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant={isFavorite ? 'default' : 'outline'}
                        onClick={handleToggleFavorite}
                        className={cn(isFavorite && 'bg-red-500 hover:bg-red-600 border-red-500')}
                      >
                        <Heart className={cn('h-4 w-4', isFavorite && 'fill-white')} />
                      </Button>
                      <Button
                        size="icon"
                        variant={isInTeam ? 'default' : 'outline'}
                        onClick={handleToggleTeam}
                        className={cn(isInTeam && 'bg-blue-500 hover:bg-blue-600 border-blue-500')}
                      >
                        {isInTeam ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pokemon Image */}
                <div className="relative aspect-square mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={
                        pokemon.sprites.other['official-artwork'].front_default ||
                        pokemon.sprites.other.home.front_default
                      }
                      alt={pokemon.name}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Physical Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                    <p className="text-xs text-gray-600 font-medium mb-1">Peso</p>
                    <p className="text-2xl font-bold">{formatWeight(pokemon.weight)}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                    <p className="text-xs text-gray-600 font-medium mb-1">Altura</p>
                    <p className="text-2xl font-bold">{formatHeight(pokemon.height)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Details */}
          <div>
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="about">Sobre</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="evolution">Evolução</TabsTrigger>
                <TabsTrigger value="moves">Habilidades</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Sobre {capitalizeFirst(pokemon.name)}</h3>
                  
                  {description && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{description}</p>
                    </div>
                  )}

                  {/* Type Effectiveness */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <span className="text-red-500">⚠️</span> Fraco Contra
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {weaknesses.map((type) => (
                          <Badge
                            key={type}
                            className="capitalize text-sm px-4 py-2"
                            style={{
                              backgroundColor: getTypeColor(type),
                              color: 'white',
                            }}
                          >
                            {capitalizeFirst(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <span className="text-green-500">🛡️</span> Resistente A
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {resistances.map((type) => (
                          <Badge
                            key={type}
                            className="capitalize text-sm px-4 py-2"
                            style={{
                              backgroundColor: getTypeColor(type),
                              color: 'white',
                            }}
                          >
                            {capitalizeFirst(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Estatísticas Base</h3>
                  <div className="space-y-5">
                    {pokemon.stats.map((stat) => {
                      const percentage = (stat.base_stat / 255) * 100;
                      const statColor = 
                        stat.base_stat >= 100 ? 'bg-green-500' :
                        stat.base_stat >= 60 ? 'bg-blue-500' :
                        'bg-gray-400';
                      
                      return (
                        <div key={stat.stat.name}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700 min-w-[100px]">
                              {formatStatName(stat.stat.name)}
                            </span>
                            <span className="text-xl font-bold ml-4 min-w-[50px] text-right">
                              {stat.base_stat}
                            </span>
                            <div className="flex-1 ml-4">
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${statColor}`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Stats */}
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Evolution Tab */}
              <TabsContent value="evolution">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Cadeia Evolutiva</h3>
                  {evolutionChain.length > 1 ? (
                    <div className="flex items-center justify-center flex-wrap gap-6">
                      {evolutionChain.map((evo, index) => (
                        <div key={evo.id} className="flex items-center gap-6">
                          <Link to={`/pokemon/${evo.id}`} className="group">
                            <Card className={cn(
                              "p-6 transition-all hover:scale-105 hover:shadow-xl",
                              evo.id === pokemon.id && "ring-2 ring-blue-500 shadow-lg"
                            )}>
                              <div className="w-32 h-32 mb-3">
                                <img
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                                  alt={evo.name}
                                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                />
                              </div>
                              <p className="text-center font-bold capitalize text-lg">{evo.name}</p>
                              <p className="text-center text-sm text-gray-500">{formatPokemonId(evo.id)}</p>
                            </Card>
                          </Link>
                          {index < evolutionChain.length - 1 && (
                            <div className="text-3xl text-gray-400 font-bold">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">Este Pokémon não possui evoluções.</p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Moves Tab */}
              <TabsContent value="moves">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Habilidades</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pokemon.abilities.map((ability) => (
                      <div
                        key={ability.ability.name}
                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200"
                      >
                        <p className="font-bold capitalize text-lg">
                          {ability.ability.name.replace('-', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}