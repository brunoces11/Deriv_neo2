import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, CrosshairMode, LineStyle } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time, LineData } from 'lightweight-charts';
import { fetchKlinesWithVolume, type SupportedSymbol, type SupportedTimeframe, type KlineDataWithVolume } from '../../services/binanceApi';
import { generateMockCandlestickData } from '../../services/mockChartData';
import { useDrawingTools, DRAWING_COLORS } from '../../store/DrawingToolsContext';
import { useViewMode } from '../../store/ViewModeContext';
import { useChat } from '../../store/ChatContext';
import { TrendLinePrimitive } from './primitives/TrendLinePrimitive';
import { HorizontalLinePrimitive } from './primitives/HorizontalLinePrimitive';
import { RectanglePrimitive } from './primitives/RectanglePrimitive';
import { NotePrimitive } from './primitives/NotePrimitive';
import type { DrawingPoint } from './primitives/types';
import { MessageSquare, Trash2 } from 'lucide-react';

// Helper function to calculate distance from point to line segment
function distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }
  
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  
  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;
  
  return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
}

interface ChartLayerProps {
  isVisible: boolean;
  theme: 'dark' | 'light';
}

type PrimitiveInstance = TrendLinePrimitive | HorizontalLinePrimitive | RectanglePrimitive | NotePrimitive;

