import { useTheme } from '../../store/ThemeContext';
import { ChevronRight } from 'lucide-react';

// Platform data
interface Platform {
  id: string;
  icon: string;
  name: string;
  description: string;
  iconBg: string;
  iconText: string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'deriv-trader',
    icon: 'DT',
    name: 'Deriv Trader',
    description: 'The options and multipliers trading platform',
    iconBg: 'bg-zinc-500',
    iconText: 'text-white',
  },
  {
    id: 'deriv-bot',
    icon: 'DB',
    name: 'Deriv Bot',
    description: 'The ultimate bot trading platform',
    iconBg: 'bg-zinc-500',
    iconText: 'text-white',
  },
  {
    id: 'smart-trader',
    icon: 'ST',
    name: 'SmartTrader',
    description: 'The legacy options trading platform',
    iconBg: 'bg-zinc-500',
    iconText: 'text-white',
  },
  {
    id: 'deriv-go',
    icon: 'GO',
    name: 'Deriv GO',
    description: 'The mobile app for trading multipliers and accumulators',
    iconBg: 'bg-zinc-500',
    iconText: 'text-white',
  },
];

// MT5 Account data
interface MT5Account {
  id: string;
  name: string;
  shortName: string;
  description: string;
  isNew?: boolean;
  iconBg: string;
}

const MT5_ACCOUNTS: MT5Account[] = [
  {
    id: 'standard',
    name: 'Standard',
    shortName: 'STD',
    description: 'CFDs on derived and financial instruments',
    iconBg: 'bg-zinc-500',
  },
  {
    id: 'financial',
    name: 'Financial',
    shortName: 'FIN',
    description: 'CFDs on financial instruments',
    iconBg: 'bg-zinc-500',
  },
  {
    id: 'financial-stp',
    name: 'Financial STP',
    shortName: 'STP',
    description: 'Direct access to market prices',
    iconBg: 'bg-zinc-500',
  },
  {
    id: 'swap-free',
    name: 'Swap-Free',
    shortName: 'SWF',
    description: 'Swap-free CFDs on selected financial and derived instruments',
    iconBg: 'bg-zinc-500',
  },
  {
    id: 'zero-spread',
    name: 'Zero Spread',
    shortName: 'ZRS',
    description: 'Zero spread CFDs on financial and derived instruments',
    iconBg: 'bg-zinc-500',
  },
  {
    id: 'gold',
    name: 'Gold',
    shortName: 'GLD',
    description: 'Trading opportunities on popular precious metals',
    isNew: true,
    iconBg: 'bg-zinc-500',
  },
];

export function HubView() {
  const { theme } = useTheme();

  const handleOpenPlatform = (platformName: string) => {
    console.log(`Opening platform: ${platformName}`);
    // Toast notification would go here
  };

  const handleGetAccount = (accountName: string) => {
    console.log(`Getting account: ${accountName}`);
    // Toast notification would go here
  };

  const handleLearnMore = () => {
    console.log('Learn more clicked');
  };

  const handleCompareAccounts = () => {
    console.log('Compare accounts clicked');
  };

  return (
    <div className={`w-full h-full overflow-y-auto custom-scrollbar ${
      theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
    }`}>
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Trader's Hub
          </h1>
        </div>

        {/* Options Section */}
        <OptionsSection
          theme={theme}
          platforms={PLATFORMS}
          onOpenPlatform={handleOpenPlatform}
          onLearnMore={handleLearnMore}
        />

        {/* CFDs Section */}
        <CFDsSection
          theme={theme}
          onLearnMore={handleLearnMore}
          onCompareAccounts={handleCompareAccounts}
        />

        {/* MT5 Section */}
        <MT5Section
          theme={theme}
          accounts={MT5_ACCOUNTS}
          onGetAccount={handleGetAccount}
        />
      </div>
    </div>
  );
}


