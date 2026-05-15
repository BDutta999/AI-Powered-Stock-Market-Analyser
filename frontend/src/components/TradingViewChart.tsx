'use client';
import { createChart, ColorType, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const TradingViewChart = ({ data }: { data: any[] }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!chartContainerRef.current || !data || data.length === 0) return;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: '#374151', style: 1 },
                horzLines: { color: '#374151', style: 1 },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            crosshair: {
                mode: 0,
            },
            rightPriceScale: {
                borderColor: '#4b5563',
            },
            timeScale: {
                borderColor: '#4b5563',
            },
        });
        chartRef.current = chart;

        chart.timeScale().fitContent();

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        // Format data: ensure time is correct format (string for days, timestamp for intraday)
        const formattedData = data.map((d: any) => {
            const timeStr = d.Date || d.Datetime;
            let timeVal: any = timeStr;
            // Convert to unix timestamp (seconds) if we have time component
            if (timeStr && timeStr.includes(' ')) {
                // To avoid timezone offsets shifting the chart, use UTC timezone calculation or standard parse
                timeVal = Math.floor(new Date(timeStr).getTime() / 1000);
            }
            return {
                time: timeVal,
                open: d.Open,
                high: d.High,
                low: d.Low,
                close: d.Close,
            };
        }).filter(d => d.time).sort((a, b) => {
            const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time * 1000;
            const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time * 1000;
            return timeA - timeB;
        });

        // Remove duplicates by time to prevent lightweight-charts error
        const uniqueData = Array.from(new Map(formattedData.map(item => [item.time, item])).values());

        candlestickSeries.setData(uniqueData);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};
