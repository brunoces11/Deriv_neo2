import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';

type Period = 'daily' | 'weekly' | 'monthly';
type AccountMode = 'demo' | 'real';

export function AccountHeader() {
  const { theme, toggleTheme } = useTheme();
  const [period, setPeriod] = useState<Period>('daily');
  const [accountMode, setAccountMode] = useState<AccountMode>('demo');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <div className={`px-6 py-4 border-b backdrop-blur-sm transition-colors ${
      theme === 'dark'
        ? 'border-zinc-800/50 bg-zinc-900/50'
        : 'border-gray-200 bg-white/50'
    }`}>
      <div className="flex items-start justify-end">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-1">
            <h3 className={`text-[15px] font-medium transition-colors ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              John Trader
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
                +{variation.toFixed(2)}%
                <div className="relative" ref={periodRef}>
                  <button
                    onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                    className={`ml-0.5 p-0.5 rounded hover:bg-opacity-10 transition-colors ${
                      theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
                    }`}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {isPeriodOpen && (
                    <div className={`absolute top-full left-0 mt-1 w-36 rounded-lg shadow-lg border overflow-hidden z-50 ${
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
              </span>

              <span className={`text-lg font-semibold transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden ${
                theme === 'dark'
                  ? 'border-[3px] border-white shadow-lg hover:shadow-xl'
                  : 'border-[3px] border-white shadow-lg hover:shadow-xl'
              }`}
              style={{
                boxShadow: theme === 'dark'
                  ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
              }}
            >
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            {isProfileOpen && (
              <div className={`absolute top-full right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50 ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-3 border-b ${
                  theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className={`font-medium text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        John Trader
                      </h4>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                      }`}>
                        john.trader@example.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
                      }`}>
                        Account Mode
                      </span>
                    </div>
                    <button
                      onClick={() => setAccountMode(accountMode === 'demo' ? 'real' : 'demo')}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        accountMode === 'demo'
                          ? 'bg-brand-green'
                          : theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-200 flex items-center justify-center ${
                        accountMode === 'demo' ? 'left-1' : 'left-8'
                      }`}>
                        <span className="text-[8px] font-bold text-gray-700">
                          {accountMode === 'demo' ? 'D' : 'R'}
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-50'
                  }`}>
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
                    <button
                      onClick={toggleTheme}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-zinc-700' : 'bg-brand-green'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        theme === 'dark' ? 'left-1' : 'left-6'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
