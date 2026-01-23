import type {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  Time,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitiveHoveredItem,
} from 'lightweight-charts';
import type { CanvasRenderingTarget2D } from 'fancy-canvas';
import type { RectangleData, DrawingPoint } from './types';

class RectanglePaneRenderer implements IPrimitivePaneRenderer {
  private _x1: number = 0;
  private _y1: number = 0;
  private _x2: number = 0;
  private _y2: number = 0;
  private _fillColor: string = 'rgba(255, 68, 79, 0.1)';
  private _borderColor: string = '#ff444f';
  private _lineWidth: number = 1;
  private _showHandles: boolean = false;

  update(x1: number, y1: number, x2: number, y2: number, fillColor: string, borderColor: string, lineWidth: number, showHandles: boolean = false) {
    this._x1 = Math.min(x1, x2);
    this._y1 = Math.min(y1, y2);
    this._x2 = Math.max(x1, x2);
    this._y2 = Math.max(y1, y2);
    this._fillColor = fillColor;
    this._borderColor = borderColor;
    this._lineWidth = lineWidth;
    this._showHandles = showHandles;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      const scaledX1 = Math.round(this._x1 * scope.horizontalPixelRatio);
      const scaledY1 = Math.round(this._y1 * scope.verticalPixelRatio);
      const scaledX2 = Math.round(this._x2 * scope.horizontalPixelRatio);
      const scaledY2 = Math.round(this._y2 * scope.verticalPixelRatio);
      const width = scaledX2 - scaledX1;
      const height = scaledY2 - scaledY1;

      ctx.save();
      
      // Fill
      ctx.fillStyle = this._fillColor;
      ctx.fillRect(scaledX1, scaledY1, width, height);
      
      // Border
      ctx.strokeStyle = this._borderColor;
      ctx.lineWidth = this._lineWidth * scope.horizontalPixelRatio;
      ctx.strokeRect(scaledX1, scaledY1, width, height);
      
      // Draw handles when selected (4 corners)
      if (this._showHandles) {
        const handleRadius = 5 * scope.horizontalPixelRatio;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = this._borderColor;
        ctx.lineWidth = 2 * scope.horizontalPixelRatio;
        
        // Top-left
        ctx.beginPath();
        ctx.arc(scaledX1, scaledY1, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.arc(scaledX2, scaledY1, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Bottom-left
        ctx.beginPath();
        ctx.arc(scaledX1, scaledY2, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Bottom-right
        ctx.beginPath();
        ctx.arc(scaledX2, scaledY2, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }
}

class RectanglePaneView implements IPrimitivePaneView {
  private _source: RectanglePrimitive;
  private _renderer: RectanglePaneRenderer;

  constructor(source: RectanglePrimitive) {
    this._source = source;
    this._renderer = new RectanglePaneRenderer();
  }

  update() {
    const data = this._source.getData();
    if (!data || !this._source._series || !this._source._chart) return;

    const timeScale = this._source._chart.timeScale();
    const x1 = timeScale.timeToCoordinate(data.p1.time);
    const x2 = timeScale.timeToCoordinate(data.p2.time);
    const y1 = this._source._series.priceToCoordinate(data.p1.price);
    const y2 = this._source._series.priceToCoordinate(data.p2.price);

    if (x1 === null || x2 === null || y1 === null || y2 === null) return;

    this._renderer.update(x1, y1, x2, y2, data.fillColor, data.borderColor, data.lineWidth, data.showHandles || false);
  }

  renderer() {
    return this._renderer;
  }

  zOrder(): 'top' | 'bottom' | 'normal' {
    return 'bottom';
  }
}

export class RectanglePrimitive implements ISeriesPrimitive<Time> {
  private _data: RectangleData | null = null;
  private _paneView: RectanglePaneView;
  public _series: SeriesAttachedParameter<Time>['series'] | null = null;
  public _chart: SeriesAttachedParameter<Time>['chart'] | null = null;
  private _requestUpdate: (() => void) | null = null;
  private _id: string;

  constructor(id: string, data?: RectangleData) {
    this._id = id;
    this._data = data || null;
    this._paneView = new RectanglePaneView(this);
  }

  getId(): string {
    return this._id;
  }

  getData(): RectangleData | null {
    return this._data;
  }

  setData(data: RectangleData) {
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
