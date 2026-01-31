import { useState } from 'react';
import { BarChart3, ChevronDown } from 'lucide-react';

type Timeframe = '1D' | '1W' | '1M';

interface BarData {
  performance: number;
  growth: number;
  label: string;
  perfValue: string;
  growthValue: string;
}

const DATA_BY_TIMEFRAME: Record<Timeframe, BarData[]> = {
  '1D': [
    { performance: 45, growth: 62, label: '00:00', perfValue: '-$120', growthValue: '+$180' },
    { performance: 52, growth: 48, label: '02:00', perfValue: '-$85', growthValue: '+$95' },
    { performance: 38, growth: 71, label: '04:00', perfValue: '-$142', growthValue: '+$210' },
    { performance: 65, growth: 55, label: '06:00', perfValue: '-$45', growthValue: '+$125' },
    { performance: 42, growth: 78, label: '08:00', perfValue: '-$98', growthValue: '+$285' },
    { performance: 58, growth: 82, label: '10:00', perfValue: '-$62', growthValue: '+$320' },
    { performance: 35, growth: 68, label: '12:00', perfValue: '-$155', growthValue: '+$195' },
    { performance: 48, growth: 75, label: '14:00', perfValue: '-$88', growthValue: '+$245' },
    { performance: 55, growth: 85, label: '16:00', perfValue: '-$58', growthValue: '+$365' },
    { performance: 42, growth: 72, label: '18:00', perfValue: '-$102', growthValue: '+$218' },
    { performance: 38, growth: 65, label: '20:00', perfValue: '-$138', growthValue: '+$175' },
    { performance: 50, growth: 70, label: '22:00', perfValue: '-$75', growthValue: '+$205' },
  ],
  '1W': [
    { performance: 65, growth: 78, label: 'Mon', perfValue: '-$450', growthValue: '+$820' },
    { performance: 45, growth: 85, label: 'Tue', perfValue: '-$680', growthValue: '+$1,150' },
    { performance: 78, growth: 62, label: 'Wed', perfValue: '-$280', growthValue: '+$520' },
    { performance: 52, growth: 88, label: 'Thu', perfValue: '-$590', growthValue: '+$1,380' },
    { performance: 88, growth: 72, label: 'Fri', perfValue: '-$150', growthValue: '+$680' },
    { performance: 72, growth: 95, label: 'Sat', perfValue: '-$340', growthValue: '+$1,850' },
    { performance: 95, growth: 68, label: 'Sun', perfValue: '-$65', growthValue: '+$580' },
  ],
  '1M': [
    { performance: 55, growth: 72, label: 'Week 1', perfValue: '-$1,250', growthValue: '+$2,450' },
    { performance: 42, growth: 85, label: 'Week 2', perfValue: '-$1,890', growthValue: '+$3,680' },
    { performance: 68, growth: 78, label: 'Week 3', perfValue: '-$820', growthValue: '+$2,920' },
    { performance: 75, growth: 92, label: 'Week 4', perfValue: '-$580', growthValue: '+$4,150' },
  ],
};

const SUMMARY_BY_TIMEFRAME: Record<Timeframe, { totalPerf: string; totalGrowth: string; net: string; netPositive: boolean }> = {
  '1D': { totalPerf: '-$1,168', totalGrowth: '+$2,618', net: '+$1,450', netPositive: true },
  '1W': { totalPerf: '-$2,555', totalGrowth: '+$6,980', net: '+$4,425', netPositive: true },
  '1M': { totalPerf: '-$4,540', totalGrowth: '+$13,200', net: '+$8,660', netPositive: true },
};

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
};

interface PerformanceGrowthCardProps {
  theme: 'light' | 'dark';
}

export function PerformanceGrowthCard({ theme }: PerformanceGrowthCardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const data = DATA_BY_TIMEFRAME[timeframe];
  const summary = SUMMARY_BY_TIMEFRAME[timeframe];

  return (
    <div className={`p-4 rounded-xl border ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className={`font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Portfolio Performance / Growth
          </h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {TIMEFRAME_LABELS[timeframe]}
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className={`absolute right-0 top-full mt-1 z-20 rounded-lg shadow-lg border overflow-hidden ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-gray-200'
              }`}>
                {(['1D', '1W', '1M'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      timeframe === tf
                        ? theme === 'dark'
                          ? 'bg-zinc-700 text-white'
                          : 'bg-gray-100 text-gray-900'
                        : theme === 'dark'
                          ? 'text-zinc-300 hover:bg-zinc-700/50'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {TIMEFRAME_LABELS[tf]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 px-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${theme === 'dark' ? 'bg-red-500' : 'bg-red-600'}`} />
          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            Loss {summary.totalPerf}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${theme === 'dark' ? 'bg-green-500' : 'bg-green-600'}`} />
          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            Growth {summary.totalGrowth}
          </span>
        </div>
        <div className="ml-auto">
          <span className={`text-sm font-semibold ${summary.netPositive ? 'text-green-500' : 'text-red-500'}`}>
            Net: {summary.net}
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end gap-1 px-4 pb-6 relative">
        {data.map((bar, i) => (
          <div key={i} className="flex-1 flex gap-0.5 items-end h-full group relative">
            <div
              className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                theme === 'dark' ? 'bg-red-500' : 'bg-red-600'
              }`}
              style={{ height: `${bar.performance}%` }}
            />
            <div
              className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                theme === 'dark' ? 'bg-green-500' : 'bg-green-600'
              }`}
              style={{ height: `${bar.growth}%` }}
            />
            <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
            }`}>
              {bar.label}
            </div>
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
              theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-gray-800 text-white'
            }`}>
              <div className="text-red-400">{bar.perfValue}</div>
              <div className="text-green-400">{bar.growthValue}</div>
            </div>
          </div>
        ))}

        <div className={`absolute bottom-5 left-4 right-4 h-px ${
          theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
        }`} />
      </div>
    </div>
  );
}
