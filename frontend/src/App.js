import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Game from "./components/Game.jsx";
import { ethers } from "ethers";
import { Button } from "./components/ui/button";

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
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-end mb-8">
            {!account ? (
              <Button onClick={connectWallet} variant="outline">
                Connect Wallet
              </Button>
            ) : (
              <div className="text-right">
                <p className="text-sm font-medium">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </p>
                {balance && (
                  <p className="text-sm text-gray-600">
                    TEA Balance: {Number(balance).toFixed(4)}
                  </p>
                )}
              </div>
            )}
          </div>

          <Routes>
            <Route
              path="/"
              element={<Game account={account} provider={provider} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
