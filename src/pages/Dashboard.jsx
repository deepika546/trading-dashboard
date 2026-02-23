import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Settings, Bell, Search, Menu, Star } from "lucide-react";

import { useMarketData } from "../hooks/useMarketData";
import ChartContainer from "../components/ChartContainer";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import PortfolioManager from "../components/PortfolioManager";
import OrderPanel from "../components/OrderPanel";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState("AAPL");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { marketData, indicators, assets } = useMarketData(['AAPL', 'TSLA', 'BTC', 'ETH', 'GOLD', 'US10Y']);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const docRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        if (data.preferences?.selectedAsset) setSelectedAssetId(data.preferences.selectedAsset);
      } else {
        // Fallback for missing document
        setUserData({
          balance: 100000,
          portfolio: [],
          watchlist: [],
          preferences: { selectedAsset: "AAPL" }
        });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const toggleWatchlist = async (assetId) => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const watchlist = userData.watchlist || [];
    const updated = watchlist.includes(assetId)
      ? watchlist.filter(id => id !== assetId)
      : [...watchlist, assetId];

    await updateDoc(docRef, { watchlist: updated });
  };

  const handleAssetSelect = async (assetId) => {
    setSelectedAssetId(assetId);
    if (auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, { "preferences.selectedAsset": assetId });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleTrade = async (assetId, quantity, price, type) => {
    if (!auth.currentUser || !userData) return;

    const subTotal = price * quantity;
    const fee = subTotal * 0.001; // 0.1% Transaction Fee
    const totalCost = subTotal + fee;

    const docRef = doc(db, "users", auth.currentUser.uid);

    if (type === 'buy') {
      if (userData.balance < totalCost) {
        alert("Insufficient balance!");
        return;
      }

      const updatedPortfolio = [
        ...(userData.portfolio || []),
        {
          stock: assetId,
          quantity,
          buyPrice: price,
          date: new Date().toISOString()
        }
      ];

      await updateDoc(docRef, {
        balance: userData.balance - totalCost,
        portfolio: updatedPortfolio
      });
    } else {
      // Find position to sell
      const positionIndex = userData.portfolio?.findIndex(p => p.stock === assetId);
      if (positionIndex === -1) {
        alert("You don't own this asset!");
        return;
      }
      handleRemoveTrade(positionIndex);
    }
  };

  const handleRemoveTrade = async (indexToRemove) => {
    const trade = userData.portfolio[indexToRemove];
    const currentPrice = marketData[trade.stock]?.[marketData[trade.stock].length - 1]?.price || trade.buyPrice;
    const proceeds = currentPrice * trade.quantity;

    const docRef = doc(db, "users", auth.currentUser.uid);
    const updated = userData.portfolio.filter((_, index) => index !== indexToRemove);

    await updateDoc(docRef, {
      balance: userData.balance + proceeds,
      portfolio: updated
    });
  };

  if (!userData || !marketData["AAPL"]) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Loading market infrastructure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`glass m-4 mr-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-glass-border">
          <div className="bg-accent-blue p-2 rounded-lg">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight">TradingTech</span>}
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {assets.map(asset => (
            <div key={asset.id} className="relative group">
              <button
                onClick={() => handleAssetSelect(asset.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedAssetId === asset.id
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  : 'text-text-secondary hover:bg-glass-bg'
                  }`}
              >
                <div className={`w-2 h-2 rounded-full ${selectedAssetId === asset.id ? 'bg-accent-blue' : 'bg-glass-border'}`}></div>
                {isSidebarOpen && (
                  <div className="flex flex-col items-start leading-none">
                    <span className="font-semibold text-sm">{asset.id}</span>
                    <span className="text-[10px] opacity-60">{asset.name}</span>
                  </div>
                )}
              </button>
              {isSidebarOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWatchlist(asset.id); }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${userData.watchlist?.includes(asset.id) ? 'text-warning opacity-100' : 'text-text-secondary opacity-0 group-hover:opacity-100'
                    }`}
                >
                  <Star size={14} fill={userData.watchlist?.includes(asset.id) ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 flex flex-col gap-2 border-t border-glass-border">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="secondary w-full justify-start px-3">
            <Menu size={20} /> {isSidebarOpen && "Collapse"}
          </button>
          <button onClick={handleLogout} className="secondary w-full justify-start px-3 text-danger hover:bg-danger/10 hover:border-danger/20">
            <LogOut size={20} /> {isSidebarOpen && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Market Dashboard</h1>
            <p className="text-text-secondary text-sm">Real-time analysis and trade execution</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass flex items-center px-4 py-2 gap-2 text-text-secondary">
              <Search size={18} />
              <input type="text" placeholder="Search markets..." className="bg-transparent border-none p-0 text-sm w-48" />
            </div>
            <button className="secondary !p-2">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-glass-border">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold">{auth.currentUser?.email?.split('@')[0]}</div>
                <div className="text-[10px] text-text-secondary">Pro Account</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-blue to-purple-500 border-2 border-glass-border"></div>
            </div>
          </div>
        </header>

        {/* Analytics Top Section */}
        <AnalyticsDashboard
          assetId={selectedAssetId}
          indicators={indicators}
          assetData={marketData}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          <div className="lg:col-span-2 h-full">
            <ChartContainer
              data={marketData}
              indicators={indicators}
              chartType="line"
            />
          </div>

          <div className="flex flex-col gap-6 h-full">
            <OrderPanel
              assets={assets}
              marketData={marketData}
              indicators={indicators}
              onTrade={handleTrade}
            />
            <div className="flex-1 min-h-0">
              <PortfolioManager
                userData={userData}
                marketData={marketData}
                onSell={handleRemoveTrade}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;