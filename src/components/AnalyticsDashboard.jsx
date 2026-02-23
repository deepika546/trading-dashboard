import { TrendingUp, TrendingDown, Activity, Percent } from 'lucide-react';

const StatCard = ({ label, value, subValue, type, icon: Icon }) => (
    <div className="glass p-4 flex flex-col transition-all hover:translate-y--1">
        <div className="flex items-center justify-between mb-2">
            <span className="text-secondary text-sm font-medium">{label}</span>
            <div className={`p-2 rounded-lg ${type === 'success' ? 'bg-success/20 text-success' :
                    type === 'danger' ? 'bg-danger/20 text-danger' :
                        'bg-accent-blue/20 text-accent-blue'
                }`}>
                <Icon size={18} />
            </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {subValue && (
            <div className={`text-xs mt-1 ${subValue.startsWith('+') ? 'text-success' :
                    subValue.startsWith('-') ? 'text-danger' :
                        'text-secondary'
                }`}>
                {subValue}
            </div>
        )}
    </div>
);

const AnalyticsDashboard = ({ assetId, indicators, assetData }) => {
    if (!assetId || !indicators[assetId]) return null;

    const current = indicators[assetId];
    const lastPrice = assetData[assetId]?.[assetData[assetId].length - 1]?.price || 0;
    const prevPrice = assetData[assetId]?.[assetData[assetId].length - 2]?.price || lastPrice;
    const change = lastPrice - prevPrice;
    const percentChange = ((change / prevPrice) * 100).toFixed(2);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                label="Current Price"
                value={`₹${lastPrice}`}
                subValue={`${change >= 0 ? '+' : ''}${percentChange}%`}
                type={change >= 0 ? 'success' : 'danger'}
                icon={change >= 0 ? TrendingUp : TrendingDown}
            />
            <StatCard
                label="RSI (14)"
                value={current.rsi}
                subValue={current.rsi > 70 ? 'Overbought' : current.rsi < 30 ? 'Oversold' : 'Neutral'}
                type={current.rsi > 70 ? 'danger' : current.rsi < 30 ? 'success' : 'info'}
                icon={Activity}
            />
            <StatCard
                label="Volatility"
                value={current.volatility}
                subValue="Last 10 intervals"
                type="info"
                icon={Percent}
            />
            <StatCard
                label="SMA (20)"
                value={`₹${current.sma}`}
                subValue={lastPrice > current.sma ? 'Above Average' : 'Below Average'}
                type={lastPrice > current.sma ? 'success' : 'danger'}
                icon={TrendingUp}
            />
        </div>
    );
};

export default AnalyticsDashboard;
