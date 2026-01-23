import type { Time } from 'lightweight-charts';

export interface DrawingPoint {
  time: Time;
  price: number;
}

export interface TrendLineData {
  p1: DrawingPoint;
  p2: DrawingPoint;
  color: string;
  lineWidth: number;
  showHandles?: boolean;
}

export interface HorizontalLineData {
  price: number;
  color: string;
  lineWidth: number;
  showHandles?: boolean;
}

export interface RectangleData {
  p1: DrawingPoint;
  p2: DrawingPoint;
  fillColor: string;
  borderColor: string;
  lineWidth: number;
  showHandles?: boolean;
}
