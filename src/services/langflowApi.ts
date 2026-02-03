import type { CardType, UIEvent } from '../types';
import { findPlaceholdersInText } from './placeholderRules';

// Langflow API endpoint and API key
const LANGFLOW_ENDPOINT = import.meta.env.VITE_LANGFLOW_ENDPOINT;
const LANGFLOW_API_KEY = import.meta.env.VITE_LANGFLOW_API_KEY;

// Parsed response for frontend consumption
export interface LangflowParsedResponse {
  chat_message: string;
  ui_events: UIEvent[];
}

// Default payloads for each card type (dummy data)
function getDefaultPayload(cardType: CardType): Record<string, unknown> {
  const defaultPortfolioAssets = [
    { symbol: 'BTC', name: 'Bitcoin', allocation: 45, value: '$20,353.50', invested: '$18,000.00', change: '+$2,353.50', changePercent: '+13.07%' },
    { symbol: 'ETH', name: 'Ethereum', allocation: 30, value: '$13,569.00', invested: '$12,500.00', change: '+$1,069.00', changePercent: '+8.55%' },
    { symbol: 'SOL', name: 'Solana', allocation: 15, value: '$6,784.50', invested: '$7,200.00', change: '-$415.50', changePercent: '-5.77%' },
    { symbol: 'Other', name: 'Others', allocation: 10, value: '$4,523.00', invested: '$4,500.00', change: '+$23.00', changePercent: '+0.51%' },
  ];

  switch (cardType) {
    case 'trade-card':
      return {
        tradeId: `TRD-${Math.floor(Math.random() * 10000)}`,
        asset: 'BTC/USD',
        assetName: 'Bitcoin',
        direction: 'higher',
        stake: '$100.00',
        payout: '$195.00',
        barrier: '42,500.00',
        expiryDate: '28 Jan 2026, 23:59:59',
        status: 'open',
      };
    case 'create-trade-card':
      return {
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
        barrier: { value: 42500.00, spotPrice: 42350.75 },
        stake: { mode: 'stake', value: 100, currency: 'USD' },
        payout: {
          higher: { amount: '$195.00', percentage: '95%' },
          lower: { amount: '$195.00', percentage: '95%' },
        },
      };
    case 'bot-card':
      return {
        botId: `BOT-${Math.floor(Math.random() * 1000)}`,
        name: 'AI Bot',
        strategy: 'Custom strategy configured by AI',
        status: 'active',
        performance: '+0.00%',
      };
    case 'portfolio-snapshot':
      return {
        totalValue: '$45,230.00',
        change24h: '+$1,250.00',
        changePercent: '+2.84%',
        assets: [
          { symbol: 'BTC', allocation: 45, value: '$20,353.50' },
          { symbol: 'ETH', allocation: 30, value: '$13,569.00' },
          { symbol: 'SOL', allocation: 15, value: '$6,784.50' },
          { symbol: 'Other', allocation: 10, value: '$4,523.00' },
        ],
      };
    case 'portfolio-sidebar':
    case 'portfolio-table-complete':
      return {
        totalValue: '$45,230.00',
        change24h: '+$1,250.00',
        changePercent: '+2.84%',
        assets: defaultPortfolioAssets,
      };
    default:
      return {};
  }
}

function generateCardId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Extract message content from payload
 * Looks for content between "Text:" or "{message}" markers
 */
function extractMessage(text: string): string {
  // Normalize line breaks
  const normalizedText = text.replace(/\\n/g, '\n');
  
  // Try to find content after "Text:" label
  const textMatch = normalizedText.match(/Text:\s*([\s\S]*?)(?=\s*trigger_0[1-4]:|$)/i);
  if (textMatch && textMatch[1]) {
    return textMatch[1].trim();
  }
  
  // Fallback: return everything before any trigger labels
  const fallbackMatch = normalizedText.match(/^([\s\S]*?)(?=\s*trigger_0[1-4]:|$)/i);
  return fallbackMatch ? fallbackMatch[1].trim() : normalizedText.trim();
}

