import type {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  Time,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitiveHoveredItem,
} from 'lightweight-charts';
import type { CanvasRenderingTarget2D } from 'fancy-canvas';
import type { TrendLineData, DrawingPoint } from './types';

class TrendLinePaneRenderer implements IPrimitivePaneRenderer {
  private _p1X: number = 0;
  private _p1Y: number = 0;
  private _p2X: number = 0;
  private _p2Y: number = 0;
  private _color: string = '#ff444f';
  private _lineWidth: number = 2;
  private _showHandles: boolean = false;

  update(p1X: number, p1Y: number, p2X: number, p2Y: number, color: string, lineWidth: number, showHandles: boolean = false) {
    this._p1X = p1X;
    this._p1Y = p1Y;
    this._p2X = p2X;
    this._p2Y = p2Y;
    this._color = color;
    this._lineWidth = lineWidth;
    this._showHandles = showHandles;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      const scaledP1X = Math.round(this._p1X * scope.horizontalPixelRatio);
      const scaledP1Y = Math.round(this._p1Y * scope.verticalPixelRatio);
      const scaledP2X = Math.round(this._p2X * scope.horizontalPixelRatio);
      const scaledP2Y = Math.round(this._p2Y * scope.verticalPixelRatio);

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = this._color;
      ctx.lineWidth = this._lineWidth * scope.horizontalPixelRatio;
      ctx.moveTo(scaledP1X, scaledP1Y);
      ctx.lineTo(scaledP2X, scaledP2Y);
      ctx.stroke();
      
      // Draw handles when selected
      if (this._showHandles) {
        const handleRadius = 5 * scope.horizontalPixelRatio;
        
        // Handle 1
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 2 * scope.horizontalPixelRatio;
        ctx.arc(scaledP1X, scaledP1Y, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Handle 2
        ctx.beginPath();
        ctx.arc(scaledP2X, scaledP2Y, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }
}

class TrendLinePaneView implements IPrimitivePaneView {
  private _source: TrendLinePrimitive;
  private _renderer: TrendLinePaneRenderer;

  constructor(source: TrendLinePrimitive) {
    this._source = source;
    this._renderer = new TrendLinePaneRenderer();
  }

  update() {
    const data = this._source.getData();
    if (!data || !this._source._series || !this._source._chart) return;

    const timeScale = this._source._chart.timeScale();
    const p1X = timeScale.timeToCoordinate(data.p1.time);
    const p2X = timeScale.timeToCoordinate(data.p2.time);
    const p1Y = this._source._series.priceToCoordinate(data.p1.price);
    const p2Y = this._source._series.priceToCoordinate(data.p2.price);

    if (p1X === null || p2X === null || p1Y === null || p2Y === null) return;

    this._renderer.update(p1X, p1Y, p2X, p2Y, data.color, data.lineWidth, data.showHandles || false);
  }

  renderer() {
    return this._renderer;
  }

  zOrder(): 'top' | 'bottom' | 'normal' {
    return 'top';
  }
}

export class TrendLinePrimitive implements ISeriesPrimitive<Time> {
  private _data: TrendLineData | null = null;
  private _paneView: TrendLinePaneView;
  public _series: SeriesAttachedParameter<Time>['series'] | null = null;
  public _chart: SeriesAttachedParameter<Time>['chart'] | null = null;
  private _requestUpdate: (() => void) | null = null;
  private _id: string;

  constructor(id: string, data?: TrendLineData) {
    this._id = id;
    this._data = data || null;
    this._paneView = new TrendLinePaneView(this);
  }

  getId(): string {
    return this._id;
  }

  getData(): TrendLineData | null {
    return this._data;
  }

  setData(data: TrendLineData) {
    this._data = data;
    this._requestUpdate?.();
  }

  updatePoint(pointIndex: 1 | 2, point: DrawingPoint) {
    if (!this._data) return;
    if (pointIndex === 1) {
      this._data.p1 = point;
    } else {
      this._data.p2 = point;
    }
    this._requestUpdate?.();
  }

  attached(param: SeriesAttachedParameter<Time>) {
    this._series = param.series;
    this._chart = param.chart;
    this._requestUpdate = param.requestUpdate;
  }

  detached() {
    this._series = null;
    this._chart = null;
    this._requestUpdate = null;
  }

  paneViews() {
    return [this._paneView];
  }

  updateAllViews() {
    this._paneView.update();
  }

  hitTest(): PrimitiveHoveredItem | null {
    return null;
  }
}
