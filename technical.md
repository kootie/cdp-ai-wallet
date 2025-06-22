# Technical Documentation

## System Architecture

### 1. Frontend Architecture
```
src/
├── components/         # React components
├── contexts/          # React contexts
├── services/          # Service layer
├── agents/            # Autonomous agents
├── contracts/         # Smart contracts
└── utils/             # Utility functions
```

### 2. Smart Contract Architecture
```
contracts/
├── MovieStreaming.sol    # Main streaming contract
└── interfaces/           # Contract interfaces
```

## Component Details

### 1. Smart Contracts

#### MovieStreaming.sol
```solidity
contract MovieStreaming {
    // State variables
    mapping(uint256 => Movie) public movies;
    mapping(address => mapping(uint256 => StreamSession)) public sessions;
    
    // Events
    event StreamStarted(address indexed user, uint256 movieId);
    event StreamStopped(address indexed user, uint256 movieId);
    event PaymentProcessed(address indexed user, uint256 amount);
}
```

Key Features:
- Movie registration and management
- Streaming session control
- Payment processing
- Event emission for tracking

### 2. Frontend Components

#### WalletContext
- Manages wallet connection state
- Handles network changes
- Initializes streaming agent
- Manages transaction signing

#### StreamingAgent
- Monitors stream health
- Manages stream duration
- Handles payment verification
- Controls stream lifecycle

#### MovieList
- Displays available movies with YouTube trailers
- Manages streaming sessions
- Handles user interactions
- Provides real-time feedback
- YouTube iframe integration
- Autoplay support
- Responsive video player

### 3. Services

#### StreamingService
```typescript
class StreamingService {
    async startStream(movieId: number): Promise<void>
    async stopStream(movieId: number): Promise<void>
    async processPayment(amount: number): Promise<void>
    async getMovieDetails(movieId: number): Promise<MovieDetails>
    async getActiveStream(address: string, movieId: number): Promise<StreamSession>
}
```

#### PaymentService
```typescript
class PaymentService {
    async verifyPayment(txHash: string): Promise<boolean>
    async distributeRevenue(amount: number): Promise<void>
}
```

## Video Integration

### 1. YouTube Embed Implementation
```typescript
// MovieList.tsx
const MovieList: React.FC = () => {
  // ... other code ...

  if (isStreaming && selectedMovie) {
    return (
      <Box>
        <VStack spacing={4} align="stretch">
          <Heading size="md">{selectedMovie.title}</Heading>
          <AspectRatio ratio={16/9}>
            <iframe
              src={`${selectedMovie.thumbnail}?autoplay=1&rel=0`}
              title={selectedMovie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            />
          </AspectRatio>
          <Button colorScheme="red" onClick={stopStreaming}>
            Stop Streaming
          </Button>
        </VStack>
      </Box>
    );
  }
};
```

### 2. Video Features
- YouTube embed URLs for trailers
- Autoplay support
- No related videos (rel=0)
- Responsive design
- Full-screen support
- Mobile-friendly

### 3. Video Verification
```typescript
const verifyVideoFile = async (url: string): Promise<boolean> => {
  // Skip verification for YouTube embeds
  if (url.includes('youtube.com/embed')) {
    return true;
  }
  // ... verification logic for other video types
};
```

## Integration Points

### 1. CDP Wallet Integration
```typescript
// Wallet connection
const connectWallet = async () => {
    const provider = new CDPWalletProvider();
    await provider.connect();
    return provider;
};

// Transaction signing
const signTransaction = async (tx: Transaction) => {
    return await wallet.signTransaction(tx);
};
```

### 2. x402pay Integration
```typescript
// Payment processing
const processPayment = async (amount: number) => {
    const payment = new x402Payment(amount);
    return await payment.process();
};

// Revenue distribution
const distributeRevenue = async (amount: number) => {
    const distribution = new RevenueDistribution(amount);
    return await distribution.execute();
};
```

### 3. AgentKit Integration
```typescript
// Agent initialization
const initializeAgent = async () => {
    const agent = new StreamingAgent({
        wallet,
        contract,
        paymentService
    });
    return agent;
};

// Event handling
agent.on('streamStarted', handleStreamStart);
agent.on('streamStopped', handleStreamStop);
```

## Security Measures

### 1. Smart Contract Security
- Access control modifiers
- Reentrancy protection
- Event emission for tracking
- Secure payment processing

### 2. Frontend Security
- Wallet connection verification
- Transaction signing validation
- Payment verification
- Error handling
- YouTube embed security settings

### 3. Agent Security
- State validation
- Transaction verification
- Network change handling
- Error recovery

## Development Setup

### 1. Environment Variables
```env
REACT_APP_STREAMING_CONTRACT_ADDRESS=<address>
REACT_APP_X402_PAY_ADDRESS=<address>
```

### 2. Dependencies
```json
{
    "dependencies": {
        "@coinbase/agentkit": "latest",
        "@coinbase/cdp-wallet": "latest",
        "x402pay": "latest",
        "ethers": "^5.7.0",
        "react": "^18.2.0",
        "@chakra-ui/react": "^2.8.2",
        "@emotion/react": "^11.11.3",
        "@emotion/styled": "^11.11.0",
        "framer-motion": "^11.0.3"
    }
}
```

### 3. Build Process
```bash
# Install dependencies
npm install

# Build contracts
npx hardhat compile

# Start development server
npm start
```

## Testing

### 1. Smart Contract Tests
```bash
npx hardhat test
```

### 2. Frontend Tests
```bash
npm test
```

### 3. Integration Tests
```bash
npm run test:integration
```

## Deployment

### 1. Smart Contract Deployment
```bash
npx hardhat run scripts/deploy.ts --network <network>
```

### 2. Frontend Deployment
```bash
# Build
npm run build

# Deploy to Vercel
vercel
```

## Monitoring and Maintenance

### 1. Event Monitoring
- Stream start/stop events
- Payment processing events
- Error events
- Network change events
- Video playback events

### 2. Performance Monitoring
- Stream health metrics
- Payment processing times
- Transaction success rates
- Network latency
- Video loading times

### 3. Error Handling
- Transaction failures
- Network issues
- Payment processing errors
- Agent state errors
- Video playback errors

## Future Technical Improvements

### 1. Scalability
- Layer 2 integration
- Batch processing
- Caching implementation
- Load balancing
- Video CDN optimization

### 2. Performance
- Optimized contract calls
- Video preloading
- Lazy loading
- Performance monitoring
- Error tracking

### 3. Security
- Additional security audits
- Enhanced access control
- Improved error handling
- Advanced monitoring 