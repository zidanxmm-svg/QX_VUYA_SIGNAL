import { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { Candle, Tick } from '../types';

interface ChartProps {
  data: Candle[];
  lastTick: Tick | null;
}

export default function TradingChart({ data, lastTick }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastCandleRef = useRef<Candle | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: '#0B0E14' },
        textColor: '#D9D9D9',
      },
      watermark: {
        visible: false,
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      localization: {
        priceFormatter: (p: number) => p.toFixed(5),
        timeFormatter: (time: number) => {
          // Adjust UTC timestamp to BST (UTC+6) for display
          const date = new Date((time + 6 * 3600) * 1000);
          return date.getUTCHours().toString().padStart(2, '0') + ":" + 
                 date.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                 date.getUTCSeconds().toString().padStart(2, '0');
        },
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions) as any;
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const formattedData: CandlestickData<Time>[] = data.map(d => ({
        time: d.timestamp as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      seriesRef.current.setData(formattedData);
      lastCandleRef.current = data[data.length - 1];
    }
  }, [data]);

  useEffect(() => {
    if (seriesRef.current && lastTick && lastCandleRef.current) {
      const timeframe = 60;
      const periodStart = Math.floor(lastTick.timestamp / timeframe) * timeframe;
      
      let updatedCandle: CandlestickData<Time>;

      if (periodStart > (lastCandleRef.current.timestamp || 0)) {
        // New candle
        updatedCandle = {
          time: periodStart as Time,
          open: lastTick.price,
          high: lastTick.price,
          low: lastTick.price,
          close: lastTick.price,
        };
        lastCandleRef.current = {
          symbol: lastTick.symbol,
          timestamp: periodStart,
          open: lastTick.price,
          high: lastTick.price,
          low: lastTick.price,
          close: lastTick.price,
          volume: lastTick.volume
        };
      } else {
        // Update current candle
        const c = lastCandleRef.current;
        c.high = Math.max(c.high, lastTick.price);
        c.low = Math.min(c.low, lastTick.price);
        c.close = lastTick.price;
        
        updatedCandle = {
          time: c.timestamp as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        };
      }
      
      seriesRef.current.update(updatedCandle);
    }
  }, [lastTick]);

  return <div ref={chartContainerRef} className="w-full h-[500px]" />;
}
