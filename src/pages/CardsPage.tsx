import { useTheme } from '../store/ThemeContext';
import { ArrowLeft, FileText, Zap, Bot, Wallet, Table, CheckCircle, XCircle } from 'lucide-react';
import { IntentSummaryCard } from '../components/cards/IntentSummaryCard';
import { ActionTicketCard } from '../components/cards/ActionTicketCard';
import { BotCard } from '../components/cards/BotCard';
import { PortfolioSnapshotCard } from '../components/cards/PortfolioSnapshotCard';
import { PortfolioTableCard } from '../components/cards/PortfolioTableCard';
import { PortfolioTableCardExpanded } from '../components/cards/PortfolioTableCardExpanded';
import { PortfolioTableCardComplete } from '../components/cards/PortfolioTableCardComplete';
import type { BaseCard } from '../types';

const mockIntentSummaryCard: BaseCard = {
  id: 'demo-intent-1',
  type: 'intent-summary',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    action: 'Buy',
    asset: 'BTC',
    value: '$1,000',
    summary: 'Purchase Bitcoin with specified amount',
  },
};

const mockActionTicketCard: BaseCard = {
  id: 'demo-action-1',
  type: 'action-ticket',
  status: 'active',
  isFavorite: false,
  createdAt: new Date(),
  payload: {
    ticketId: 'TKT-1234',
    action: 'buy',
    asset: 'BTC',
    amount: '0.025 BTC',
    status: 'pending',
  },
};

const mockBotCard: BaseCard = {
  id: 'demo-bot-1',
  type: 'bot',
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
  type: 'portfolio-snapshot',
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
  type: 'portfolio-table',
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
    name: 'Intent Summary Card',
    type: 'intent-summary',
    icon: FileText,
    description: 'Exibe um resumo da intenção do usuário detectada pela IA.',
    hasLogic: true,
    logicDetails: [
      'Renderiza payload.action como título',
      'Mostra asset → value com seta visual',
      'Exibe payload.summary como descrição',
      'Cor de destaque: cyan',
      'Suporta favoritar/arquivar via CardWrapper',
    ],
    component: <IntentSummaryCard card={mockIntentSummaryCard} />,
  },
  {
    name: 'Action Ticket Card',
    type: 'action-ticket',
    icon: Zap,
    description: 'Representa um ticket de operação (buy/sell/transfer/swap).',
    hasLogic: true,
    logicDetails: [
      'Ícone dinâmico por tipo de ação (buy=ArrowUpRight, sell=ArrowDownRight)',
      'Cor dinâmica por ação (buy=red, sell=rose, transfer=amber, swap=cyan)',
      'Status badge com ícone animado (pending/executing = spinner)',
      'Exibe ticketId, asset, amount',
      'Estados: pending, executing, completed, failed',
    ],
    component: <ActionTicketCard card={mockActionTicketCard} />,
  },
  {
    name: 'Bot Card',
    type: 'bot',
    icon: Bot,
    description: 'Mostra um trading bot configurado e seu status.',
    hasLogic: true,
    logicDetails: [
      'Dot pulsante quando status=active',
      'Ícone de status dinâmico (Play/Pause/Square)',
      'Exibe nome, estratégia e performance',
      'Cor de destaque: amber',
      'Estados: active, paused, stopped',
    ],
    component: <BotCard card={mockBotCard} />,
  },
  {
    name: 'Portfolio Snapshot Card',
    type: 'portfolio-snapshot',
    icon: Wallet,
    description: 'Visão geral do portfólio com alocação de ativos.',
    hasLogic: true,
    logicDetails: [
      'Calcula se variação é positiva/negativa para ícone e cor',
      'Barra de alocação visual com cores por asset',
      'Grid de assets com percentuais',
      'Exibe totalValue, change24h, changePercent',
      'Cor de destaque: red',
    ],
    component: <PortfolioSnapshotCard card={mockPortfolioCard} />,
  },
  {
    name: 'Portfolio Snapshot Table',
    type: 'portfolio-table',
    icon: Table,
    description: 'Tabela detalhada do portfólio com valor aportado, variação e ações.',
    hasLogic: true,
    logicDetails: [
      'Tabela com colunas: Asset, Value, Invested, Change, % Portfolio, Actions',
      'Exibe nome completo e símbolo de cada ativo',
      'Mostra valor aportado vs valor atual',
      'Variação em % com ícone de tendência',
      'Botões de ação Buy/Sell para cada ativo',
      'Footer com resumo: 24h change e total de assets',
    ],
    component: <PortfolioTableCard card={mockPortfolioTableCard} />,
  },
  {
    name: 'Portfolio Snapshot Table (Expanded)',
    type: 'portfolio-table-expanded',
    icon: Table,
    description: 'Versão expandida da tabela de portfólio ocupando toda a largura disponível.',
    hasLogic: true,
    logicDetails: [],
    component: <PortfolioTableCardExpanded card={mockPortfolioTableCard} />,
    expanded: true,
  },
  {
    name: 'Portfolio Snapshot Table (Complete)',
    type: 'portfolio-table-complete',
    icon: Table,
    description: 'Versão completa combinando barra de alocação visual + tabela detalhada expandida.',
    hasLogic: true,
    logicDetails: [],
    component: <PortfolioTableCardComplete card={mockPortfolioTableCard} />,
    expanded: true,
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
              {cardInfo.hasLogic ? 'Com Lógica' : 'Apenas Marcação'}
            </span>
          </div>
        </div>
      </div>

      {cardInfo.expanded ? (
        <div className="p-6">
          <h4 className={`text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
          }`}>
            Preview do Card (Expanded)
          </h4>
          <div className="pointer-events-none">
            {cardInfo.component}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <h4 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              Preview do Card
            </h4>
            <div className="pointer-events-none">
              {cardInfo.component}
            </div>
          </div>

          <div>
            <h4 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              Lógica Implementada
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
              Todos os cards implementados no sistema
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
            Resumo
          </h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
          }`}>
            Este sistema possui <span className="font-semibold text-brand-green">{cardsInfo.length} tipos de cards</span> implementados.
            Todos possuem lógica funcional e são gerados dinamicamente pela IA através de UI Events.
          </p>
        </div>

        <div className="space-y-8">
          {cardsInfo.map((cardInfo, index) => {
            // Calculate display index: expanded items get .1, .2 suffix
            let displayIndex: string;
            if (index <= 4) {
              displayIndex = String(index + 1);
            } else if (index === 5) {
              displayIndex = '5.1';
            } else if (index === 6) {
              displayIndex = '5.2';
            } else {
              displayIndex = String(index + 1);
            }
            return (
              <CardSection key={cardInfo.type} cardInfo={cardInfo} displayIndex={displayIndex} />
            );
          })}
        </div>
      </main>
    </div>
  );
}
