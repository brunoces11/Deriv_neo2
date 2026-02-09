import { useTheme } from '../store/ThemeContext';
import { ArrowLeft, Zap, Bot, Wallet, Table, CheckCircle, XCircle, TrendingUp, LineChart, Workflow, BarChart3, Activity, DollarSign } from 'lucide-react';
import { BotCard } from '../components/cards/BotCard';
import { PortfolioSnapshotCard } from '../components/cards/PortfolioSnapshotCard';
import { PortfolioTableCardComplete } from '../components/cards/PortfolioTableCardComplete';
import { PortfolioSidebarCard } from '../components/cards/PortfolioSidebarCard';
import { PortfolioPerformance } from '../components/cards/PortfolioPerformance';
import { CreateTradeCard } from '../components/cards/CreateTradeCard';
import { TradeCard } from '../components/cards/TradeCard';
import { TradeSpotCard } from '../components/cards/TradeSpotCard';
import { ActionsCard } from '../components/cards/ActionsCard';
import { ActionsCardCreator } from '../components/cards/ActionsCardCreator';
import { BotCardCreator } from '../components/cards/BotCardCreator';
import { MarketAnalyses } from '../components/cards/MarketAnalyses';
import { UserProfile } from '../components/layout/UserProfile';
import derivNeoDark from '../assets/deriv_neo_dark_mode.svg';
import derivNeoLight from '../assets/deriv_neo_light_mode.svg';
import type { BaseCard } from '../types';

const mockBotCard: BaseCard = {
  id: 'demo-bot-1',
  type: 'card_bot',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    botId: 'BOT-456',
    name: 'DCA Master',
    strategy: 'Dollar-cost averaging with weekly intervals',
    status: 'active',
    performance: '+12.5%',
  },
};


const mockPortfolioCard: BaseCard = {
  id: 'demo-portfolio-1',
  type: 'card_portfolio_exemple_compacto',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    totalValue: '$45,230.00',
    change24h: '+$1,250.00',
    changePercent: '+2.84%',
    assets: [
      { symbol: 'BTC', allocation: 45, value: '$20,353.50' },
      { symbol: 'ETH', allocation: 30, value: '$13,569.00' },
      { symbol: 'SOL', allocation: 15, value: '$6,784.50' },
      { symbol: 'Other', allocation: 10, value: '$4,523.00' },
    ],
  },
};

const mockPortfolioTableCard: BaseCard = {
  id: 'demo-portfolio-table-1',
  type: 'card_portfolio',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    totalValue: '$45,230.00',
    change24h: '+$1,250.00',
    changePercent: '+2.84%',
    assets: [
      { symbol: 'BTC', name: 'Bitcoin', allocation: 45, value: '$20,353.50', invested: '$18,000.00', change: '+$2,353.50', changePercent: '+13.07%' },
      { symbol: 'ETH', name: 'Ethereum', allocation: 30, value: '$13,569.00', invested: '$12,500.00', change: '+$1,069.00', changePercent: '+8.55%' },
      { symbol: 'SOL', name: 'Solana', allocation: 15, value: '$6,784.50', invested: '$7,200.00', change: '-$415.50', changePercent: '-5.77%' },
      { symbol: 'USDT', name: 'Tether', allocation: 10, value: '$4,523.00', invested: '$4,500.00', change: '+$23.00', changePercent: '+0.51%' },
    ],
  },
};

const mockTradeCard: BaseCard = {
  id: 'demo-trade-1',
  type: 'card_trade',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    tradeId: 'TRD-7891',
    asset: 'BTC/USD',
    assetName: 'Bitcoin',
    direction: 'higher',
    stake: '$100.00',
    payout: '$357.52',
    barrier: '772,009.31',
    expiryDate: '28 Jan 2026, 23:59:59',
    status: 'open',
    entrySpot: '771,850.25',
    currentSpot: '772,105.50',
  },
};

const mockCreateTradeCard: BaseCard = {
  id: 'demo-create-trade-1',
  type: 'card_trade_creator',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    asset: 'BTC/USD',
    assetName: 'Bitcoin',
    tradeType: 'higher-lower',
    duration: {
      mode: 'duration',
      unit: 'days',
      value: 1,
      range: { min: 1, max: 365 },
      expiryDate: '28 Jan 2026, 23:59:59 GMT +0',
    },
    barrier: {
      value: 772009.31,
      spotPrice: 771850.25,
    },
    stake: {
      mode: 'stake',
      value: 100,
      currency: 'USD',
    },
    payout: {
      higher: { amount: '$357.52', percentage: '257.52%' },
      lower: { amount: '$134.39', percentage: '34.39%' },
    },
  },
};