export function ChartLayer({ isVisible, theme }: ChartLayerProps) {
  console.log('[ChartLayer] Render, isVisible:', isVisible);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const primitivesRef = useRef<Map<string, PrimitiveInstance>>(new Map());
  const rawDataRef = useRef<KlineDataWithVolume[]>([]);

  const [symbol] = useState<SupportedSymbol>('BTC/USD');
  const [timeframe] = useState<SupportedTimeframe>('1D');
  const [, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);

  // Drawing state
  const { activeTool, addDrawing, updateDrawing, drawings, setActiveTool, selectDrawing, selectedDrawingId, removeDrawing, addTagToChat } = useDrawingTools();
  const { currentSessionId, addDrawingToSession, updateDrawingInSession, removeDrawingFromSession } = useChat();
  const { cardsSidebarWidth, cardsSidebarCollapsed, updateUserPoint, setBtcPrice } = useViewMode();
  
  // Get sidebar width from ViewMode context
  const sidebarWidth = cardsSidebarCollapsed ? 54 : cardsSidebarWidth;

  const [pendingPoint, setPendingPoint] = useState<DrawingPoint | null>(null);
  const [previewPrimitive, setPreviewPrimitive] = useState<PrimitiveInstance | null>(null);
  const [menuUpdateTrigger, setMenuUpdateTrigger] = useState(0);
  const [noteInputText, setNoteInputText] = useState('');
  const activeToolRef = useRef(activeTool);
  const pendingPointRef = useRef(pendingPoint);
  const drawingsRef = useRef(drawings);
  const selectedDrawingIdRef = useRef(selectedDrawingId);
  const currentSessionIdRef = useRef(currentSessionId);

  // Keep refs in sync
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    pendingPointRef.current = pendingPoint;
  }, [pendingPoint]);

  useEffect(() => {
    drawingsRef.current = drawings;
  }, [drawings]);

  useEffect(() => {
    selectedDrawingIdRef.current = selectedDrawingId;
  }, [selectedDrawingId]);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  // Calculate floating menu position for selected drawing
  const floatingMenuPosition = useMemo(() => {
    if (!selectedDrawingId || !chartRef.current || !seriesRef.current || !chartContainerRef.current) {
      return null;
    }

    const selectedDrawing = drawings.find(d => d.id === selectedDrawingId);
    if (!selectedDrawing) return null;

    const timeScale = chartRef.current.timeScale();
    const series = seriesRef.current;
    const containerRect = chartContainerRef.current.getBoundingClientRect();

    let menuX = 0;
    let menuY = 0;

    if (selectedDrawing.type === 'horizontal') {
      // For horizontal line, position at the center of the chart
      const priceY = series.priceToCoordinate(selectedDrawing.points[0].price);
      if (priceY === null) return null;
      menuX = containerRect.width / 2; // Position at center
      menuY = priceY;
    } else if (selectedDrawing.type === 'note' && selectedDrawing.points.length >= 1) {
      // For note, position to the right of the note icon (offset by 25px to not overlap)
      const x = timeScale.timeToCoordinate(selectedDrawing.points[0].time as Time);
      const y = series.priceToCoordinate(selectedDrawing.points[0].price);
      if (x === null || y === null) return null;
      menuX = x + 25; // Position to the right of the note icon
      menuY = y - 20; // Slightly above center
    } else if (selectedDrawing.type === 'trendline' && selectedDrawing.points.length >= 2) {
      // For trendline, position at the second point (end point)
      const x2 = timeScale.timeToCoordinate(selectedDrawing.points[1].time as Time);
      const y2 = series.priceToCoordinate(selectedDrawing.points[1].price);
      if (x2 === null || y2 === null) return null;
      menuX = x2 + 10;
      menuY = y2;
    } else if (selectedDrawing.type === 'rectangle' && selectedDrawing.points.length >= 2) {
      // For rectangle, position at top-right corner
      const x1 = timeScale.timeToCoordinate(selectedDrawing.points[0].time as Time);
      const x2 = timeScale.timeToCoordinate(selectedDrawing.points[1].time as Time);
      const y1 = series.priceToCoordinate(selectedDrawing.points[0].price);
      const y2 = series.priceToCoordinate(selectedDrawing.points[1].price);
      if (x1 === null || x2 === null || y1 === null || y2 === null) return null;
      menuX = Math.max(x1, x2) + 10;
      menuY = Math.min(y1, y2);
    }

    // Ensure menu stays within bounds
    menuX = Math.min(menuX, containerRect.width - 100);
    menuX = Math.max(menuX, 10);
    menuY = Math.max(menuY, 10);
    menuY = Math.min(menuY, containerRect.height - 80);

    return { x: menuX, y: menuY };
  }, [selectedDrawingId, drawings, menuUpdateTrigger]);

  // Handle send to chat action
  const handleSendToChat = useCallback(() => {
    const selectedDrawing = drawings.find(d => d.id === selectedDrawingId);
    if (!selectedDrawing) return;
    
    addTagToChat(selectedDrawing);
    
    // Expand sidebar if needed
    if (cardsSidebarCollapsed || cardsSidebarWidth < 500) {
      updateUserPoint({ 
        cardsSidebarCollapsed: false,
        cardsSidebarWidth: 500 
      });
    }
    
    selectDrawing(null);
  }, [selectedDrawingId, drawings, addTagToChat, cardsSidebarCollapsed, cardsSidebarWidth, updateUserPoint, selectDrawing]);

  // Handle delete drawing action
  const handleDeleteDrawing = useCallback(() => {
    if (!selectedDrawingId) return;
    removeDrawing(selectedDrawingId);
    removeDrawingFromSession(selectedDrawingId);
  }, [selectedDrawingId, removeDrawing, removeDrawingFromSession]);

  const calculateBollingerBands = useCallback((data: { time: Time; close: number }[], period = 20, stdDev = 2) => {
    const upper: LineData[] = [];
    const middle: LineData[] = [];
    const lower: LineData[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const closes = slice.map(d => d.close);
      const sma = closes.reduce((a, b) => a + b, 0) / period;
      const variance = closes.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
      const std = Math.sqrt(variance);

      upper.push({ time: data[i].time, value: sma + stdDev * std });
      middle.push({ time: data[i].time, value: sma });
      lower.push({ time: data[i].time, value: sma - stdDev * std });
    }

    return { upper, middle, lower };
  }, []);

  // Load data from Binance API
  const loadData = useCallback(async () => {
    if (!seriesRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchKlinesWithVolume({ symbol, timeframe, limit: 500 });
      rawDataRef.current = data;

      // Update BTC price in context (last candle close price)
      if (data.length > 0 && symbol === 'BTC/USD') {
        const lastPrice = data[data.length - 1].close;
        setBtcPrice(lastPrice);
      }

      if (!seriesRef.current) return;

      seriesRef.current.setData(data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })));

      const bbData = calculateBollingerBands(data.map(d => ({ time: d.time, close: d.close })));
      bbUpperRef.current?.setData(bbData.upper);
      bbMiddleRef.current?.setData(bbData.middle);
      bbLowerRef.current?.setData(bbData.lower);

      const visibleBars = 70;
      const totalBars = data.length;
      if (totalBars > visibleBars) {
        chartRef.current?.timeScale().setVisibleLogicalRange({
          from: totalBars - visibleBars,
          to: totalBars + 5,
        });
      } else {
        chartRef.current?.timeScale().fitContent();
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Using mock data.');

      if (seriesRef.current) {
        const mockData = generateMockCandlestickData();
        seriesRef.current.setData(mockData);

        const bbData = calculateBollingerBands(mockData.map(d => ({ time: d.time, close: d.close })));
        bbUpperRef.current?.setData(bbData.upper);
        bbMiddleRef.current?.setData(bbData.middle);
        bbLowerRef.current?.setData(bbData.lower);

        const visibleBars = 70;
        const totalBars = mockData.length;
        if (totalBars > visibleBars) {
          chartRef.current?.timeScale().setVisibleLogicalRange({
            from: totalBars - visibleBars,
            to: totalBars + 5,
          });
        } else {
          chartRef.current?.timeScale().fitContent();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe, calculateBollingerBands]);

  // Convert pixel coordinates to chart coordinates
  const pixelToChartCoords = useCallback((x: number, y: number): { time: Time; price: number } | null => {
    if (!chartRef.current || !seriesRef.current || !chartContainerRef.current) {
      console.warn('[ChartLayer] pixelToChartCoords: refs not ready', {
        chart: !!chartRef.current,
        series: !!seriesRef.current,
        container: !!chartContainerRef.current
      });
      return null;
    }

    const rect = chartContainerRef.current.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    const timeScale = chartRef.current.timeScale();
    const time = timeScale.coordinateToTime(localX);
    const price = seriesRef.current.coordinateToPrice(localY);

    if (time === null || price === null) {
      console.warn('[ChartLayer] pixelToChartCoords: could not convert coordinates', {
        time, price, localX, localY
      });
      return null;
    }

    return { time, price };
  }, []);

  // Hit detection for selecting drawings
  const findDrawingAtPoint = useCallback((x: number, y: number): string | null => {
    if (!chartRef.current || !seriesRef.current || !chartContainerRef.current) return null;

    const rect = chartContainerRef.current.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;
    const timeScale = chartRef.current.timeScale();
    const series = seriesRef.current;
    const threshold = 10; // pixels

    for (const drawing of drawingsRef.current) {
      if (drawing.type === 'horizontal') {
        const drawingY = series.priceToCoordinate(drawing.points[0].price);
        if (drawingY !== null && Math.abs(localY - drawingY) < threshold) {
          return drawing.id;
        }
      } else if (drawing.type === 'note' && drawing.points.length >= 1) {
        // Note is a point - check if click is within note icon area (20x20 pixels)
        const noteX = timeScale.timeToCoordinate(drawing.points[0].time as Time);
        const noteY = series.priceToCoordinate(drawing.points[0].price);
        if (noteX !== null && noteY !== null) {
          const noteThreshold = 15; // Larger threshold for note icon
          if (Math.abs(localX - noteX) < noteThreshold && Math.abs(localY - noteY) < noteThreshold) {
            return drawing.id;
          }
        }
      } else if (drawing.type === 'trendline' && drawing.points.length >= 2) {
        const x1 = timeScale.timeToCoordinate(drawing.points[0].time as Time);
        const y1 = series.priceToCoordinate(drawing.points[0].price);
        const x2 = timeScale.timeToCoordinate(drawing.points[1].time as Time);
        const y2 = series.priceToCoordinate(drawing.points[1].price);
        
        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          // Distance from point to line segment
          const dist = distanceToLineSegment(localX, localY, x1, y1, x2, y2);
          if (dist < threshold) {
            return drawing.id;
          }
        }
      } else if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
        const x1 = timeScale.timeToCoordinate(drawing.points[0].time as Time);
        const y1 = series.priceToCoordinate(drawing.points[0].price);
        const x2 = timeScale.timeToCoordinate(drawing.points[1].time as Time);
        const y2 = series.priceToCoordinate(drawing.points[1].price);
        
        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          const minX = Math.min(x1, x2);
          const maxX = Math.max(x1, x2);
          const minY = Math.min(y1, y2);
          const maxY = Math.max(y1, y2);
          
          if (localX >= minX && localX <= maxX && localY >= minY && localY <= maxY) {
            return drawing.id;
          }
        }
      }
    }
    return null;
  }, []);

  // Handle chart click for drawing or selection
  const handleChartClick = useCallback((e: MouseEvent) => {
    // Ensure chart is initialized before processing clicks
    if (!chartRef.current || !seriesRef.current) {
      console.warn('[ChartLayer] Chart not ready yet, ignoring click');
      return;
    }
    
    const tool = activeToolRef.current;
    
    // If no tool is active, try to select a drawing
    if (tool === 'none') {
      const hitDrawingId = findDrawingAtPoint(e.clientX, e.clientY);
      selectDrawing(hitDrawingId); // Will be null if clicked on empty space
      return;
    }

    const coords = pixelToChartCoords(e.clientX, e.clientY);
    if (!coords) return;

    const point: DrawingPoint = { time: coords.time, price: coords.price };

    // Use currentSessionId directly from context (not ref) for persistence
    const sessionIdForPersistence = currentSessionId;

    if (tool === 'horizontal') {
      // Horizontal line needs only 1 click
      const newDrawing = addDrawing({
        type: 'horizontal',
        points: [{ time: coords.time as number, price: coords.price }],
        color: DRAWING_COLORS.horizontal.color,
      });
      // Persist to session if active
      if (sessionIdForPersistence) {
        console.log('Persisting horizontal drawing to session:', sessionIdForPersistence);
        addDrawingToSession(newDrawing);
      } else {
        console.warn('No session ID available for drawing persistence');
      }
    } else if (tool === 'note') {
      // Note needs only 1 click - creates a note at the clicked position
      const newDrawing = addDrawing({
        type: 'note',
        points: [{ time: coords.time as number, price: coords.price }],
        color: DRAWING_COLORS.note.color,
        text: '', // Empty text initially, user will edit
      });
      // Select the note immediately so user can edit it
      selectDrawing(newDrawing.id);
      // Persist to session if active
      if (sessionIdForPersistence) {
        console.log('Persisting note drawing to session:', sessionIdForPersistence);
        addDrawingToSession(newDrawing);
      } else {
        console.warn('No session ID available for drawing persistence');
      }
    } else if (tool === 'trendline' || tool === 'rectangle') {
      // Trend line and rectangle need 2 clicks
      const pending = pendingPointRef.current;
      if (!pending) {
        setPendingPoint(point);
      } else {
        const newDrawing = addDrawing({
          type: tool,
          points: [
            { time: pending.time as number, price: pending.price },
            { time: coords.time as number, price: coords.price },
          ],
          color: DRAWING_COLORS[tool].color,
        });
        // Persist to session if active
        if (sessionIdForPersistence) {
          console.log(`Persisting ${tool} drawing to session:`, sessionIdForPersistence);
          addDrawingToSession(newDrawing);
        } else {
          console.warn('No session ID available for drawing persistence');
        }
        setPendingPoint(null);
        // Remove preview
        if (previewPrimitive && seriesRef.current) {
          seriesRef.current.detachPrimitive(previewPrimitive);
          setPreviewPrimitive(null);
        }
      }
    }
  }, [addDrawing, pixelToChartCoords, previewPrimitive, findDrawingAtPoint, selectDrawing, addDrawingToSession, currentSessionId]);

  // Handle mouse move for preview
  const handleChartMouseMove = useCallback((e: MouseEvent) => {
    const tool = activeToolRef.current;
    const pending = pendingPointRef.current;
    
    if (tool === 'none' || !pending) return;
    if (tool === 'horizontal' || tool === 'note') return; // No preview for horizontal or note

    const coords = pixelToChartCoords(e.clientX, e.clientY);
    if (!coords) return;

    const series = seriesRef.current;
    if (!series) return;

    // Update or create preview primitive
    if (previewPrimitive) {
      if (tool === 'trendline' && previewPrimitive instanceof TrendLinePrimitive) {
        previewPrimitive.updatePoint(2, { time: coords.time, price: coords.price });
      } else if (tool === 'rectangle' && previewPrimitive instanceof RectanglePrimitive) {
        previewPrimitive.updatePoint(2, { time: coords.time, price: coords.price });
      }
    } else {
      // Create preview primitive
      const id = 'preview';
      let primitive: PrimitiveInstance | null = null;

      if (tool === 'trendline') {
        primitive = new TrendLinePrimitive(id, {
          p1: pending,
          p2: { time: coords.time, price: coords.price },
          color: `${DRAWING_COLORS.trendline.color}80`, // 50% opacity
          lineWidth: 2,
        });
      } else if (tool === 'rectangle') {
        primitive = new RectanglePrimitive(id, {
          p1: pending,
          p2: { time: coords.time, price: coords.price },
          fillColor: `${DRAWING_COLORS.rectangle.color}1a`, // 10% opacity
          borderColor: `${DRAWING_COLORS.rectangle.color}80`, // 50% opacity
          lineWidth: 1,
        });
      }

      if (primitive) {
        series.attachPrimitive(primitive);
        setPreviewPrimitive(primitive);
      }
    }
  }, [pixelToChartCoords, previewPrimitive]);

  // Initialize chart
  useEffect(() => {
    console.log('[ChartLayer] Init useEffect, isVisible:', isVisible, 'container:', !!chartContainerRef.current);
    if (!isVisible || !chartContainerRef.current) return;

    console.log('[ChartLayer] Creating chart...');
    // Main candlestick chart
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
          color: '#52525b',
          width: 1,
          style: 2,
          labelBackgroundColor: '#52525b',
          labelVisible: true,
        },
        horzLine: {
          color: '#52525b',
          width: 1,
          style: 2,
          labelBackgroundColor: '#52525b',
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
        barSpacing: 14, // Increased for better visibility (~70 candles)
        minBarSpacing: 4,
        visible: true, // Show time scale on main chart
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
      autoSize: false,
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

    const bbOuterColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
    const bbMiddleColor = theme === 'dark' ? '#525252' : '#d1d5db';

    const bbUpper = chart.addSeries(LineSeries, {
      color: bbOuterColor,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    bbUpperRef.current = bbUpper;

    const bbMiddle = chart.addSeries(LineSeries, {
      color: bbMiddleColor,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    bbMiddleRef.current = bbMiddle;

    const bbLower = chart.addSeries(LineSeries, {
      color: bbOuterColor,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    bbLowerRef.current = bbLower;
    
    // Mark chart as ready for event listeners
    setChartReady(true);
    console.log('[ChartLayer] Chart marked as ready');

    // Load initial data
    loadData();

    // Update floating menu position when chart scrolls/zooms
    const updateMenuPosition = () => {
      setMenuUpdateTrigger(prev => prev + 1);
    };
    
    chart.timeScale().subscribeVisibleLogicalRangeChange(updateMenuPosition);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
      updateMenuPosition();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(updateMenuPosition);
      setChartReady(false);
      primitivesRef.current.clear();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
        bbUpperRef.current = null;
        bbMiddleRef.current = null;
        bbLowerRef.current = null;
      }
    };
  }, [isVisible]);

  // Resize chart when sidebar width changes
  useEffect(() => {
    if (chartContainerRef.current && chartRef.current) {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    }
  }, [sidebarWidth]);

  // Attach click and mousemove handlers - wait for chart to be ready
  useEffect(() => {
    const container = chartContainerRef.current;
    
    console.log('[ChartLayer] Attaching event listeners check:', {
      container: !!container,
      chartReady,
      isVisible
    });
    
    // Only attach listeners when chart is fully initialized
    if (!container || !chartReady) {
      console.warn('[ChartLayer] Chart not ready yet, skipping event listener attachment');
      return;
    }

    console.log('[ChartLayer] Event listeners attached successfully');
    container.addEventListener('click', handleChartClick);
    container.addEventListener('mousemove', handleChartMouseMove);

    return () => {
      console.log('[ChartLayer] Removing event listeners');
      container.removeEventListener('click', handleChartClick);
      container.removeEventListener('mousemove', handleChartMouseMove);
    };
  }, [handleChartClick, handleChartMouseMove, chartReady]);

  // Clean up preview when tool changes
  useEffect(() => {
    if (activeTool === 'none') {
      setPendingPoint(null);
      if (previewPrimitive && seriesRef.current) {
        seriesRef.current.detachPrimitive(previewPrimitive);
        setPreviewPrimitive(null);
      }
    }
  }, [activeTool, previewPrimitive]);

  // Sync drawings with primitives (including selection state)
  // OPTIMIZED: Update existing primitives in-place instead of detach/attach cycle
  useEffect(() => {
    if (!seriesRef.current) return;

    const series = seriesRef.current;
    const currentIds = new Set(drawings.map(d => d.id));
    const existingIds = new Set(primitivesRef.current.keys());

    // Remove primitives that no longer exist
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        const primitive = primitivesRef.current.get(id);
        if (primitive) {
          series.detachPrimitive(primitive);
          primitivesRef.current.delete(id);
        }
      }
    }

    // Add or update primitives
    for (const drawing of drawings) {
      const isSelected = drawing.id === selectedDrawingId;
      const existingPrimitive = primitivesRef.current.get(drawing.id);
      
      // Get colors for this drawing type
      const colors = DRAWING_COLORS[drawing.type];
      const displayColor = isSelected ? colors.selectedColor : colors.color;
      const selectedLineWidth = 3;

      // UPDATE existing primitive in-place (no flicker)
      if (existingPrimitive) {
        if (drawing.type === 'trendline' && existingPrimitive instanceof TrendLinePrimitive) {
          existingPrimitive.setData({
            p1: { time: drawing.points[0].time as Time, price: drawing.points[0].price },
            p2: { time: drawing.points[1].time as Time, price: drawing.points[1].price },
            color: displayColor,
            lineWidth: isSelected ? selectedLineWidth : 2,
            showHandles: isSelected,
          });
        } else if (drawing.type === 'horizontal' && existingPrimitive instanceof HorizontalLinePrimitive) {
          existingPrimitive.setData({
            price: drawing.points[0].price,
            color: displayColor,
            lineWidth: isSelected ? selectedLineWidth : 2,
            showHandles: isSelected,
          });
        } else if (drawing.type === 'rectangle' && existingPrimitive instanceof RectanglePrimitive) {
          existingPrimitive.setData({
            p1: { time: drawing.points[0].time as Time, price: drawing.points[0].price },
            p2: { time: drawing.points[1].time as Time, price: drawing.points[1].price },
            fillColor: isSelected ? `${colors.selectedColor}26` : `${colors.color}1a`,
            borderColor: displayColor,
            lineWidth: isSelected ? selectedLineWidth : 1,
            showHandles: isSelected,
          });
        } else if (drawing.type === 'note' && existingPrimitive instanceof NotePrimitive) {
          existingPrimitive.setData({
            point: { time: drawing.points[0].time as Time, price: drawing.points[0].price },
            color: displayColor,
            text: drawing.text || '',
            showHandles: isSelected,
          });
        }
        continue; // Skip creation, primitive updated in-place
      }

      // CREATE new primitive only if it doesn't exist
      let primitive: PrimitiveInstance | null = null;

      if (drawing.type === 'trendline' && drawing.points.length >= 2) {
        primitive = new TrendLinePrimitive(drawing.id, {
          p1: { time: drawing.points[0].time as Time, price: drawing.points[0].price },
          p2: { time: drawing.points[1].time as Time, price: drawing.points[1].price },
          color: displayColor,
          lineWidth: isSelected ? selectedLineWidth : 2,
          showHandles: isSelected,
        });
      } else if (drawing.type === 'horizontal' && drawing.points.length >= 1) {
        primitive = new HorizontalLinePrimitive(drawing.id, {
          price: drawing.points[0].price,
          color: displayColor,
          lineWidth: isSelected ? selectedLineWidth : 2,
          showHandles: isSelected,
        });
      } else if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
        primitive = new RectanglePrimitive(drawing.id, {
          p1: { time: drawing.points[0].time as Time, price: drawing.points[0].price },
          p2: { time: drawing.points[1].time as Time, price: drawing.points[1].price },
          fillColor: isSelected ? `${colors.selectedColor}26` : `${colors.color}1a`,
          borderColor: displayColor,
          lineWidth: isSelected ? selectedLineWidth : 1,
          showHandles: isSelected,
        });
      } else if (drawing.type === 'note' && drawing.points.length >= 1) {
        primitive = new NotePrimitive(drawing.id, {
          point: { time: drawing.points[0].time as Time, price: drawing.points[0].price },
          color: displayColor,
          text: drawing.text || '',
          showHandles: isSelected,
        });
      }

      if (primitive) {
        series.attachPrimitive(primitive);
        primitivesRef.current.set(drawing.id, primitive);
      }
    }
  }, [drawings, selectedDrawingId, chartReady]);

  // Clear all primitives when drawings are cleared
  useEffect(() => {
    if (drawings.length === 0 && primitivesRef.current.size > 0 && seriesRef.current) {
      for (const primitive of primitivesRef.current.values()) {
        seriesRef.current.detachPrimitive(primitive);
      }
      primitivesRef.current.clear();
    }
  }, [drawings.length]);

  // Load data when symbol or timeframe changes (after initial load)
  useEffect(() => {
    // Skip initial load (handled in chart initialization)
    if (!chartRef.current || !seriesRef.current) return;
    loadData();
  }, [symbol, timeframe, loadData]);

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

    const bbOuterColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
    const bbMiddleColor = theme === 'dark' ? '#525252' : '#d1d5db';
    bbUpperRef.current?.applyOptions({ color: bbOuterColor });
    bbMiddleRef.current?.applyOptions({ color: bbMiddleColor, lineStyle: LineStyle.Dashed });
    bbLowerRef.current?.applyOptions({ color: bbOuterColor });
  }, [theme]);

  // Cancel drawing on Escape, Delete selected drawing on Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingPoint(null);
        setActiveTool('none');
        if (previewPrimitive && seriesRef.current) {
          seriesRef.current.detachPrimitive(previewPrimitive);
          setPreviewPrimitive(null);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDrawingIdRef.current) {
          removeDrawing(selectedDrawingIdRef.current);
          removeDrawingFromSession(selectedDrawingIdRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPrimitive, setActiveTool, removeDrawing, removeDrawingFromSession]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[5] flex flex-col"
      style={{ right: `${sidebarWidth}px` }}
    >
      {/* ChartToolbar hidden - keeping only drawing tools */}

      {/* Error message */}
      {error && (
        <div className={`absolute top-16 left-4 z-20 px-3 py-2 rounded-lg text-xs pointer-events-auto ${
          theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          {error}
        </div>
      )}

      {/* Drawing mode indicator */}
      {activeTool !== 'none' && (
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3 py-2 rounded-lg text-xs pointer-events-none ${
          theme === 'dark' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-white text-gray-700 border border-gray-200'
        }`}>
          {pendingPoint 
            ? `Click to set second point • Press ESC to cancel`
            : `Click on chart to set first point • Tool: ${activeTool}`
          }
        </div>
      )}

      {/* Main candlestick chart */}
      <div 
        ref={chartContainerRef} 
        className={`flex-1 pointer-events-auto ${activeTool !== 'none' ? 'cursor-crosshair' : ''}`} 
      />

      {/* Floating menu for selected drawing */}
      {selectedDrawingId && floatingMenuPosition && (() => {
        const selectedDrawing = drawings.find(d => d.id === selectedDrawingId);
        const isNote = selectedDrawing?.type === 'note';
        
        return (
          <div
            className={`absolute z-30 pointer-events-auto flex flex-col gap-2 transition-all ${
              theme === 'dark'
                ? 'bg-zinc-800 border border-zinc-700/50'
                : 'bg-white border border-gray-200'
            } ${isNote ? 'rounded-lg p-2' : 'rounded-full p-1'}`}
            style={{
              left: `${floatingMenuPosition.x}px`,
              top: `${floatingMenuPosition.y}px`,
            }}
          >
            {/* Action buttons row */}
            <div className="flex items-center gap-1">
              {/* Send to Chat button */}
              <button
                onClick={handleSendToChat}
                className={`group relative flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                  theme === 'dark'
                    ? 'text-zinc-300 hover:text-blue-400 hover:bg-zinc-700'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-zinc-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Send to Chat
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                </div>
              </button>

              {/* Divider */}
              <div className={`w-px h-5 ${theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-300'}`} />

              {/* Delete button */}
              <button
                onClick={handleDeleteDrawing}
                className={`group relative flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                  theme === 'dark'
                    ? 'text-zinc-300 hover:text-red-400 hover:bg-zinc-700'
                    : 'text-gray-600 hover:text-red-500 hover:bg-gray-100'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-zinc-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Delete
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                </div>
              </button>
            </div>
            
            {/* Note text input - only for notes */}
            {isNote && (
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={noteInputText || selectedDrawing?.text || ''}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setNoteInputText(newText);
                    // Auto-save on change
                    if (selectedDrawing) {
                      updateDrawing(selectedDrawing.id, { text: newText });
                      // Persist to database
                      if (currentSessionId) {
                        updateDrawingInSession(selectedDrawing.id, newText);
                      }
                    }
                  }}
                  placeholder="Add a note..."
                  className={`w-40 h-16 px-2 py-1.5 text-xs rounded-md resize-none focus:outline-none focus:ring-1 ${
                    theme === 'dark'
                      ? 'bg-zinc-700 text-white placeholder-zinc-500 focus:ring-purple-500'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-purple-500'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
