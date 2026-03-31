import { useEffect, useState } from "react";

type Pokemon = {
  name: string;
  url: string;
};

type PokemonDetails = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
};

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);

  // 🔥 Buscar lista de pokémons
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
      .then((res) => res.json())
      .then((data) => setPokemons(data.results));
  }, []);

  // 🔥 Buscar detalhes de um pokémon
  const handleSelectPokemon = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    setSelectedPokemon(data);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Pokédex</h1>

      {/* LISTA */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {pokemons.map((pokemon) => (
          <button
            key={pokemon.name}
            onClick={() => handleSelectPokemon(pokemon.url)}
            style={{
              padding: "10px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            {pokemon.name}
          </button>
        ))}
      </div>

      {/* DETALHES */}
      {selectedPokemon && (
        <div style={{ marginTop: "20px" }}>
          <h2>{selectedPokemon.name}</h2>
          <img src={selectedPokemon.sprites.front_default} alt={selectedPokemon.name} />
          <p>ID: {selectedPokemon.id}</p>
        </div>
      )}
    </div>
  );
}

export default App;