const mockActionsCard: BaseCard = {
  id: 'demo-actions-1',
  type: 'card_actions',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    actionId: 'ACT-001',
    name: 'Weekly BTC Purchase',
    description: 'Automatically buy $100 of Bitcoin every Monday at 9:00 AM',
    status: 'active',
    lastExecution: '2026-01-27T09:00:00Z',
  },
};

const mockBotCreator: BaseCard = {
  id: 'demo-bot-creator-1',
  type: 'card_bot_creator',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    botName: 'DCA Bitcoin Strategy',
    trigger: { type: 'Weekly', value: 'Monday' },
    action: { type: 'Buy', asset: 'BTC' },
    target: { type: 'Amount', value: '$100' },
    condition: { type: 'Price', operator: '<', value: '50000' },
  },
};

const mockActionsCreator: BaseCard = {
  id: 'demo-actions-creator-1',
  type: 'card_actions_creator',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    actionName: 'Daily BTC Alert',
    trigger: { type: 'schedule', value: 'Daily' },
    action: { type: 'Alert', asset: 'BTC' },
    schedule: { frequency: 'daily', time: '09:00' },
    condition: { type: 'Price', operator: '>', value: '100000' },
  },
};

const mockPortfolioPerformance: BaseCard = {
  id: 'demo-portfolio-performance-1',
  type: 'card_portfolio_performance',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {},
};

const mockMarketAnalyses: BaseCard = {
  id: 'demo-market-analyses-1',
  type: 'card_market_analyses',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {},
};

const mockTradeSpotCard: BaseCard = {
  id: 'demo-trade-spot-1',
  type: 'trade-spot-card',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    pair: 'BTC/USD',
    amount: 500,
    priceMode: 'market',
    price: 42350.75,
    executionState: 'open',
  },
};

interface CardInfo {
  name: string;
  type: string;
  icon: React.ElementType;
  description: string;
  hasLogic: boolean;
  logicDetails: string[];
  component: React.ReactNode;
  expanded?: boolean;
}

