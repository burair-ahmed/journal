// src/types/lightweight-charts.d.ts
import {
  IChartApi as IChartApiBase,
  Time,
  DeepPartial,
  ChartOptions,
  CandlestickSeriesOptions,
  ISeriesApi as ISeriesApiBase,
  SeriesMarker,
} from "lightweight-charts";

declare module "lightweight-charts" {
  export interface IChartApi extends IChartApiBase<Time> {
    applyOptions(options: DeepPartial<ChartOptions>): void;
    addCandlestickSeries(
      options?: CandlestickSeriesOptions
    ): ISeriesApi<"Candlestick">;
    addLineSeries?(options?: any): ISeriesApi<"Line">;
    addAreaSeries?(options?: any): ISeriesApi<"Area">;
  }

  // 👇 Extend ISeriesApi to include `setMarkers`
  export interface ISeriesApi<
    SeriesType extends string = any
  > extends ISeriesApiBase<SeriesType> {
    setMarkers(markers: SeriesMarker<Time>[]): void;
  }
}
