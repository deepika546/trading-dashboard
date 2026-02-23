import { Line, Bar, Pie } from 'react-chartjs-2';
import { useState } from 'react';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

const ChartContainer = ({ data, chartType = 'line', indicators }) => {
    const [visibleAssets, setVisibleAssets] = useState(Object.keys(data));
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleAsset = (id) => {
        setVisibleAssets(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const colors = {
        AAPL: 'rgba(0, 122, 255, 1)',
        TSLA: 'rgba(255, 59, 48, 1)',
        BTC: 'rgba(255, 159, 10, 1)',
        ETH: 'rgba(175, 82, 222, 1)',
        GOLD: 'rgba(255, 214, 10, 1)',
        US10Y: 'rgba(52, 199, 89, 1)',
    };

    const chartData = {
        labels: data[visibleAssets[0]]?.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })) || [],
        datasets: visibleAssets.map(id => ({
            label: id,
            data: data[id]?.map(d => d.price) || [],
            borderColor: colors[id] || '#fff',
            backgroundColor: colors[id]?.replace('1)', '0.1)') || 'rgba(255,255,255,0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: chartType === 'line',
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(22, 27, 34, 0.9)',
                titleColor: '#fff',
                bodyColor: '#8b949e',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#8b949e',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6,
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#8b949e',
                },
            },
        },
    };

    return (
        <div className={`glass p-4 h-full flex flex-col ${isExpanded ? 'fixed inset-4 z-50' : 'relative'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    {Object.keys(data).map(id => (
                        <button
                            key={id}
                            onClick={() => toggleAsset(id)}
                            className={`text-xs px-2 py-1 rounded-md transition-all ${visibleAssets.includes(id)
                                ? 'bg-opacity-20 border'
                                : 'opacity-40 grayscale'
                                }`}
                            style={{
                                backgroundColor: visibleAssets.includes(id) ? colors[id].replace('1)', '0.2)') : 'transparent',
                                borderColor: visibleAssets.includes(id) ? colors[id] : 'transparent',
                                color: visibleAssets.includes(id) ? colors[id] : 'inherit'
                            }}
                        >
                            {visibleAssets.includes(id) ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
                            {id}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="secondary !p-1"
                >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>

            <div className="flex-1 min-h-0">
                {chartType === 'line' ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </div>

            {visibleAssets.length === 1 && indicators[visibleAssets[0]]?.pattern && (
                <div className="mt-2 text-xs animate-fade-in flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded ${indicators[visibleAssets[0]].pattern.type === 'bullish' ? 'bg-success text-white' :
                        indicators[visibleAssets[0]].pattern.type === 'bearish' ? 'bg-danger text-white' : 'bg-warning text-black'
                        }`}>
                        {indicators[visibleAssets[0]].pattern.name}
                    </span>
                    <span className="text-secondary">{indicators[visibleAssets[0]].pattern.description}</span>
                </div>
            )}
        </div>
    );
};

export default ChartContainer;