const cardsInfo: CardInfo[] = [
  {
    name: 'Portfolio Snapshot Card',
    type: 'portfolio-snapshot',
    icon: Wallet,
    description: 'Portfolio overview with asset allocation visualization.',
    hasLogic: true,
    logicDetails: [
      'Calculates if change is positive/negative for icon and color',
      'Visual allocation bar with colors per asset',
      'Asset grid with percentages',
      'Displays totalValue, change24h, changePercent',
      'Highlight color: red',
    ],
    component: <PortfolioSnapshotCard card={mockPortfolioCard} />,
  },
  {
    name: 'Portfolio Snapshot Table (Complete)',
    type: 'portfolio-table-complete',
    icon: Table,
    description: 'Complete version combining visual allocation bar + expanded detailed table.',
    hasLogic: true,
    logicDetails: [],
    component: <PortfolioTableCardComplete card={mockPortfolioTableCard} />,
    expanded: true,
  },
  {
    name: 'Create Trade Card',
    type: 'create-trade-card',
    icon: LineChart,
    description: 'Complete trade creation card pre-filled by AI. First stage: configure and confirm trade.',
    hasLogic: true,
    logicDetails: [
      'Header with trade type (Higher/Lower) and "Learn about" link',
      'Duration section: Duration/End time toggle, unit selector, numeric input',
      'Displays valid range and calculated expiry date',
      'Barrier section: input with value and reference spot price',
      'Stake section: Stake/Payout toggle, +/- buttons, USD currency',
      'Action buttons: Higher (#00d0a0) and Lower (#ff444f)',
      'Payout and percentage displayed on each button',
      'After confirming, transforms into Trade Card',
    ],
    component: <CreateTradeCard card={mockCreateTradeCard} />,
  },
  {
    name: 'Trade Card',
    type: 'trade-card',
    icon: TrendingUp,
    description: 'Compact active/executed trade card with expand/collapse. Second stage: displays ongoing trade after confirmation.',
    hasLogic: true,
    logicDetails: [
      'Collapsed mode: icon + asset/direction + stake→payout + status + expand button',
      'Expanded mode: complete header + details grid + spots + profit/loss',
      'Arrow button in top right corner to expand/collapse',
      'Status: open (cyan), won (green), lost (red), sold (amber)',
      '"Sell Early" button for open trades (expanded mode)',
      'Derived from Create Trade Card after confirmation',
    ],
    component: <TradeCard card={mockTradeCard} />,
  },
  {
    name: 'Actions Card',
    type: 'actions-card',
    icon: Zap,
    description: 'Configured action card with 4 management buttons (execute, edit, delete, schedule).',
    hasLogic: true,
    logicDetails: [
      'Compact 2-line layout: Name + Status/Last run',
      'Status dot on icon (green=active, gray=inactive)',
      '4 buttons aligned to the right: Execute, Edit, Delete, Schedule',
      'Buttons in gray/neutral tone with hover state',
      'Click handlers for simulation (console.log)',
    ],
    component: <ActionsCard card={mockActionsCard} />,
  },
  {
    name: 'Actions Card Creator',
    type: 'actions-creator',
    icon: Workflow,
    description: 'Visual card with diagram/flowchart showing the configuration of a new action before deployment.',
    hasLogic: true,
    logicDetails: [
      'Header with lightning icon and action name',
      'Flowchart area with boxes connected by lines',
      'Trigger box (amber): trigger type and value',
      'Action box (green): action type and asset',
      'Schedule box (cyan): frequency and time',
      'Condition box (orange): optional condition',
      'Textual summary of action flow',
      'Buttons: Deploy Action (green), Edit Config, Cancel',
      'Grid pattern background for visual effect',
    ],
    component: <ActionsCardCreator card={mockActionsCreator} />,
  },
  {
    name: 'Bot Card Creator',
    type: 'bot-creator',
    icon: Workflow,
    description: 'Visual card with diagram/flowchart showing the configuration of a new bot before deployment.',
    hasLogic: true,
    logicDetails: [
      'Header with bot icon and strategy name',
      'Flowchart area with boxes connected by lines',
      'Trigger box (cyan): trigger type and value',
      'Action box (green): action type and asset',
      'Target box (amber): target type and value',
      'Condition box (orange): optional condition',
      'Textual summary of bot flow',
      'Buttons: Deploy Bot (green), Edit Config, Cancel',
      'Grid pattern background for visual effect',
    ],
    component: <BotCardCreator card={mockBotCreator} />,
  },
  {
    name: 'Bot Card',
    type: 'bot-card',
    icon: Bot,
    description: 'Card to manage active bots with 4 action buttons (Play/Pause, Edit, Delete, Schedule).',
    hasLogic: true,
    logicDetails: [
      'Compact 2-line layout: Name + Status/Performance',
      'Status dot on icon (green=active, gray=paused/stopped)',
      'Performance with trend icon (green/red)',
      '4 buttons aligned to the right: Play/Pause, Edit, Delete, Schedule',
      'Play/Pause button toggles based on current status',
      'Buttons in gray/neutral tone with hover state',
    ],
    component: <BotCard card={mockBotCard} />,
  },
  {
    name: 'Portfolio Sidebar Card',
    type: 'portfolio-sidebar',
    icon: Wallet,
    description: 'Ultra compact portfolio version optimized for sidebar with minimal buttons.',
    hasLogic: true,
    logicDetails: [
      'Ultra compact layout to fit in sidebar',
      'Table without Invested column to save space',
      'Ultra compact buttons: arrow + color only',
      'Reduced text (10px) for maximum density',
      'Compact header with total value and change',
      'Minimalist footer with 24h change',
    ],
    component: <PortfolioSidebarCard card={mockPortfolioTableCard} />,
  },
  {
    name: 'Portfolio Performance Report',
    type: 'portfolio-performance',
    icon: BarChart3,
    description: 'Professional performance report with consolidated metrics, charts and action recommendation.',
    hasLogic: true,
    logicDetails: [
      'Compacted mode: main metrics + recommendation',
      'Expanded mode: complete paper-style report',
      '7 analysis blocks: Performance, Quality, Risk, Efficiency, By Product, Sustainability, Action',
      'Charts: equity curve, progress bars, products heatmap',
      'Metrics: PnL, growth, win rate, expectancy, drawdown, payoff',
      'Recommendation system: maintain, optimize, reduce-risk, pause, scale',
      'Realistic mock data for demonstration',
      'Trigger: [[PORTFOLIO_PERFORMANCE]]',
    ],
    component: <PortfolioPerformance card={mockPortfolioPerformance} />,
    expanded: true,
  },
  {
    name: 'Market Analyses',
    type: 'market-analyses',
    icon: Activity,
    description: 'Professional market analysis report with regime detection, sentiment analysis, opportunities and timing recommendations.',
    hasLogic: true,
    logicDetails: [
      'Compacted mode: key metrics + general signal',
      'Expanded mode: complete market analysis report',
      '7 analysis blocks: Market Regime, Sentiment & Flow, Opportunities, Risks, Operation Conditions, Timing, General Signal',
      'Visual indicators: volatility bars, liquidity gauges, pressure charts',
      'Metrics: regime type, buy/sell pressure, risk appetite, timing confidence',
      'Operation types: Binary, Digital, CFDs, Synthetics with status',
      'Timing signals: entry, caution, reduce exposure',
      'General signal: offensive, neutral, defensive',
      'Trigger: [[MARKET_ANALYSES]]',
    ],
    component: <MarketAnalyses card={mockMarketAnalyses} />,
    expanded: true,
  },
  {
    name: 'Trade Spot Card',
    type: 'trade-spot-card',
    icon: DollarSign,
    description: 'Simplified spot trading card for buying/selling crypto pairs at market or manual price.',
    hasLogic: true,
    logicDetails: [
      'Three visual states: open, bought, sold',
      'Pair selector with popular pairs (BTC/USD, ETH/USD, XAU/USD, etc)',
      'Market price or manual price mode toggle',
      'Amount input in USD',
      'Buy/Sell action buttons',
      'Compact mode: single line with pair, amount, and status',
      'Expanded mode (open): trading interface',
      'Expanded mode (executed): confirmation with execution details',
      'Appears in positions panel in sidebar',
      'Trigger: [[TRADE_SPOT_CARD]]',
    ],
    component: <TradeSpotCard card={mockTradeSpotCard} />,
  },
];


