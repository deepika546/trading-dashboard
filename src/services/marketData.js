/**
 * Market Data Engine
 * Simulates real-time price movements and technical indicators.
 */

export const ASSETS = [
  { id: 'AAPL', name: 'Apple Inc.', type: 'stock', basePrice: 180 },
  { id: 'TSLA', name: 'Tesla, Inc.', type: 'stock', basePrice: 200 },
  { id: 'BTC', name: 'Bitcoin', type: 'crypto', basePrice: 50000 },
  { id: 'ETH', name: 'Ethereum', type: 'crypto', basePrice: 2800 },
  { id: 'GOLD', name: 'Gold', type: 'commodity', basePrice: 2000 },
  { id: 'US10Y', name: 'US 10Y Bond', type: 'bond', basePrice: 4.2 },
];

export const generateInitialData = (basePrice, count = 50) => {
  let data = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5000); // 5 seconds interval
    const change = (Math.random() - 0.5) * (basePrice * 0.01);
    currentPrice += change;
    
    data.push({
      timestamp,
      price: parseFloat(currentPrice.toFixed(2)),
      open: parseFloat((currentPrice - change * 0.5).toFixed(2)),
      high: parseFloat((currentPrice + Math.abs(change) * 1.2).toFixed(2)),
      low: parseFloat((currentPrice - Math.abs(change) * 1.2).toFixed(2)),
      close: parseFloat(currentPrice.toFixed(2)),
    });
  }
  return data;
};

export const calculateSMA = (data, period = 20) => {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val.price, 0);
  return parseFloat((sum / period).toFixed(2));
};

export const calculateRSI = (data, period = 14) => {
  if (data.length <= period) return 50;
  
  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i++) {
    const difference = data[i].price - data[i - 1].price;
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
};

export const calculateVolatility = (data, period = 10) => {
  if (data.length < period) return 0;
  const slice = data.slice(-period).map(d => d.price);
  const mean = slice.reduce((a, b) => a + b) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  return parseFloat(Math.sqrt(variance).toFixed(2));
};

export const detectPatterns = (data) => {
  if (data.length < 3) return null;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  
  const bodySize = Math.abs(last.close - last.open);
  const candleSize = last.high - last.low;
  const upperShadow = last.high - Math.max(last.close, last.open);
  const lowerShadow = Math.min(last.close, last.open) - last.low;

  // Doji
  if (bodySize <= candleSize * 0.1) {
    return { name: 'Doji', type: 'neutral', description: 'Indicates indecision in the market.' };
  }

  // Hammer
  if (lowerShadow >= bodySize * 2 && upperShadow <= bodySize * 0.5) {
    return { name: 'Hammer', type: 'bullish', description: 'Potential bullish reversal.' };
  }

  // Engulfing
  const prevBody = Math.abs(prev.close - prev.open);
  if (last.close > prev.open && last.open < prev.close && bodySize > prevBody) {
    return { name: 'Bullish Engulfing', type: 'bullish', description: 'Strong bullish reversal signal.' };
  }
  if (last.close < prev.open && last.open > prev.close && bodySize > prevBody) {
    return { name: 'Bearish Engulfing', type: 'bearish', description: 'Strong bearish reversal signal.' };
  }

  return null;
};
