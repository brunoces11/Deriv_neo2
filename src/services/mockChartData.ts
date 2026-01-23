import type { CandlestickData, Time } from 'lightweight-charts';

export function generateMockCandlestickData(days: number = 100): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  const basePrice = 42000; // BTC starting price
  let currentPrice = basePrice;
  
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Random price movement (-3% to +3%)
    const change = (Math.random() - 0.5) * 0.06;
    const open = currentPrice;
    const close = currentPrice * (1 + change);
    
    // High and low with some variance
    const highLowVariance = Math.abs(change) + Math.random() * 0.02;
    const high = Math.max(open, close) * (1 + highLowVariance);
    const low = Math.min(open, close) * (1 - highLowVariance);
    
    data.push({
      time: date.toISOString().split('T')[0] as Time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    });
    
    currentPrice = close;
  }

  return data;
}
