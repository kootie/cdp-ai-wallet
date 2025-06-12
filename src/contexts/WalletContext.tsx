import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { StreamingAgent } from '../agents/StreamingAgent';

interface WalletContextType {
  account: string | null;
  provider: Web3Provider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  streamingAgent: StreamingAgent | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamingAgent, setStreamingAgent] = useState<StreamingAgent | null>(null);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install CDP Wallet to use this application');
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      
      setProvider(provider);
      setAccount(account);

      // Initialize streaming agent
      const agent = new StreamingAgent(provider);
      await agent.initialize();
      await agent.monitorStreams();
      setStreamingAgent(agent);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (streamingAgent) {
      streamingAgent.handleWalletDisconnect();
    }
    setAccount(null);
    setProvider(null);
    setStreamingAgent(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        if (streamingAgent) {
          streamingAgent.handleNetworkChange(parseInt(chainId));
        }
        window.location.reload();
      });
    }
  }, [streamingAgent]);

  return (
    <WalletContext.Provider value={{ account, provider, connect, disconnect, isConnecting, streamingAgent }}>
      {children}
    </WalletContext.Provider>
  );
}; 