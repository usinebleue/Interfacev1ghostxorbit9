import { Bell, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function TopBar() {
  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 font-medium">Plateforme de Direction Augmentée</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
            3
          </Badge>
        </Button>
        
        <Button variant="ghost" size="icon">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </Button>
      </div>
    </div>
  );
}