import { useTheme } from '../store/ThemeContext';
import { ArrowLeft, Zap, Bot, Wallet, Table, CheckCircle, XCircle, TrendingUp, LineChart, Workflow } from 'lucide-react';
import { BotCard } from '../components/cards/BotCard';
import { PortfolioSnapshotCard } from '../components/cards/PortfolioSnapshotCard';
import { PortfolioTableCardComplete } from '../components/cards/PortfolioTableCardComplete';
import { PortfolioSidebarCard } from '../components/cards/PortfolioSidebarCard';
import { CreateTradeCard } from '../components/cards/CreateTradeCard';
import { TradeCard } from '../components/cards/TradeCard';
import { ActionsCard } from '../components/cards/ActionsCard';
import { BotCardCreator } from '../components/cards/BotCardCreator';
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
    name: 'Portfolio Sidebar Card',
    type: 'portfolio-sidebar',
    icon: Wallet,
    description: 'Versão ultra compacta do portfólio otimizada para sidebar com botões mínimos.',
    hasLogic: true,
    logicDetails: [
      'Layout ultra compacto para caber no sidebar',
      'Tabela sem coluna Invested para economizar espaço',
      'Botões ultra compactos: apenas seta + cor',
      'Texto reduzido (10px) para máxima densidade',
      'Header compacto com valor total e variação',
      'Footer minimalista com 24h change',
    ],
    component: <PortfolioSidebarCard card={mockPortfolioTableCard} />,
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
  {
    name: 'Create Trade Card',
    type: 'create-trade-card',
    icon: LineChart,
    description: 'Card de criação de trade completo pré-preenchido pela IA. Primeiro estágio: configurar e confirmar trade.',
    hasLogic: true,
    logicDetails: [
      'Header com tipo de trade (Higher/Lower) e link "Learn about"',
      'Seção Duration: toggle Duration/End time, seletor de unidade, input numérico',
      'Exibe range válido e data de expiração calculada',
      'Seção Barrier: input com valor e spot price de referência',
      'Seção Stake: toggle Stake/Payout, botões +/-, moeda USD',
      'Botões de ação: Higher (#00d0a0) e Lower (#ff444f)',
      'Payout e percentual exibidos em cada botão',
      'Após confirmar, transforma em Trade Card',
    ],
    component: <CreateTradeCard card={mockCreateTradeCard} />,
  },
  {
    name: 'Trade Card',
    type: 'trade-card',
    icon: TrendingUp,
    description: 'Card compacto de trade ativo/executado com expand/collapse. Segundo estágio: exibe trade em andamento após confirmação.',
    hasLogic: true,
    logicDetails: [
      'Modo colapsado: ícone + asset/direção + stake→payout + status + botão expand',
      'Modo expandido: header completo + grid de detalhes + spots + profit/loss',
      'Botão de seta no canto direito para expandir/colapsar',
      'Status: open (cyan), won (verde), lost (vermelho), sold (amber)',
      'Botão "Sell Early" para trades abertos (modo expandido)',
      'Derivado do Create Trade Card após confirmação',
    ],
    component: <TradeCard card={mockTradeCard} />,
  },
  {
    name: 'Actions Card',
    type: 'actions-card',
    icon: Zap,
    description: 'Card de ação configurada com 4 botões de gerenciamento (executar, editar, deletar, agendar).',
    hasLogic: true,
    logicDetails: [
      'Layout compacto de 2 linhas: Nome + Status/Last run',
      'Bolinha de status no ícone (verde=active, cinza=inactive)',
      '4 botões alinhados à direita: Execute, Edit, Delete, Schedule',
      'Botões em tom cinza/neutro com hover state',
      'Click handlers para simulação (console.log)',
    ],
    component: <ActionsCard card={mockActionsCard} />,
  },
  {
    name: 'Bot Card Creator',
    type: 'bot-creator',
    icon: Workflow,
    description: 'Card visual com diagrama/flowchart mostrando a configuração de um novo bot antes do deploy.',
    hasLogic: true,
    logicDetails: [
      'Header com ícone de bot e nome da estratégia',
      'Área de flowchart com boxes conectados por linhas',
      'Trigger box (cyan): tipo e valor do gatilho',
      'Action box (verde): tipo de ação e ativo',
      'Target box (amber): tipo e valor do alvo',
      'Condition box (laranja): condição opcional',
      'Resumo textual do fluxo do bot',
      'Botões: Deploy Bot (verde), Edit Config, Cancel',
      'Grid pattern de fundo para efeito visual',
    ],
    component: <BotCardCreator card={mockBotCreator} />,
  },
  {
    name: 'Bot Card',
    type: 'bot-card',
    icon: Bot,
    description: 'Card para gerenciar bots ativos com 4 botões de ação (Play/Pause, Edit, Delete, Schedule).',
    hasLogic: true,
    logicDetails: [
      'Layout compacto de 2 linhas: Nome + Status/Performance',
      'Bolinha de status no ícone (verde=active, cinza=paused/stopped)',
      'Performance com ícone de tendência (verde/vermelho)',
      '4 botões alinhados à direita: Play/Pause, Edit, Delete, Schedule',
      'Botão Play/Pause alterna baseado no status atual',
      'Botões em tom cinza/neutro com hover state',
    ],
    component: <BotCard card={mockBotCard} />,
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
          {cardInfo.component}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <h4 className={`text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
            }`}>
              Preview do Card
            </h4>
            {cardInfo.component}
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