function CardSection({ cardInfo, displayIndex }: { cardInfo: CardInfo; displayIndex: string }) {
  const { theme } = useTheme();
  const Icon = cardInfo.icon;

  return (
    <div className={`rounded-xl border overflow-hidden ${
      theme === 'dark'
        ? 'bg-zinc-900/50 border-zinc-800'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`px-6 py-4 border-b ${
        theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
          }`}>
            <Icon className="w-5 h-5 text-brand-green" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {displayIndex}. {cardInfo.name}
              </h3>
              <code className={`text-xs px-2 py-0.5 rounded ${
                theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600'
              }`}>
                {cardInfo.type}
              </code>
            </div>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              {cardInfo.description}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            cardInfo.hasLogic
              ? 'bg-green-500/10 text-green-500'
              : 'bg-amber-500/10 text-amber-500'
          }`}>
            {cardInfo.hasLogic ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">
              {cardInfo.hasLogic ? 'With Logic' : 'Markup Only'}
            </span>
          </div>
        </div>
      </div>

      {cardInfo.expanded ? (
        <div className="p-6">
          <h4 className={`text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
          }`}>
            Card Preview (Expanded)
          </h4>
          {cardInfo.component}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <h4 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              Card Preview
            </h4>
            {cardInfo.component}
          </div>

          <div>
            <h4 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              Implemented Logic
            </h4>
            <ul className="space-y-2">
              {cardInfo.logicDetails.map((detail, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                }`}>
                  <span className="text-brand-green mt-1">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function CardsPage() {
  const { theme } = useTheme();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
    }`}>
      <header className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-sm ${
        theme === 'dark'
          ? 'border-zinc-800/50 bg-zinc-950/80'
          : 'border-gray-200 bg-white/80'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Cards Blueprint
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              All cards implemented in the system
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className={`mb-8 p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-zinc-900/50 border-zinc-800'
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
          }`}>
            Summary
          </h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
          }`}>
            This system has <span className="font-semibold text-brand-green">{cardsInfo.length} card types</span> implemented.
            All have functional logic and are dynamically generated by AI through UI Events.
          </p>
        </div>

        <div className="space-y-8">
          {cardsInfo.map((cardInfo, index) => {
            const displayIndex = String(index + 1);
            return (
              <CardSection key={cardInfo.type} cardInfo={cardInfo} displayIndex={displayIndex} />
            );
          })}
        </div>
      </main>

      {/* Deriv Neo Logo - Fixed top left */}
      <div className={`fixed top-0 left-0 w-72 z-20 p-4 border-b border-r ${
        theme === 'dark' 
          ? 'bg-zinc-950 border-zinc-800/50' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-center">
          <img
            src={theme === 'dark' ? derivNeoDark : derivNeoLight}
            alt="Deriv Neo"
            className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleBack}
          />
        </div>
      </div>

      {/* User Profile - Fixed bottom left */}
      <div className={`fixed bottom-0 left-0 w-72 z-20 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`}>
        <UserProfile />
      </div>
    </div>
  );
}
