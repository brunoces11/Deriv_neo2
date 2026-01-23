import type { CandlestickData, Time } from 'lightweight-charts';

// Binance API - Free, no authentication required for public data
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// Symbol mapping: our format -> Binance format
const SYMBOL_MAP: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'SOL/USD': 'SOLUSDT',
  'XRP/USD': 'XRPUSDT',
  'ADA/USD': 'ADAUSDT',
};

// Timeframe mapping: our format -> Binance interval
const TIMEFRAME_MAP: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1d',
};

export type SupportedSymbol = keyof typeof SYMBOL_MAP;
export type SupportedTimeframe = keyof typeof TIMEFRAME_MAP;

export const AVAILABLE_SYMBOLS: SupportedSymbol[] = Object.keys(SYMBOL_MAP) as SupportedSymbol[];
export const AVAILABLE_TIMEFRAMES: SupportedTimeframe[] = Object.keys(TIMEFRAME_MAP) as SupportedTimeframe[];

interface BinanceKline {
  0: number;  // Open time
  1: string;  // Open
  2: string;  // High
  3: string;  // Low
  4: string;  // Close
  5: string;  // Volume
  6: number;  // Close time
  7: string;  // Quote asset volume
  8: number;  // Number of trades
  9: string;  // Taker buy base asset volume
  10: string; // Taker buy quote asset volume
  11: string; // Ignore
}

export interface FetchKlinesOptions {
  symbol: SupportedSymbol;
  timeframe: SupportedTimeframe;
  limit?: number;
}

export interface KlineDataWithVolume {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchKlines({
  symbol,
  timeframe,
  limit = 500,
}: FetchKlinesOptions): Promise<CandlestickData<Time>[]> {
  const data = await fetchKlinesWithVolume({ symbol, timeframe, limit });
  return data.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }));
}

export async function fetchKlinesWithVolume({
  symbol,
  timeframe,
  limit = 500,
}: FetchKlinesOptions): Promise<KlineDataWithVolume[]> {
  const binanceSymbol = SYMBOL_MAP[symbol];
  const interval = TIMEFRAME_MAP[timeframe];

  if (!binanceSymbol || !interval) {
    throw new Error(`Invalid symbol or timeframe: ${symbol}, ${timeframe}`);
  }

  const url = `${BINANCE_API_BASE}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data: BinanceKline[] = await response.json();

    return data.map((kline) => ({
      time: (kline[0] / 1000) as Time,
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error) {
    console.error('Failed to fetch klines from Binance:', error);
    throw error;
  }
}

// Get current price for a symbol
export async function fetchCurrentPrice(symbol: SupportedSymbol): Promise<number> {
  const binanceSymbol = SYMBOL_MAP[symbol];
  
  if (!binanceSymbol) {
    throw new Error(`Invalid symbol: ${symbol}`);
  }

  const url = `${BINANCE_API_BASE}/ticker/price?symbol=${binanceSymbol}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Failed to fetch price from Binance:', error);
    throw error;
  }
}
