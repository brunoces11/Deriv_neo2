import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { fetchKlines, type SupportedSymbol, type SupportedTimeframe } from '../../services/binanceApi';
import { generateMockCandlestickData } from '../../services/mockChartData';
import { ChartToolbar } from './ChartToolbar';

interface ChartLayerProps {
  isVisible: boolean;
  theme: 'dark' | 'light';
}

export function ChartLayer({ isVisible, theme }: ChartLayerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [symbol, setSymbol] = useState<SupportedSymbol>('BTC/USD');
  const [timeframe, setTimeframe] = useState<SupportedTimeframe>('1D');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from Binance API
  const loadData = useCallback(async () => {
    if (!seriesRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchKlines({ symbol, timeframe, limit: 500 });
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Using mock data.');
      // Fallback to mock data
      const mockData = generateMockCandlestickData();
      seriesRef.current.setData(mockData);
      chartRef.current?.timeScale().fitContent();
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  // Initialize chart
  useEffect(() => {
    if (!isVisible || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme === 'dark' ? '#a1a1aa' : '#52525b',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#27272a' : '#e4e4e7' },
        horzLines: { color: theme === 'dark' ? '#27272a' : '#e4e4e7' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#ff444f',
          width: 1,
          style: 2,
          labelBackgroundColor: '#ff444f',
          labelVisible: true,
        },
        horzLine: {
          color: '#ff444f',
          width: 1,
          style: 2,
          labelBackgroundColor: '#ff444f',
          labelVisible: true,
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 8,
        minBarSpacing: 2,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: { mouse: true, touch: true },
      trackingMode: { exitMode: 1 },
      autoSize: true,
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00B67B',
      downColor: '#ff444f',
      borderUpColor: '#00B67B',
      borderDownColor: '#ff444f',
      wickUpColor: '#00B67B',
      wickDownColor: '#ff444f',
      priceLineVisible: true,
      lastValueVisible: true,
    });

    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [isVisible]);

  // Load data when symbol or timeframe changes
  useEffect(() => {
    if (isVisible && seriesRef.current) {
      loadData();
    }
  }, [isVisible, symbol, timeframe, loadData]);

  // Update theme
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme === 'dark' ? '#a1a1aa' : '#52525b',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#27272a' : '#e4e4e7' },
        horzLines: { color: theme === 'dark' ? '#27272a' : '#e4e4e7' },
      },
      rightPriceScale: { borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7' },
      timeScale: { borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7' },
    });
  }, [theme]);

  if (!isVisible) return null;

  // Right offset = collapsed sidebar width (54px) para não sobrepor elementos do chart
  return (
    <div className="fixed inset-0 right-[54px] z-[5]">
      <ChartToolbar
        symbol={symbol}
        timeframe={timeframe}
        onSymbolChange={setSymbol}
        onTimeframeChange={setTimeframe}
        onRefresh={loadData}
        isLoading={isLoading}
        theme={theme}
      />

      {/* Error message */}
      {error && (
        <div className={`absolute top-16 left-4 z-20 px-3 py-2 rounded-lg text-xs pointer-events-auto ${
          theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          {error}
        </div>
      )}

      <div ref={chartContainerRef} className="w-full h-full pointer-events-auto" />
    </div>
  );
}
