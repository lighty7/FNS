import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, PlusCircle, CreditCard, Settings, Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

const Layout: React.FC = () => {
  const { signOut, user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/setup', icon: PlusCircle, label: 'Setup' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="h-8 w-8 text-emerald-400" />
            <h1 className="text-xl font-bold">Finance Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              icon={LogOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-emerald-400 bg-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`
                }
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;