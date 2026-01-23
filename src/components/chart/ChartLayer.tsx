import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { fetchKlinesWithVolume, type SupportedSymbol, type SupportedTimeframe, type KlineDataWithVolume } from '../../services/binanceApi';
import { generateMockCandlestickData } from '../../services/mockChartData';
import { useDrawingTools, DRAWING_COLORS } from '../../store/DrawingToolsContext';
import { useViewMode } from '../../store/ViewModeContext';
import { useChat } from '../../store/ChatContext';
import { TrendLinePrimitive } from './primitives/TrendLinePrimitive';
import { HorizontalLinePrimitive } from './primitives/HorizontalLinePrimitive';
import { RectanglePrimitive } from './primitives/RectanglePrimitive';
import type { DrawingPoint } from './primitives/types';

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

type PrimitiveInstance = TrendLinePrimitive | HorizontalLinePrimitive | RectanglePrimitive;

export function ChartLayer({ isVisible, theme }: ChartLayerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const primitivesRef = useRef<Map<string, PrimitiveInstance>>(new Map());
  const rawDataRef = useRef<KlineDataWithVolume[]>([]);

  const [symbol] = useState<SupportedSymbol>('BTC/USD');
  const [timeframe] = useState<SupportedTimeframe>('1D');
  const [, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get sidebar width from ViewMode context
  const { executionsSidebarWidth, executionsSidebarCollapsed } = useViewMode();
  const sidebarWidth = executionsSidebarCollapsed ? 54 : executionsSidebarWidth;

  // Drawing state
  const { activeTool, addDrawing, drawings, setActiveTool, selectDrawing, selectedDrawingId } = useDrawingTools();
  const { currentSessionId, addDrawingToSession } = useChat();
  const [pendingPoint, setPendingPoint] = useState<DrawingPoint | null>(null);
  const [previewPrimitive, setPreviewPrimitive] = useState<PrimitiveInstance | null>(null);
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

  // Load data from Binance API
  const loadData = useCallback(async () => {
    if (!seriesRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchKlinesWithVolume({ symbol, timeframe, limit: 500 });
      rawDataRef.current = data;
      
      // Check again in case component unmounted during fetch
      if (!seriesRef.current) return;
      
      // Set candlestick data
      seriesRef.current.setData(data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })));
      
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Using mock data.');
      
      // Check if series still exists before setting mock data
      if (seriesRef.current) {
        const mockData = generateMockCandlestickData();
        seriesRef.current.setData(mockData);
        chartRef.current?.timeScale().fitContent();
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  // Convert pixel coordinates to chart coordinates
  const pixelToChartCoords = useCallback((x: number, y: number): { time: Time; price: number } | null => {
    if (!chartRef.current || !seriesRef.current || !chartContainerRef.current) return null;

    const rect = chartContainerRef.current.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    const timeScale = chartRef.current.timeScale();
    const time = timeScale.coordinateToTime(localX);
    const price = seriesRef.current.coordinateToPrice(localY);

    if (time === null || price === null) return null;

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
    if (tool === 'horizontal') return; // No preview for horizontal

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
    if (!isVisible || !chartContainerRef.current) return;

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

    // Load initial data
    loadData();

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

  // Resize chart when sidebar width changes
  useEffect(() => {
    if (chartContainerRef.current && chartRef.current) {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    }
  }, [sidebarWidth]);

  // Attach click and mousemove handlers
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    container.addEventListener('click', handleChartClick);
    container.addEventListener('mousemove', handleChartMouseMove);

    return () => {
      container.removeEventListener('click', handleChartClick);
      container.removeEventListener('mousemove', handleChartMouseMove);
    };
  }, [handleChartClick, handleChartMouseMove]);

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
      
      // If selection state changed, recreate the primitive
      if (existingPrimitive) {
        // Remove and recreate to update visual state
        series.detachPrimitive(existingPrimitive);
        primitivesRef.current.delete(drawing.id);
      }

      let primitive: PrimitiveInstance | null = null;
      
      // Get colors for this drawing type
      const colors = DRAWING_COLORS[drawing.type];
      const displayColor = isSelected ? colors.selectedColor : colors.color;
      const selectedLineWidth = 3;

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
          fillColor: isSelected ? `${colors.selectedColor}26` : `${colors.color}1a`, // 15% or 10% opacity
          borderColor: displayColor,
          lineWidth: isSelected ? selectedLineWidth : 1,
          showHandles: isSelected,
        });
      }

      if (primitive) {
        series.attachPrimitive(primitive);
        primitivesRef.current.set(drawing.id, primitive);
      }
    }
  }, [drawings, selectedDrawingId]);

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
  }, [theme]);

  // Cancel drawing on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingPoint(null);
        setActiveTool('none');
        if (previewPrimitive && seriesRef.current) {
          seriesRef.current.detachPrimitive(previewPrimitive);
          setPreviewPrimitive(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPrimitive, setActiveTool]);

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
    </div>
  );
}
