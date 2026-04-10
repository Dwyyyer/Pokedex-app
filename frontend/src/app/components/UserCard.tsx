import { Link } from 'react-router';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface UserCardProps {
  username: string;
  avatar: string;
  bio: string;
  favoriteCount: number;
  teamCount: number;
}

export function UserCard({ username, avatar, bio, favoriteCount, teamCount }: UserCardProps) {
  return (
    <Link to={`/user/${username}`}>
      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{avatar}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{username}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bio}</p>
            <div className="flex gap-2">
              <Badge variant="secondary">
                ❤️ {favoriteCount} favoritos
              </Badge>
              <Badge variant="secondary">
                ⚔️ {teamCount} no time
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