/**
 * Search for card type names in the entire payload (case-insensitive, exact match)
 * Returns array of found CardTypes
 * 
 * NOTE: This is the legacy method. New placeholder-based detection is handled
 * directly in ChatMessages.tsx via [[PLACEHOLDER]] patterns.
 */
function findCardsInPayload(payload: string): CardType[] {
  // First check for new [[PLACEHOLDER]] format
  const placeholders = findPlaceholdersInText(payload);
  if (placeholders.length > 0) {
    console.log('[LangflowAPI] Found placeholders (handled by ChatMessages):', placeholders);
    // Return empty - placeholders are handled inline by ChatMessages
    return [];
  }
  
  // Legacy: search for card type names directly
  const foundCards: CardType[] = [];
  const lowerPayload = payload.toLowerCase();
  
  // Search for each card type in the payload
  // Order matters: search longer names first to avoid partial matches
  // e.g., "portfolio-table-complete" should be found before "portfolio-table"
  const searchOrder: CardType[] = [
    'portfolio-table-complete',
    'portfolio-sidebar',
    'portfolio-snapshot',
    'create-trade-card',
    'trade-card',
    'actions-card',
    'bot-creator',
    'bot-card',
  ];
  
  for (const cardType of searchOrder) {
    if (lowerPayload.includes(cardType)) {
      foundCards.push(cardType);
      console.log(`[LangflowAPI] Found card type: ${cardType}`);
    }
  }
  
  return foundCards;
}

/**
 * Convert found card types to UIEvents
 */
function cardsToUIEvents(cardTypes: CardType[]): UIEvent[] {
  return cardTypes.map(cardType => ({
    type: 'ADD_CARD' as const,
    cardType,
    cardId: generateCardId(),
    payload: getDefaultPayload(cardType),
  }));
}

/**
 * Call Langflow API with user message and session ID
 */
export async function callLangflow(
  message: string,
  sessionId: string
): Promise<LangflowParsedResponse> {
  if (!LANGFLOW_ENDPOINT) {
    console.error('[LangflowAPI] VITE_LANGFLOW_ENDPOINT not configured');
    throw new Error('Langflow endpoint not configured');
  }

  console.log('[LangflowAPI] Calling endpoint:', LANGFLOW_ENDPOINT);
  console.log('[LangflowAPI] Payload:', { input_value: message, session_id: sessionId });

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if available
    if (LANGFLOW_API_KEY) {
      headers['x-api-key'] = LANGFLOW_API_KEY;
    }

    const response = await fetch(LANGFLOW_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input_value: message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LangflowAPI] HTTP Error:', response.status, errorText);
      throw new Error(`Langflow API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[LangflowAPI] Raw response:', data);

    // Extract text from Langflow Chat Output format
    // Path: data.outputs[0].outputs[0].results.message.text
    let rawText = '';
    
    if (data.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
      rawText = data.outputs[0].outputs[0].results.message.text;
    } else if (data.outputs?.[0]?.outputs?.[0]?.artifacts?.message) {
      rawText = data.outputs[0].outputs[0].artifacts.message;
    } else if (data.message && typeof data.message === 'string') {
      rawText = data.message;
    } else {
      console.warn('[LangflowAPI] Unexpected response format, using fallback');
      rawText = 'Response received but format was unexpected.';
    }

    console.log('[LangflowAPI] Raw text from Langflow:', rawText);

    // Extract message for chat display
    const chatMessage = extractMessage(rawText);
    
    // Search for card types in the entire payload
    const foundCards = findCardsInPayload(rawText);
    const uiEvents = cardsToUIEvents(foundCards);
    
    console.log('[LangflowAPI] Extracted message:', chatMessage);
    console.log('[LangflowAPI] Found cards:', foundCards);
    console.log('[LangflowAPI] UI events:', uiEvents.length, 'cards');

    return {
      chat_message: chatMessage,
      ui_events: uiEvents,
    };
  } catch (error) {
    console.error('[LangflowAPI] Request failed:', error);
    throw error;
  }
}
