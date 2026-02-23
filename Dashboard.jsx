import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [tradeStock, setTradeStock] = useState("");
  const [tradeAmount, setTradeAmount] = useState(100);
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candle");

  // 🔥 Real-time Firestore Sync
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

        setTimeframe(data.preferences?.timeframe || "1D");
        setChartType(data.preferences?.chartType || "candle");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🔥 Apply Theme Automatically
  useEffect(() => {
    if (userData?.preferences?.theme === "light") {
      document.body.style.background = "#f4f4f4";
    } else {
      document.body.style.background = "#1f3c88";
    }
  }, [userData]);

  // 🔥 Add Trade
  const handleAddTrade = async () => {
    if (!auth.currentUser || !userData) return;

    if (tradeAmount <= 0) {
      alert("Invalid amount!");
      return;
    }

    if (userData.balance < tradeAmount) {
      alert("Insufficient balance!");
      return;
    }

    const docRef = doc(db, "users", auth.currentUser.uid);

    const updatedPortfolio = [
      ...(userData.portfolio || []),
      {
        stock: tradeStock || "AAPL",
        amount: tradeAmount,
        date: new Date().toLocaleString()
      }
    ];

    await updateDoc(docRef, {
      balance: userData.balance - tradeAmount,
      activeTrades: userData.activeTrades + 1,
      profit: userData.profit + 5,
      portfolio: updatedPortfolio
    });

    setTradeStock("");
    setTradeAmount(100);
  };

  // 🔥 Add Watchlist
  const handleAddWatchlist = async () => {
    if (!auth.currentUser || !newStock) return;

    const docRef = doc(db, "users", auth.currentUser.uid);

    const updatedWatchlist = [
      ...(userData.watchlist || []),
      newStock
    ];

    await updateDoc(docRef, {
      watchlist: updatedWatchlist
    });

    setNewStock("");
  };

  // 🔥 Remove Watchlist
  const handleRemoveWatchlist = async (stockToRemove) => {
    const docRef = doc(db, "users", auth.currentUser.uid);

    const updated = userData.watchlist.filter(
      (stock) => stock !== stockToRemove
    );

    await updateDoc(docRef, {
      watchlist: updated
    });
  };

  // 🔥 Close Trade
  const handleRemoveTrade = async (indexToRemove) => {
    const docRef = doc(db, "users", auth.currentUser.uid);

    const updated = userData.portfolio.filter(
      (_, index) => index !== indexToRemove
    );

    await updateDoc(docRef, {
      portfolio: updated,
      activeTrades: userData.activeTrades - 1
    });
  };

  // 🔥 Save Chart Preferences
  const handleSavePreferences = async () => {
    if (!auth.currentUser || !userData) return;

    const docRef = doc(db, "users", auth.currentUser.uid);

    await updateDoc(docRef, {
      preferences: {
        ...userData.preferences,
        timeframe,
        chartType
      }
    });

    alert("Chart preferences saved!");
  };

  // 🔥 Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!userData) return null;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Trading Dashboard</h2>

        <p style={{ color: "white" }}>
          Welcome, {auth.currentUser?.email}
        </p>

        <h3>Balance: ₹{userData.balance}</h3>
        <h3>Active Trades: {userData.activeTrades}</h3>
        <h3>Profit: {userData.profit}%</h3>

        {/* Trade Section */}
        <input
          placeholder="Stock Name (e.g. TSLA)"
          value={tradeStock}
          onChange={(e) => setTradeStock(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={tradeAmount}
          onChange={(e) => setTradeAmount(Number(e.target.value))}
        />

        <button onClick={handleAddTrade} className="trade-btn">
          Add Trade (-₹{tradeAmount})
        </button>

        <hr style={{ margin: "20px 0" }} />

        {/* Watchlist */}
        <h3>Watchlist</h3>

        <input
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Add Stock (e.g. TSLA)"
        />

        <button onClick={handleAddWatchlist}>
          Add
        </button>

        <ul>
          {userData.watchlist?.map((stock, index) => (
            <li key={index}>
              {stock}
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => handleRemoveWatchlist(stock)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <hr style={{ margin: "20px 0" }} />

        {/* Portfolio */}
        <h3>Portfolio</h3>

        <ul>
          {userData.portfolio?.map((trade, index) => (
            <li key={index}>
              {trade.stock} - ₹{trade.amount} ({trade.date})
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => handleRemoveTrade(index)}
              >
                Close
              </button>
            </li>
          ))}
        </ul>

        <hr style={{ margin: "20px 0" }} />

        {/* Chart Preferences */}
        <h3>Chart Preferences</h3>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="1D">1 Day</option>
          <option value="1W">1 Week</option>
          <option value="1M">1 Month</option>
        </select>

        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="candle">Candle</option>
          <option value="line">Line</option>
        </select>

        <button onClick={handleSavePreferences}>
          Save Preferences
        </button>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;