import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Text, VStack, Heading, useToast } from '@chakra-ui/react';
import MovieList from './MovieList';

const WalletUI: React.FC = () => {
  const { account, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const toast = useToast();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Heading textAlign="center">Creator Movie Platform</Heading>
      
      {!account ? (
        <VStack spacing={4}>
          <Text>Connect your wallet to start watching movies</Text>
          <Button
            colorScheme="blue"
            onClick={handleConnect}
            isLoading={isConnecting}
            size="lg"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4}>
          <Text>Connected Account: {account}</Text>
          <Button colorScheme="red" onClick={disconnect}>
            Disconnect
          </Button>
          <MovieList />
        </VStack>
      )}
    </VStack>
  );
};

export default WalletUI; 