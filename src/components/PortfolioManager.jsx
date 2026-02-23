import { Wallet, Briefcase, PlusCircle, ArrowUpRight, ArrowDownRight, PieChart as PieIcon } from 'lucide-react';
import { Pie } from 'react-chartjs-2';

const PortfolioManager = ({ userData, marketData, onSell }) => {
    const getUnrealizedPL = (trade) => {
        const currentPrice = marketData[trade.stock]?.[marketData[trade.stock].length - 1]?.price || trade.buyPrice;
        return (currentPrice - trade.buyPrice) * trade.quantity;
    };

    const totalUnrealized = userData.portfolio?.reduce((acc, trade) => acc + getUnrealizedPL(trade), 0) || 0;

    // Prepare Pie Chart Data
    const allocation = userData.portfolio?.reduce((acc, trade) => {
        acc[trade.stock] = (acc[trade.stock] || 0) + (trade.buyPrice * trade.quantity);
        return acc;
    }, {}) || {};

    const pieData = {
        labels: Object.keys(allocation),
        datasets: [{
            data: Object.values(allocation),
            backgroundColor: [
                'rgba(0, 122, 255, 0.6)',
                'rgba(255, 59, 48, 0.6)',
                'rgba(255, 159, 10, 0.6)',
                'rgba(175, 82, 222, 0.6)',
                'rgba(52, 199, 89, 0.6)',
            ],
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
        }]
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Balance Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Wallet size={16} /> Available Balance
                    </div>
                    <div className="text-xl font-bold">₹{(userData?.balance || 0).toLocaleString()}</div>
                </div>
                <div className="glass p-4">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Briefcase size={16} /> Open P&L
                    </div>
                    <div className={`text-xl font-bold ${totalUnrealized >= 0 ? 'text-success' : 'text-danger'}`}>
                        ₹{totalUnrealized.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Allocation Chart */}
            {userData.portfolio?.length > 0 && (
                <div className="glass p-4 flex flex-col items-center">
                    <div className="text-sm font-semibold mb-2 flex items-center gap-2 w-full">
                        <PieIcon size={16} /> Asset Allocation
                    </div>
                    <div className="h-32 w-full">
                        <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            )}

            {/* Holdings List */}
            <div className="glass flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-glass-border font-semibold flex items-center justify-between">
                    Your Holdings
                    <span className="text-xs text-secondary font-normal">{userData.portfolio?.length || 0} Assets</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {userData.portfolio?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-secondary text-sm">
                            No active positions
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {userData.portfolio?.map((trade, index) => {
                                const pl = getUnrealizedPL(trade);
                                const isProfit = pl >= 0;
                                return (
                                    <div key={index} className="bg-bg-secondary/50 p-3 rounded-lg flex items-center justify-between border border-transparent hover:border-glass-border transition-all">
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {trade.stock}
                                                <span className="text-xs font-normal text-secondary">{trade.quantity} units</span>
                                            </div>
                                            <div className="text-xs text-secondary">Avg ₹{trade.buyPrice}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-semibold flex items-center justify-end gap-1 ${isProfit ? 'text-success' : 'text-danger'}`}>
                                                {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                ₹{Math.abs(pl).toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => onSell(index)}
                                                className="text-[10px] uppercase tracking-wider text-danger hover:underline mt-1"
                                            >
                                                Close Position
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioManager;
