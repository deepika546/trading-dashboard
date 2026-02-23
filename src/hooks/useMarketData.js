import { useState, useEffect, useRef } from 'react';
import { ASSETS, generateInitialData, calculateSMA, calculateRSI, calculateVolatility, detectPatterns } from '../services/marketData';

export const useMarketData = (selectedAssetIds = ['AAPL', 'TSLA', 'BTC', 'ETH', 'GOLD', 'US10Y']) => {
    const [state, setState] = useState({ data: {}, indicators: {} });
    const intervalRef = useRef(null);

    useEffect(() => {
        const initialData = {};
        const initialIndicators = {};

        selectedAssetIds.forEach(id => {
            const asset = ASSETS.find(a => a.id === id);
            if (asset) {
                initialData[id] = generateInitialData(asset.basePrice);
                initialIndicators[id] = {
                    sma: calculateSMA(initialData[id]),
                    rsi: calculateRSI(initialData[id]),
                    volatility: calculateVolatility(initialData[id]),
                    pattern: detectPatterns(initialData[id])
                };
            }
        });

        setState({ data: initialData, indicators: initialIndicators });

        intervalRef.current = setInterval(() => {
            setState(prevState => {
                const newData = { ...prevState.data };
                const newIndicators = { ...prevState.indicators };

                Object.keys(newData).forEach(id => {
                    const assetData = [...newData[id]];
                    const lastPoint = assetData[assetData.length - 1];
                    const asset = ASSETS.find(a => a.id === id);
                    if (!asset) return;

                    const change = (Math.random() - 0.5) * (asset.basePrice * 0.005);
                    const newPrice = parseFloat((lastPoint.price + change).toFixed(2));

                    const newPoint = {
                        timestamp: new Date(),
                        price: newPrice,
                        open: lastPoint.close || lastPoint.price,
                        high: parseFloat((Math.max(lastPoint.close || lastPoint.price, newPrice) + Math.abs(change) * 0.5).toFixed(2)),
                        low: parseFloat((Math.min(lastPoint.close || lastPoint.price, newPrice) - Math.abs(change) * 0.5).toFixed(2)),
                        close: newPrice
                    };

                    newData[id] = [...assetData.slice(-49), newPoint];
                    newIndicators[id] = {
                        sma: calculateSMA(newData[id]),
                        rsi: calculateRSI(newData[id]),
                        volatility: calculateVolatility(newData[id]),
                        pattern: detectPatterns(newData[id])
                    };
                });

                return { data: newData, indicators: newIndicators };
            });
        }, 5000);

        return () => clearInterval(intervalRef.current);
    }, [JSON.stringify(selectedAssetIds)]);

    return { marketData: state.data, indicators: state.indicators, assets: ASSETS };
};
