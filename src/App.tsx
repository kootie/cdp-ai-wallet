import React from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, Container } from '@chakra-ui/react';
import WalletUI from './components/WalletUI';

function App() {
  return (
    <WalletProvider>
      <Router>
        <ChakraProvider>
          <Container maxW="container.xl" py={8}>
            <WalletUI />
          </Container>
        </ChakraProvider>
      </Router>
    </WalletProvider>
  );
}

export default App;
