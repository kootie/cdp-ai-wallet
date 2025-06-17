# Autonomous Streaming Platform

A decentralized streaming platform built for the Agents in Action hackathon, leveraging Coinbase Developer Products to create secure, programmable streaming services with autonomous payment management.

[View Technical Documentation](technical.md)

## Features

### 1. CDP Wallet Integration
- Secure wallet connection and management
- Programmable wallet features
- Automatic network change handling
- Transaction signing and verification
- Account state management

### 2. x402pay Integration
- Pay-per-use monetization
- Automatic payment processing
- Secure payment distribution
- Real-time payment verification
- Creator revenue management

### 3. AgentKit Integration
- Autonomous stream management
- Automatic stream duration control
- Payment monitoring and verification
- Network change handling
- Wallet disconnection management
- Stream health monitoring

### 4. Smart Contract Features
- Movie ownership management
- Streaming rights control
- Payment processing
- Event tracking and logging
- Secure transaction handling

### 5. User Interface
- Modern, responsive design using ChakraUI
- Real-time feedback with toast notifications
- Error handling and loading states
- Movie grid display with thumbnails
- YouTube video integration for trailers
- Streaming interface with autoplay support

## Technical Stack

- **Frontend**: React, TypeScript, ChakraUI
- **Smart Contracts**: Solidity, OpenZeppelin
- **Wallet**: CDP Wallet
- **Payments**: x402pay
- **Autonomous Agents**: AgentKit
- **Development**: Hardhat, ethers.js
- **Video Integration**: YouTube Embed API
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- CDP Wallet browser extension
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/autonomous-streaming-platform.git
cd autonomous-streaming-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```
REACT_APP_STREAMING_CONTRACT_ADDRESS=<your_deployed_contract_address>
REACT_APP_X402_PAY_ADDRESS=<your_x402pay_contract_address>
```

4. Start the development server:
```bash
npm start
```

## Smart Contract Deployment

1. Configure your network in `hardhat.config.ts`
2. Deploy the contract:
```bash
npx hardhat run scripts/deploy.ts --network <your-network>
```

## Usage

1. Connect your CDP Wallet
2. Browse available movies with YouTube trailers
3. Select a movie to stream
4. Confirm payment through x402pay
5. Enjoy streaming with automatic payment management

## Video Integration

### YouTube Integration
- Embedded YouTube trailers
- Autoplay support
- Responsive video player
- No related videos (clean interface)
- Automatic quality selection

### Video Features
- High-quality trailers
- Smooth playback
- Mobile-friendly design
- Automatic aspect ratio
- Full-screen support

## Autonomous Features

### StreamingAgent
- Monitors stream health
- Manages stream duration
- Handles payment verification
- Controls stream lifecycle
- Manages network changes

### Payment Management
- Automatic payment processing
- Creator revenue distribution
- Payment verification
- Transaction monitoring

### Security
- Secure wallet integration
- Transaction signing
- Payment verification
- Network security
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Coinbase Developer Products
- CDP Wallet
- x402pay
- AgentKit
- OpenZeppelin
- ChakraUI
- YouTube Embed API
