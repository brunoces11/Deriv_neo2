import type { 
  ISeriesPrimitive, 
  SeriesAttachedParameter, 
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitivePaneViewZOrder,
  PrimitiveHoveredItem,
} from 'lightweight-charts';
import type { CanvasRenderingTarget2D } from 'fancy-canvas';
import type { DrawingPoint } from './types';

interface NoteOptions {
  point: DrawingPoint;
  color: string;
  text?: string;
  showHandles?: boolean;
}

class NotePaneRenderer implements IPrimitivePaneRenderer {
  private _x: number = 0;
  private _y: number = 0;
  private _color: string = '#a855f7';
  private _showHandles: boolean = false;

  update(x: number, y: number, color: string, showHandles: boolean) {
    this._x = x;
    this._y = y;
    this._color = color;
    this._showHandles = showHandles;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      const x = Math.round(this._x * scope.horizontalPixelRatio);
      const y = Math.round(this._y * scope.verticalPixelRatio);
      const iconSize = 20 * scope.horizontalPixelRatio;

      ctx.save();

      // Draw note icon background (circle)
      ctx.beginPath();
      ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = this._color;
      ctx.fill();

      // Draw note icon (lines representing text)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * scope.horizontalPixelRatio;
      ctx.lineCap = 'round';

      // Three horizontal lines to represent text
      const lineWidth = iconSize * 0.4;
      const lineSpacing = iconSize * 0.15;
      const startX = x - lineWidth / 2;
      
      for (let i = -1; i <= 1; i++) {
        const lineY = y + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(startX + lineWidth, lineY);
        ctx.stroke();
      }

      // Draw selection handles if selected
      if (this._showHandles) {
        ctx.beginPath();
        ctx.arc(x, y, iconSize / 2 + 4 * scope.horizontalPixelRatio, 0, Math.PI * 2);
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 2 * scope.horizontalPixelRatio;
        ctx.setLineDash([4 * scope.horizontalPixelRatio, 4 * scope.horizontalPixelRatio]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  }
}

class NotePaneView implements IPrimitivePaneView {
  private _source: NotePrimitive;
  private _renderer: NotePaneRenderer;

  constructor(source: NotePrimitive) {
    this._source = source;
    this._renderer = new NotePaneRenderer();
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top';
  }

  renderer(): IPrimitivePaneRenderer {
    return this._renderer;
  }

  update() {
    const series = this._source.series;
    if (!series) return;

    const timeScale = this._source.chart?.timeScale();
    if (!timeScale) return;

    const point = this._source.options.point;
    const x = timeScale.timeToCoordinate(point.time as any);
    const y = series.priceToCoordinate(point.price);

    if (x !== null && y !== null) {
      this._renderer.update(x, y, this._source.options.color, this._source.options.showHandles || false);
    }
  }
}

export class NotePrimitive implements ISeriesPrimitive<any> {
  private _id: string;
  private _options: NoteOptions;
  private _paneViews: NotePaneView[];
  private _series: SeriesAttachedParameter<any>['series'] | null = null;
  private _chart: SeriesAttachedParameter<any>['chart'] | null = null;
  private _requestUpdate?: () => void;

  constructor(id: string, options: NoteOptions) {
    this._id = id;
    this._options = options;
    this._paneViews = [new NotePaneView(this)];
  }

  get id() {
    return this._id;
  }

  get options() {
    return this._options;
  }

  get series() {
    return this._series;
  }

  get chart() {
    return this._chart;
  }

  attached(param: SeriesAttachedParameter<any>) {
    this._series = param.series;
    this._chart = param.chart;
    this._requestUpdate = param.requestUpdate;
  }

  detached() {
    this._series = null;
    this._chart = null;
    this._requestUpdate = undefined;
  }

  paneViews() {
    return this._paneViews;
  }

  updateAllViews() {
    this._paneViews.forEach(pv => pv.update());
  }

  hitTest(x: number, y: number): PrimitiveHoveredItem | null {
    if (!this._series || !this._chart) return null;

    const timeScale = this._chart.timeScale();
    const point = this._options.point;
    const pointX = timeScale.timeToCoordinate(point.time as any);
    const pointY = this._series.priceToCoordinate(point.price);

    if (pointX === null || pointY === null) return null;

    const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
    const hitRadius = 15; // pixels

    if (distance <= hitRadius) {
      return {
        cursorStyle: 'pointer',
        externalId: this._id,
        zOrder: 'top',
      };
    }

    return null;
  }

  updatePoint(point: DrawingPoint) {
    this._options.point = point;
    this._requestUpdate?.();
  }

  updateText(text: string) {
    this._options.text = text;
    this._requestUpdate?.();
  }

  setData(options: NoteOptions) {
    this._options = options;
    this._requestUpdate?.();
  }
}
