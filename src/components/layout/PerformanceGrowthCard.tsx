import { useState } from 'react';
import { BarChart3, ChevronDown } from 'lucide-react';

type Timeframe = '1D' | '1W' | '1M' | '1Y';

interface BarData {
  performance: number;
  growth: number;
  label: string;
  perfValue: string;
  growthValue: string;
}

const DATA_BY_TIMEFRAME: Record<Timeframe, BarData[]> = {
  '1D': [
    { performance: 35, growth: 42, label: '00:00', perfValue: '+$85', growthValue: '+$120' },
    { performance: 28, growth: 45, label: '02:00', perfValue: '-$42', growthValue: '+$135' },
    { performance: 45, growth: 48, label: '04:00', perfValue: '+$112', growthValue: '+$148' },
    { performance: 22, growth: 52, label: '06:00', perfValue: '-$28', growthValue: '+$165' },
    { performance: 52, growth: 55, label: '08:00', perfValue: '+$145', growthValue: '+$182' },
    { performance: 38, growth: 58, label: '10:00', perfValue: '+$78', growthValue: '+$195' },
    { performance: 48, growth: 54, label: '12:00', perfValue: '+$125', growthValue: '+$175' },
    { performance: 32, growth: 62, label: '14:00', perfValue: '-$35', growthValue: '+$218' },
    { performance: 55, growth: 65, label: '16:00', perfValue: '+$168', growthValue: '+$235' },
    { performance: 42, growth: 68, label: '18:00', perfValue: '+$95', growthValue: '+$252' },
    { performance: 25, growth: 64, label: '20:00', perfValue: '-$55', growthValue: '+$228' },
    { performance: 58, growth: 72, label: '22:00', perfValue: '+$185', growthValue: '+$285' },
  ],
  '1W': [
    { performance: 42, growth: 48, label: 'Mon', perfValue: '+$320', growthValue: '+$680' },
    { performance: 28, growth: 55, label: 'Tue', perfValue: '-$185', growthValue: '+$820' },
    { performance: 55, growth: 62, label: 'Wed', perfValue: '+$425', growthValue: '+$980' },
    { performance: 35, growth: 58, label: 'Thu', perfValue: '+$145', growthValue: '+$890' },
    { performance: 62, growth: 68, label: 'Fri', perfValue: '+$580', growthValue: '+$1,150' },
    { performance: 45, growth: 75, label: 'Sat', perfValue: '+$285', growthValue: '+$1,380' },
    { performance: 52, growth: 82, label: 'Sun', perfValue: '+$395', growthValue: '+$1,620' },
  ],
  '1M': [
    { performance: 45, growth: 52, label: 'Week 1', perfValue: '+$1,250', growthValue: '+$3,200' },
    { performance: 32, growth: 65, label: 'Week 2', perfValue: '-$420', growthValue: '+$4,850' },
    { performance: 58, growth: 78, label: 'Week 3', perfValue: '+$1,680', growthValue: '+$6,420' },
    { performance: 52, growth: 92, label: 'Week 4', perfValue: '+$1,450', growthValue: '+$8,150' },
  ],
  '1Y': [
    { performance: 48, growth: 55, label: 'Jan', perfValue: '+$4,250', growthValue: '+$12,500' },
    { performance: 35, growth: 62, label: 'Feb', perfValue: '+$2,180', growthValue: '+$15,820' },
    { performance: 55, growth: 68, label: 'Mar', perfValue: '+$6,420', growthValue: '+$18,950' },
    { performance: 42, growth: 72, label: 'Apr', perfValue: '+$3,850', growthValue: '+$21,680' },
    { performance: 62, growth: 78, label: 'May', perfValue: '+$8,120', growthValue: '+$25,420' },
    { performance: 38, growth: 82, label: 'Jun', perfValue: '+$2,950', growthValue: '+$28,150' },
    { performance: 52, growth: 85, label: 'Jul', perfValue: '+$5,680', growthValue: '+$31,280' },
    { performance: 45, growth: 88, label: 'Aug', perfValue: '+$4,250', growthValue: '+$34,820' },
    { performance: 58, growth: 92, label: 'Sep', perfValue: '+$7,150', growthValue: '+$38,650' },
    { performance: 48, growth: 95, label: 'Oct', perfValue: '+$5,420', growthValue: '+$42,180' },
    { performance: 55, growth: 98, label: 'Nov', perfValue: '+$6,850', growthValue: '+$45,920' },
    { performance: 62, growth: 100, label: 'Dec', perfValue: '+$8,320', growthValue: '+$50,000' },
  ],
};

const SUMMARY_BY_TIMEFRAME: Record<Timeframe, { totalPerf: string; totalGrowth: string; net: string; netPositive: boolean }> = {
  '1D': { totalPerf: '+$833', totalGrowth: '+$2,338', net: '+$3,171', netPositive: true },
  '1W': { totalPerf: '+$1,965', totalGrowth: '+$7,520', net: '+$9,485', netPositive: true },
  '1M': { totalPerf: '+$3,960', totalGrowth: '+$22,620', net: '+$26,580', netPositive: true },
  '1Y': { totalPerf: '+$65,440', totalGrowth: '+$385,370', net: '+$450,810', netPositive: true },
};

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '1D': '1D',
  '1W': '1W',
  '1M': '1M',
  '1Y': '1Y',
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
                {(['1D', '1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
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
          <div className={`w-3 h-3 rounded ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'}`} />
          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            Performance {summary.totalPerf}
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
            Total: {summary.net}
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end gap-1 px-4 pb-6 relative">
        {data.map((bar, i) => (
          <div key={i} className="flex-1 flex gap-0.5 items-end h-full group relative">
            <div
              className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
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
              <div className="text-blue-400">{bar.perfValue}</div>
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
