import type { LangFlowResponse, UIEvent, CardType } from '../types';

function generateId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface MockScenario {
  keywords: string[];
  response: string;
  events: () => UIEvent[];
}

const scenarios: MockScenario[] = [
  {
    keywords: ['buy', 'comprar', 'purchase'],
    response: "I understand you want to make a purchase. I've prepared a summary of your intent and created an action ticket for this transaction. You can review the details in the cards below.",
    events: () => [
      {
        type: 'ADD_CARD',
        cardType: 'intent-summary' as CardType,
        cardId: generateId(),
        payload: {
          action: 'Buy',
          asset: 'BTC',
          value: '$1,000',
          summary: 'Purchase Bitcoin with specified amount',
        },
      },
      {
        type: 'ADD_CARD',
        cardType: 'action-ticket' as CardType,
        cardId: generateId(),
        payload: {
          ticketId: `TKT-${Math.floor(Math.random() * 10000)}`,
          action: 'buy',
          asset: 'BTC',
          amount: '0.025 BTC',
          status: 'pending',
        },
      },
    ],
  },
  {
    keywords: ['sell', 'vender'],
    response: "I've registered your sell order. Check the action ticket below for the transaction details. You can track the status in real-time.",
    events: () => [
      {
        type: 'ADD_CARD',
        cardType: 'intent-summary' as CardType,
        cardId: generateId(),
        payload: {
          action: 'Sell',
          asset: 'ETH',
          value: '2.5 ETH',
          summary: 'Sell Ethereum at current market price',
        },
      },
      {
        type: 'ADD_CARD',
        cardType: 'action-ticket' as CardType,
        cardId: generateId(),
        payload: {
          ticketId: `TKT-${Math.floor(Math.random() * 10000)}`,
          action: 'sell',
          asset: 'ETH',
          amount: '2.5 ETH',
          status: 'executing',
        },
      },
    ],
  },
  {
    keywords: ['bot', 'automate', 'automatizar', 'trading bot'],
    response: "I've set up a trading bot based on your preferences. The bot card below shows its current configuration and status. You can pause or modify it at any time.",
    events: () => [
      {
        type: 'ADD_CARD',
        cardType: 'bot' as CardType,
        cardId: generateId(),
        payload: {
          botId: `BOT-${Math.floor(Math.random() * 1000)}`,
          name: 'DCA Master',
          strategy: 'Dollar-cost averaging with weekly intervals',
          status: 'active',
          performance: '+12.5%',
        },
      },
    ],
  },
  {
    keywords: ['portfolio', 'carteira', 'balance', 'saldo', 'holdings'],
    response: "Here's a snapshot of your current portfolio. The card below shows your holdings and recent performance. Click on any asset for more details.",
    events: () => [
      {
        type: 'ADD_CARD',
        cardType: 'portfolio-snapshot' as CardType,
        cardId: generateId(),
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
      },
    ],
  },
  {
    keywords: ['swap', 'trocar', 'exchange', 'convert'],
    response: "I've prepared a swap transaction for you. Review the details in the action ticket below and confirm when ready.",
    events: () => [
      {
        type: 'ADD_CARD',
        cardType: 'intent-summary' as CardType,
        cardId: generateId(),
        payload: {
          action: 'Swap',
          asset: 'ETH → USDC',
          value: '1.5 ETH',
          summary: 'Convert Ethereum to USDC at best available rate',
        },
      },
      {
        type: 'ADD_CARD',
        cardType: 'action-ticket' as CardType,
        cardId: generateId(),
        payload: {
          ticketId: `TKT-${Math.floor(Math.random() * 10000)}`,
          action: 'swap',
          asset: 'ETH → USDC',
          amount: '1.5 ETH ≈ $2,850',
          status: 'pending',
        },
      },
    ],
  },
  {
    keywords: ['help', 'ajuda', 'what can', 'o que você'],
    response: "I can help you with various crypto operations! Try asking me to:\n\n• Buy or sell assets\n• Check your portfolio\n• Set up trading bots\n• Swap between tokens\n\nJust describe what you want to do, and I'll prepare everything for you.",
    events: () => [],
  },
];

const fallbackResponses = [
  "I've analyzed your request and prepared the relevant information below. Let me know if you need any adjustments.",
  "Based on your message, here's what I've gathered. Check the cards for actionable items.",
  "I understand. I've created a summary of your intent. Feel free to modify or confirm the action.",
];

function findScenario(message: string): MockScenario | null {
  const lowerMessage = message.toLowerCase();
  return scenarios.find(scenario =>
    scenario.keywords.some(keyword => lowerMessage.includes(keyword))
  ) || null;
}

export async function simulateLangFlowResponse(userMessage: string): Promise<LangFlowResponse> {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  const scenario = findScenario(userMessage);

  if (scenario) {
    return {
      chat_message: scenario.response,
      ui_events: scenario.events(),
    };
  }

  return {
    chat_message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
    ui_events: [
      {
        type: 'ADD_CARD',
        cardType: 'intent-summary',
        cardId: generateId(),
        payload: {
          action: 'Analyze',
          summary: userMessage.slice(0, 100),
        },
      },
    ],
  };
}
