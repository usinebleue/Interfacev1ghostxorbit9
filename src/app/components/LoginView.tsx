import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

// Credentials autorisés (demo / dev)
const VALID_USERS: Record<string, string> = {
  "cfugere@usinebleue.ai": "GhostX2026!",
  "carl@ghostx.ai": "GhostX2026!",
  "demo@ghostx.ai": "DemoGhostX!",
};

interface LoginViewProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Petit délai pour le feel
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const validPassword = VALID_USERS[normalizedEmail];

      if (validPassword && validPassword === password) {
        onLogin?.();
      } else {
        setError('Email ou mot de passe invalide.');
      }
      setLoading(false);
    }, 400);
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
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

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
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">CEO</span>
                <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full">CTO</span>
                <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">CFO</span>
                <span className="text-xs px-2 py-1 bg-pink-600 text-white rounded-full">CMO</span>
                <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full">CSO</span>
                <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded-full">COO</span>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>Acces reserve — GhostX par Usine Bleue AI</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
