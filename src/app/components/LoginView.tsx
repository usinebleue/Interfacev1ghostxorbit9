import { useState } from 'react';
import { Mail, Lock, Chrome } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface LoginViewProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

export function LoginView({ onLogin, onSignup }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-2xl border-2 border-purple-100">
        <div className="space-y-6">
          {/* Logo et titre */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">UB</span>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Usine Bleue AI
              </h1>
              <p className="text-lg text-gray-600">
                GhostX — Votre C-Suite AI
              </p>
            </div>
          </div>

          <Separator />

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Se connecter
            </Button>
          </form>

          {/* Lien inscription */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Pas de compte? </span>
            <button 
              onClick={onSignup}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              S'inscrire
            </button>
          </div>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">ou</span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => console.log('Google login')}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => console.log('Microsoft login')}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M13 1h10v10H13z" />
                <path fill="#7fba00" d="M1 13h10v10H1z" />
                <path fill="#ffb900" d="M13 13h10v10H13z" />
              </svg>
              Microsoft
            </Button>
          </div>

          <Separator />

          {/* Message marketing */}
          <Card className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                "6 cerveaux C-Level AI pour le prix d'un lunch d'affaires"
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-blue-600">249$</span>
                <span className="text-gray-600">/mois pour commencer</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                  🔵 CEO
                </span>
                <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full">
                  🟣 CTO
                </span>
                <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">
                  🟢 CFO
                </span>
                <span className="text-xs px-2 py-1 bg-pink-600 text-white rounded-full">
                  🩷 CMO
                </span>
                <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full">
                  🔴 CSO
                </span>
                <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded-full">
                  🟠 COO
                </span>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>
              En vous connectant, vous acceptez nos{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Conditions d'utilisation
              </a>
              {' '}et notre{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
