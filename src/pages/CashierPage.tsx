import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Users, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

type CashierTab = 'deposit' | 'withdrawal' | 'payment-agents' | 'transfer' | 'p2p';

const TABS: { id: CashierTab; label: string; icon: React.ReactNode }[] = [
  { id: 'deposit', label: 'Deposit', icon: <Plus className="w-5 h-5" /> },
  { id: 'withdrawal', label: 'Withdrawal', icon: <Minus className="w-5 h-5" /> },
  { id: 'payment-agents', label: 'Payment agents', icon: <Users className="w-5 h-5" /> },
  { id: 'transfer', label: 'Transfer', icon: <ArrowLeftRight className="w-5 h-5" /> },
  { id: 'p2p', label: 'Deriv P2P', icon: <RefreshCw className="w-5 h-5" /> },
];

export function CashierPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CashierTab>('deposit');

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${
        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={theme === 'dark' 
                ? '/src/assets/deriv_neo_dark_mode.svg' 
                : '/src/assets/deriv_neo_light_mode.svg'}
              alt="Deriv Neo"
              className="h-7"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`text-right mr-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              <p className="text-sm font-medium">Julia Roberts</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Demo Account</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-700">
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className={`text-2xl font-semibold mb-8 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Cashier
        </h1>

        <div className="flex gap-8">
          {/* Sidebar Menu */}
          <nav className={`w-64 flex-shrink-0 rounded-xl border overflow-hidden ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
          }`}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors relative ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'bg-zinc-800/50 text-white'
                      : 'bg-gray-50 text-gray-900'
                    : theme === 'dark'
                      ? 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff444f]" />
                )}
                <span className={activeTab === tab.id ? '' : 'opacity-70'}>{tab.icon}</span>
                <span className={`font-medium ${activeTab === tab.id ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className={`flex-1 rounded-xl border p-8 ${
            theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
          }`}>
            {activeTab === 'deposit' && <DepositContent theme={theme} />}
            {activeTab === 'withdrawal' && <WithdrawalContent theme={theme} />}
            {activeTab === 'payment-agents' && <PaymentAgentsContent theme={theme} />}
            {activeTab === 'transfer' && <TransferContent theme={theme} />}
            {activeTab === 'p2p' && <P2PContent theme={theme} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function DepositContent({ theme }: { theme: string }) {
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Deposit Funds
      </h2>
      <p className={`mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
        Add funds to your trading account using your preferred payment method.
      </p>
      <div className={`p-6 rounded-xl border-2 border-dashed text-center ${
        theme === 'dark' ? 'border-zinc-700 bg-zinc-800/30' : 'border-gray-300 bg-gray-50'
      }`}>
        <Plus className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
        <p className={`font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
          Select a payment method to deposit
        </p>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
          This is a simulated feature for demo purposes
        </p>
      </div>
    </div>
  );
}

function WithdrawalContent({ theme }: { theme: string }) {
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Withdraw Funds
      </h2>
      <p className={`mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
        Withdraw your available balance to your preferred payment method.
      </p>
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex justify-between items-center mb-4">
          <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Available Balance</span>
          <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>$12,987.00</span>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
          This is a simulated feature for demo purposes
        </p>
      </div>
    </div>
  );
}

function PaymentAgentsContent({ theme }: { theme: string }) {
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Payment Agents
      </h2>
      <p className={`mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
        Deposit and withdraw through authorized payment agents in your region.
      </p>
      <div className={`p-6 rounded-xl border-2 border-dashed text-center ${
        theme === 'dark' ? 'border-zinc-700 bg-zinc-800/30' : 'border-gray-300 bg-gray-50'
      }`}>
        <Users className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
        <p className={`font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
          No payment agents available
        </p>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
          This is a simulated feature for demo purposes
        </p>
      </div>
    </div>
  );
}

function TransferContent({ theme }: { theme: string }) {
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Transfer Between Accounts
      </h2>
      <p className={`mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
        Move funds between your Deriv accounts instantly.
      </p>
      <div className={`p-6 rounded-xl border-2 border-dashed text-center ${
        theme === 'dark' ? 'border-zinc-700 bg-zinc-800/30' : 'border-gray-300 bg-gray-50'
      }`}>
        <ArrowLeftRight className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
        <p className={`font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
          Select accounts to transfer
        </p>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
          This is a simulated feature for demo purposes
        </p>
      </div>
    </div>
  );
}

function P2PContent({ theme }: { theme: string }) {
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Deriv P2P
      </h2>
      <p className={`mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
        Buy and sell with fellow traders using your local currency.
      </p>
      <div className={`p-6 rounded-xl border-2 border-dashed text-center ${
        theme === 'dark' ? 'border-zinc-700 bg-zinc-800/30' : 'border-gray-300 bg-gray-50'
      }`}>
        <RefreshCw className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}`} />
        <p className={`font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
          P2P marketplace
        </p>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
          This is a simulated feature for demo purposes
        </p>
      </div>
    </div>
  );
}
