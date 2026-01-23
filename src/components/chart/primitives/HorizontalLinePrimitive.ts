import type {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  Time,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitiveHoveredItem,
} from 'lightweight-charts';
import type { CanvasRenderingTarget2D } from 'fancy-canvas';
import type { HorizontalLineData } from './types';

class HorizontalLinePaneRenderer implements IPrimitivePaneRenderer {
  private _y: number = 0;
  private _width: number = 0;
  private _color: string = '#ff444f';
  private _lineWidth: number = 2;
  private _showHandles: boolean = false;

  update(y: number, width: number, color: string, lineWidth: number, showHandles: boolean = false) {
    this._y = y;
    this._width = width;
    this._color = color;
    this._lineWidth = lineWidth;
    this._showHandles = showHandles;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      const scaledY = Math.round(this._y * scope.verticalPixelRatio);
      const scaledWidth = Math.round(this._width * scope.horizontalPixelRatio);

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = this._color;
      ctx.lineWidth = this._lineWidth * scope.horizontalPixelRatio;
      ctx.setLineDash([5 * scope.horizontalPixelRatio, 5 * scope.horizontalPixelRatio]);
      ctx.moveTo(0, scaledY);
      ctx.lineTo(scaledWidth, scaledY);
      ctx.stroke();
      
      // Draw handles when selected
      if (this._showHandles) {
        const handleRadius = 5 * scope.horizontalPixelRatio;
        ctx.setLineDash([]); // Reset dash for handles
        
        // Handle left
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 2 * scope.horizontalPixelRatio;
        ctx.arc(50 * scope.horizontalPixelRatio, scaledY, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Handle right
        ctx.beginPath();
        ctx.arc(scaledWidth - 50 * scope.horizontalPixelRatio, scaledY, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }
}

class HorizontalLinePaneView implements IPrimitivePaneView {
  private _source: HorizontalLinePrimitive;
  private _renderer: HorizontalLinePaneRenderer;

  constructor(source: HorizontalLinePrimitive) {
    this._source = source;
    this._renderer = new HorizontalLinePaneRenderer();
  }

  update() {
    const data = this._source.getData();
    if (!data || !this._source._series || !this._source._chart) return;

    const y = this._source._series.priceToCoordinate(data.price);
    if (y === null) return;

    const chartElement = this._source._chart.chartElement();
    const width = chartElement?.clientWidth || 1000;

    this._renderer.update(y, width, data.color, data.lineWidth, data.showHandles || false);
  }

  renderer() {
    return this._renderer;
  }

  zOrder(): 'top' | 'bottom' | 'normal' {
    return 'top';
  }
}

export class HorizontalLinePrimitive implements ISeriesPrimitive<Time> {
  private _data: HorizontalLineData | null = null;
  private _paneView: HorizontalLinePaneView;
  public _series: SeriesAttachedParameter<Time>['series'] | null = null;
  public _chart: SeriesAttachedParameter<Time>['chart'] | null = null;
  private _requestUpdate: (() => void) | null = null;
  private _id: string;

  constructor(id: string, data?: HorizontalLineData) {
    this._id = id;
    this._data = data || null;
    this._paneView = new HorizontalLinePaneView(this);
  }

  getId(): string {
    return this._id;
  }

  getData(): HorizontalLineData | null {
    return this._data;
  }

  setData(data: HorizontalLineData) {
    this._data = data;
    this._requestUpdate?.();
  }

  updatePrice(price: number) {
    if (!this._data) return;
    this._data.price = price;
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
