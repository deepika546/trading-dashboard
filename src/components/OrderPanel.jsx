import { useState } from 'react';
import { ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

const OrderPanel = ({ assets, marketData, indicators, onTrade }) => {
    const [selectedAsset, setSelectedAsset] = useState(assets[0].id);
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState('buy');

    const asset = assets.find(a => a.id === selectedAsset);
    const currentPrice = marketData[selectedAsset]?.[marketData[selectedAsset].length - 1]?.price || asset.basePrice;
    const total = (currentPrice * quantity).toFixed(2);

    return (
        <div className="glass p-4 flex flex-col gap-4">
            <div className="font-semibold flex items-center gap-2 border-b border-glass-border pb-2">
                <ShoppingCart size={18} /> Place Order
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => setOrderType('buy')}
                    className={`text-sm py-2 rounded-lg font-bold border transition-all ${orderType === 'buy' ? 'bg-success/20 border-success text-success' : 'bg-transparent border-glass-border text-secondary'
                        }`}
                >
                    BUY
                </button>
                <button
                    onClick={() => setOrderType('sell')}
                    className={`text-sm py-2 rounded-lg font-bold border transition-all ${orderType === 'sell' ? 'bg-danger/20 border-danger text-danger' : 'bg-transparent border-glass-border text-secondary'
                        }`}
                >
                    SELL
                </button>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary px-1">Asset</label>
                <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full"
                >
                    {assets.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary px-1">Quantity</label>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full"
                />
            </div>

            <div className="bg-bg-tertiary p-3 rounded-lg border border-glass-border mt-2">
                <div className="flex justify-between text-xs text-secondary mb-1">
                    <span>Est. Price</span>
                    <span>₹{currentPrice}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                </div>
            </div>

            {/* Strategy Indicator */}
            <div className="glass p-3 border-accent-blue/20 bg-accent-blue/5">
                <div className="text-[10px] uppercase tracking-widest text-accent-blue font-bold mb-1">Strategy Signal</div>
                {marketData[selectedAsset] ? (
                    <div className="text-xs">
                        {indicators[selectedAsset]?.rsi < 30 ? (
                            <span className="text-success font-semibold">BUY SIGNAL: RSI is Oversold ({indicators[selectedAsset].rsi})</span>
                        ) : indicators[selectedAsset]?.rsi > 70 ? (
                            <span className="text-danger font-semibold">SELL SIGNAL: RSI is Overbought ({indicators[selectedAsset].rsi})</span>
                        ) : (
                            <span className="text-secondary">NEUTRAL: No clear strategy signal</span>
                        )}
                    </div>
                ) : <div className="text-xs text-secondary">Analyzing market...</div>}
            </div>

            <button
                onClick={() => onTrade(selectedAsset, quantity, currentPrice, orderType)}
                className={`primary w-full mt-2 !py-3 ${orderType === 'buy' ? '!bg-success' : '!bg-danger'}`}
            >
                Place {orderType.toUpperCase()} Order
            </button>

            <div className="text-[10px] text-secondary text-center italic">
                * Market execution simulated using random generated data
            </div>
        </div>
    );
};

export default OrderPanel;