// Options Section Component
function OptionsSection({ 
  theme, 
  platforms, 
  onOpenPlatform, 
  onLearnMore 
}: { 
  theme: 'light' | 'dark';
  platforms: Platform[];
  onOpenPlatform: (name: string) => void;
  onLearnMore: () => void;
}) {
  return (
    <div className={`p-6 rounded-xl border mb-6 ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <div className="mb-4">
        <h2 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Options
        </h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          Predict the market, profit if you're right, risk only what you put in.{' '}
          <button 
            onClick={onLearnMore}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Learn more
          </button>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            theme={theme}
            onOpen={() => onOpenPlatform(platform.name)}
          />
        ))}
      </div>
    </div>
  );
}

// Platform Card Component
function PlatformCard({ 
  platform, 
  theme, 
  onOpen 
}: { 
  platform: Platform;
  theme: 'light' | 'dark';
  onOpen: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md max-w-[390px] ${
      theme === 'dark'
        ? 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${platform.iconBg} ${platform.iconText}`}>
        {platform.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-sm truncate ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {platform.name}
        </h4>
        <p className={`text-xs truncate ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
        }`}>
          {platform.description}
        </p>
      </div>
      <button
        onClick={onOpen}
        className="px-3 py-1.5 bg-[#ff444f] hover:bg-[#e63e48] text-white text-xs font-medium rounded-md transition-colors flex-shrink-0"
      >
        Open
      </button>
    </div>
  );
}

// CFDs Section Component
function CFDsSection({ 
  theme, 
  onLearnMore, 
  onCompareAccounts 
}: { 
  theme: 'light' | 'dark';
  onLearnMore: () => void;
  onCompareAccounts: () => void;
}) {
  return (
    <div className={`p-6 rounded-xl border mb-6 ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            CFDs
          </h2>
          <button 
            onClick={onCompareAccounts}
            className="text-red-500 hover:text-red-400 text-sm transition-colors"
          >
            Compare accounts
          </button>
        </div>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          Trade bigger positions with less capital on a wide range of global markets.{' '}
          <button 
            onClick={onLearnMore}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Learn more
          </button>
        </p>
      </div>

      {/* Deriv Nakala Copy Trading */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md max-w-[390px] ${
        theme === 'dark'
          ? 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
      }`}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-zinc-500 text-white">
          DN
        </div>
        <div className="flex-1">
          <h4 className={`font-medium text-sm ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Copy trading with Deriv Nakala
          </h4>
        </div>
        <ChevronRight className={`w-5 h-5 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'
        }`} />
      </div>
    </div>
  );
}

// MT5 Section Component
function MT5Section({ 
  theme, 
  accounts, 
  onGetAccount 
}: { 
  theme: 'light' | 'dark';
  accounts: MT5Account[];
  onGetAccount: (name: string) => void;
}) {
  return (
    <div className={`p-6 rounded-xl border ${
      theme === 'dark'
        ? 'bg-zinc-800/50 border-zinc-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-lg font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Deriv MT5
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            theme={theme}
            onGet={() => onGetAccount(account.name)}
          />
        ))}
      </div>
    </div>
  );
}

// Account Card Component
function AccountCard({ 
  account, 
  theme, 
  onGet 
}: { 
  account: MT5Account;
  theme: 'light' | 'dark';
  onGet: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md max-w-[390px] ${
      theme === 'dark'
        ? 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white ${account.iconBg}`}>
        <span className="text-[10px] font-bold leading-none">MT5</span>
        <span className="text-[8px] leading-none">{account.shortName}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium text-sm ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {account.name}
          </h4>
          {account.isNew && (
            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-medium rounded">
              NEW
            </span>
          )}
        </div>
        <p className={`text-xs truncate ${
          theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
        }`}>
          {account.description}
        </p>
      </div>
      <button
        onClick={onGet}
        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-md transition-colors flex-shrink-0"
      >
        Get
      </button>
    </div>
  );
}
