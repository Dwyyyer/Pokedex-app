import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { getTypeColor, formatPokemonId, capitalizeFirst } from '../utils/pokemon';
import { getCurrentUser, toggleFavorite } from '../utils/storage';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface PokemonCardProps {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export function PokemonCard({ id, name, image, types }: PokemonCardProps) {
  const currentUser = getCurrentUser();
  const isFavorite = currentUser?.favorites.includes(id) || false;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    window.dispatchEvent(new Event('favoriteToggled'));
  };

  return (
    <Link to={`/pokemon/${id}`}>
      <Card className="group relative overflow-hidden transition-all hover:scale-105 hover:shadow-lg cursor-pointer">
        {currentUser && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur hover:bg-white"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              )}
            />
          </Button>
        )}
        
        <div
          className="p-6 pb-4"
          style={{
            background: `linear-gradient(135deg, ${getTypeColor(types[0])}20 0%, ${getTypeColor(types[types.length - 1])}10 100%)`,
          }}
        >
          <div className="aspect-square flex items-center justify-center">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
            />
          </div>
        </div>

        <div className="p-4 pt-2">
          <p className="text-xs text-gray-500 font-semibold mb-1">{formatPokemonId(id)}</p>
          <h3 className="text-lg font-bold mb-2 capitalize">{name}</h3>
          <div className="flex gap-2">
            {types.map((type) => (
              <Badge
                key={type}
                className="capitalize"
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
      </Card>
    </Link>
  );
}
