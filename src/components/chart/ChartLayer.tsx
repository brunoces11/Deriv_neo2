import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import { generateMockCandlestickData } from '../../services/mockChartData';

interface ChartLayerProps {
  isVisible: boolean;
  theme: 'dark' | 'light';
  symbol?: string;
}

export function ChartLayer({ isVisible, theme, symbol = 'BTC/USD' }: ChartLayerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 8,
        minBarSpacing: 2,
      },
      // Enable all mouse interactions
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
      kineticScroll: {
        mouse: true,
        touch: true,
      },
      trackingMode: {
        exitMode: 1, // Exit tracking mode on next click
      },
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

    const mockData = generateMockCandlestickData();
    candlestickSeries.setData(mockData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial resize to ensure proper sizing
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [isVisible, theme]);

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
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
      },
    });
  }, [theme]);

  if (!isVisible) return null;

  const labelClass = theme === 'dark'
    ? 'absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 text-zinc-300 border border-zinc-700/50'
    : 'absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 text-gray-700 border border-gray-200';

  return (
    <div className="fixed inset-0 z-[5]">
      <div className={labelClass}>{symbol}</div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
