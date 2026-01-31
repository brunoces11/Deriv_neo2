import { useTheme } from '../../store/ThemeContext';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, PieChart, Wallet, Clock } from 'lucide-react';

export function DashboardView() {
  const { theme } = useTheme();

  return (
    <div className={`w-full h-full overflow-y-auto custom-scrollbar ${
      theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
    }`}>
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Trading Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
            Overview of your trading activity and portfolio performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Wallet className="w-5 h-5" />}
            label="Total Balance"
            value="$24,582.50"
            change="+12.5%"
            positive={true}
            theme={theme}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total Profit"
            value="$3,245.80"
            change="+8.2%"
            positive={true}
            theme={theme}
          />
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Active Positions"
            value="12"
            change="+3"
            positive={true}
            theme={theme}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="24h Volume"
            value="$8,450.20"
            change="-2.1%"
            positive={false}
            theme={theme}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard
            title="Portfolio Performance"
            icon={<BarChart3 className="w-5 h-5" />}
            theme={theme}
          >
            <div className="h-48 flex items-end gap-2 px-4">
              {[65, 45, 78, 52, 88, 72, 95, 68, 82, 75, 90, 85].map((height, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                    theme === 'dark' ? 'bg-red-500' : 'bg-red-600'
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Asset Allocation"
            icon={<PieChart className="w-5 h-5" />}
            theme={theme}
          >
            <div className="h-48 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={theme === 'dark' ? '#3b82f6' : '#60a5fa'}
                    strokeWidth="20"
                    strokeDasharray="75.4 251.2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={theme === 'dark' ? '#ef4444' : '#f87171'}
                    strokeWidth="20"
                    strokeDasharray="50.3 251.2"
                    strokeDashoffset="-75.4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={theme === 'dark' ? '#10b981' : '#34d399'}
                    strokeWidth="20"
                    strokeDasharray="37.7 251.2"
                    strokeDashoffset="-125.7"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={theme === 'dark' ? '#f59e0b' : '#fbbf24'}
                    strokeWidth="20"
                    strokeDasharray="87.8 251.2"
                    strokeDashoffset="-163.4"
                  />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4">
              <LegendItem color="blue" label="BTC" value="30%" theme={theme} />
              <LegendItem color="red" label="ETH" value="20%" theme={theme} />
              <LegendItem color="green" label="USDT" value="15%" theme={theme} />
              <LegendItem color="yellow" label="Others" value="35%" theme={theme} />
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PositionCard
            asset="BTC/USDT"
            type="Long"
            entry="$42,150"
            current="$43,280"
            pnl="+$1,130"
            positive={true}
            theme={theme}
          />
          <PositionCard
            asset="ETH/USDT"
            type="Short"
            entry="$2,240"
            current="$2,195"
            pnl="+$225"
            positive={true}
            theme={theme}
          />
          <PositionCard
            asset="SOL/USDT"
            type="Long"
            entry="$98.50"
            current="$95.20"
            pnl="-$165"
            positive={false}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, positive, theme }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  theme: 'light' | 'dark';
}) {
  return (
    <div className={`p-4 rounded-xl border ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-100'
        }`}>
          <div className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
            {icon}
          </div>
        </div>
        <span className={`text-sm font-medium flex items-center gap-1 ${
          positive
            ? 'text-green-500'
            : 'text-red-500'
        }`}>
          {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </span>
      </div>
      <div className={`text-xs mb-1 ${
        theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
      }`}>
        {label}
      </div>
      <div className={`text-xl font-bold ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, icon, children, theme }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  theme: 'light' | 'dark';
}) {
  return (
    <div className={`p-4 rounded-xl border ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}>
          {icon}
        </div>
        <h3 className={`font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function LegendItem({ color, label, value, theme }: {
  color: string;
  label: string;
  value: string;
  theme: 'light' | 'dark';
}) {
  const colorMap = {
    blue: theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600',
    red: theme === 'dark' ? 'bg-red-500' : 'bg-red-600',
    green: theme === 'dark' ? 'bg-green-500' : 'bg-green-600',
    yellow: theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-600',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${colorMap[color as keyof typeof colorMap]}`} />
      <span className={`text-xs ${
        theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
      }`}>
        {label}
      </span>
      <span className={`text-xs font-medium ml-auto ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {value}
      </span>
    </div>
  );
}

function PositionCard({ asset, type, entry, current, pnl, positive, theme }: {
  asset: string;
  type: string;
  entry: string;
  current: string;
  pnl: string;
  positive: boolean;
  theme: 'light' | 'dark';
}) {
  return (
    <div className={`p-4 rounded-xl border ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className={`font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {asset}
          </h4>
          <span className={`text-xs px-2 py-0.5 rounded ${
            type === 'Long'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          }`}>
            {type}
          </span>
        </div>
        <DollarSign className={`w-5 h-5 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'
        }`} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            Entry
          </span>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'
          }`}>
            {entry}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            Current
          </span>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-zinc-200' : 'text-gray-700'
          }`}>
            {current}
          </span>
        </div>
        <div className={`flex justify-between pt-2 border-t ${
          theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
        }`}>
          <span className={`text-xs ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
          }`}>
            P&L
          </span>
          <span className={`text-sm font-bold ${
            positive ? 'text-green-500' : 'text-red-500'
          }`}>
            {pnl}
          </span>
        </div>
      </div>
    </div>
  );
}
