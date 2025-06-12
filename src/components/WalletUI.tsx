import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button, Text, VStack, Heading } from '@chakra-ui/react';
import MovieList from './MovieList';

const WalletUI: React.FC = () => {
  const { account, provider, connect, disconnect, isConnecting } = useWallet();

  return (
    <VStack spacing={8} align="stretch">
      <Heading textAlign="center">Creator Movie Platform</Heading>
      
      {!account ? (
        <VStack spacing={4}>
          <Text>Connect your wallet to start watching movies</Text>
          <Button
            colorScheme="blue"
            onClick={connect}
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