import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sun, Moon, LayoutGrid, Wrench, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';
import { UserPreferencesModal } from './UserPreferencesModal';

type Period = 'daily' | 'weekly' | 'monthly';
type AccountMode = 'demo' | 'real';

interface UserProfileProps {
  isCollapsed?: boolean;
}

export function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('daily');
  const [accountMode] = useState<AccountMode>('demo');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const periodRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setIsPeriodOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const balance = accountMode === 'demo' ? 12987 : 0;
  const variation = accountMode === 'demo'
    ? (period === 'daily' ? 2.34 : period === 'weekly' ? 5.67 : 8.92)
    : 0;

  const periodLabels = {
    daily: 'Diário',
    weekly: 'Última Semana',
    monthly: 'Último Mês'
  };

  // Collapsed view - only avatar with dropdown
  if (isCollapsed) {
    return (
      <div className={`p-3 pb-5 border-t transition-colors ${
        theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'
      }`}>
        <div className="flex justify-center">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all overflow-hidden flex-shrink-0 ${
                theme === 'dark'
                  ? 'border-2 border-zinc-700 hover:border-zinc-600'
                  : 'border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            {isProfileOpen && (
              <div className={`absolute bottom-full left-0 mb-2 w-56 rounded-xl shadow-xl border z-[100] ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/cards');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                    }`}>
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}>
                      Cards
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/component-builder');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                    }`}>
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}>
                      Component Builder
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsPreferencesOpen(true);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                    }`}>
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}>
                      User Preferences
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      theme === 'dark' ? 'bg-zinc-900/50 hover:bg-zinc-900' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                      }`}>
                        {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                      }`}>
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </div>
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-zinc-700' : 'bg-brand-green'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        theme === 'dark' ? 'left-1' : 'left-6'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <UserPreferencesModal 
          isOpen={isPreferencesOpen} 
          onClose={() => setIsPreferencesOpen(false)} 
        />
      </div>
    );
  }

  // Expanded view - full profile with info
  return (
    <div className={`p-3 pb-5 border-t transition-colors ${
      theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-center gap-3">
        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all overflow-hidden flex-shrink-0 ${
              theme === 'dark'
                ? 'border-2 border-zinc-700 hover:border-zinc-600'
                : 'border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {isProfileOpen && (
            <div className={`absolute bottom-full mb-2 w-[253px] rounded-xl shadow-xl border z-[100] -left-[35px] ${
              theme === 'dark'
                ? 'bg-zinc-800 border-zinc-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/cards');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                  }`}>
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}>
                    Cards
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/component-builder');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                  }`}>
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}>
                    Component Builder
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsPreferencesOpen(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                  }`}>
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                  }`}>
                    User Preferences
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    theme === 'dark' ? 'bg-zinc-900/50 hover:bg-zinc-900' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-brand-green/10 text-brand-green'
                    }`}>
                      {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                    }`}>
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-brand-green'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      theme === 'dark' ? 'left-1' : 'left-6'
                    }`} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate transition-colors ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
          }`}>
            Julia Roberts
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center" ref={periodRef}>
              <span className="text-xs font-medium text-green-500">
                +{variation.toFixed(2)}%
              </span>
              <button
                onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                className={`ml-0.5 p-0.5 rounded hover:bg-opacity-10 transition-colors ${
                  theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
                }`}
              >
                <ChevronDown className="w-3 h-3 text-green-500" />
              </button>

              {isPeriodOpen && (
                <div className={`absolute bottom-full left-12 mb-2 w-36 rounded-lg shadow-lg border overflow-hidden z-50 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-white border-gray-200'
                }`}>
                  {(Object.keys(periodLabels) as Period[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPeriod(p);
                        setIsPeriodOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                        period === p
                          ? theme === 'dark'
                            ? 'bg-zinc-700 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : theme === 'dark'
                            ? 'text-zinc-300 hover:bg-zinc-700/50'
                            : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {periodLabels[p]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <UserPreferencesModal 
        isOpen={isPreferencesOpen} 
        onClose={() => setIsPreferencesOpen(false)} 
      />
    </div>
  );
}
