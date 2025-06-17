import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { EventEmitter } from 'events';

// Add type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
  }
}

interface WalletContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  streamingAgent: EventEmitter;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  streamingAgent: new EventEmitter()
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [streamingAgent] = useState<EventEmitter>(new EventEmitter());

  const getEthereumProvider = useCallback(() => {
    // Try to get the provider from window.ethereum
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }
    return null;
  }, []);

  const connect = async () => {
    try {
      const ethereum = getEthereumProvider();
      if (!ethereum) {
        throw new Error('No Ethereum provider found');
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(ethereum);
      
      setAccount(accounts[0]);
      setProvider(web3Provider);

      // Set up event listeners
      ethereum.on('accountsChanged', (newAccounts: string[]) => {
        setAccount(newAccounts[0] || null);
      });

      ethereum.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };

  useEffect(() => {
    const ethereum = getEthereumProvider();
    if (ethereum) {
      // Check if already connected
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setProvider(new ethers.providers.Web3Provider(ethereum));
          }
        })
        .catch(console.error);
    }
  }, [getEthereumProvider]);

  return (
    <WalletContext.Provider value={{ account, provider, connect, disconnect, streamingAgent }}>
      {children}
    </WalletContext.Provider>
  );
}; 