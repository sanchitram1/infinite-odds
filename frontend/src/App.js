import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Game from "./components/Game.jsx";
import SupabaseTest from "./components/SupabaseTest.jsx";
import "./App.css";
import "./components/Game.css";
import { ethers } from "ethers";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !provider) return;
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [account, provider]);

  return (
    <Router>
      <div className="App">
        <div className="wallet-info">
          {!account ? (
            <button onClick={connectWallet}>Connect Wallet</button>
          ) : (
            <div>
              <p>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              {balance && <p>TEA Balance: {balance}</p>}
            </div>
          )}
        </div>

        <nav>
          <Link to="/">Game</Link> | <Link to="/test">Supabase Test</Link>
        </nav>

        <Routes>
          <Route path="/test" element={<SupabaseTest />} />
          <Route
            path="/"
            element={<Game account={account} provider={provider} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
