import { Search, User, Home as HomeIcon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getCurrentUser, setCurrentUser, getUserData } from '../utils/storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchType: 'pokemon' | 'users';
  onSearchTypeChange: (type: 'pokemon' | 'users') => void;
}

export function Header({ searchQuery, onSearchChange, searchType, onSearchTypeChange }: HeaderProps) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const allUsers = getUserData().users;

  const handleLogout = () => {
    const data = getUserData();
    data.currentUser = null;
    localStorage.setItem('pokedex_users', JSON.stringify(data));
    navigate('/');
    window.location.reload();
  };

  const switchUser = (username: string) => {
    setCurrentUser(username);
    navigate('/profile');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-3xl">⚡</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
              Pokédex Social
            </h1>
          </Link>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchType === 'pokemon' ? 'Buscar Pokémon...' : 'Buscar usuários...'}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-32"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant={searchType === 'pokemon' ? 'default' : 'ghost'}
                  onClick={() => onSearchTypeChange('pokemon')}
                  className="h-7 text-xs"
                >
                  Pokémon
                </Button>
                <Button
                  size="sm"
                  variant={searchType === 'users' ? 'default' : 'ghost'}
                  onClick={() => onSearchTypeChange('users')}
                  className="h-7 text-xs"
                >
                  Usuários
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <HomeIcon className="h-5 w-5" />
              </Link>
            </Button>

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <span className="text-2xl">{currentUser.avatar}</span>
                    <span className="font-medium">{currentUser.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  {Object.values(allUsers).filter(u => u.username !== currentUser.username).map(user => (
                    <DropdownMenuItem
                      key={user.username}
                      onClick={() => switchUser(user.username)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{user.avatar}</span>
                      Trocar para {user.username}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
