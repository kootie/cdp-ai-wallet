import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';

export interface MovieDetails {
  id: number;
  title: string;
  thumbnail: string;
  ipfsHash: string;
  creator: string;
  pricePerHour: string;
}

export class StreamingService {
  private provider: Web3Provider;
  private contract: ethers.Contract | null = null;

  constructor(provider: Web3Provider) {
    this.provider = provider;
    this.initializeContract();
  }

  private initializeContract() {
    const contractAddress = process.env.REACT_APP_STREAMING_CONTRACT_ADDRESS;
    console.log('Contract address:', contractAddress);
    
    if (!contractAddress) {
      throw new Error('REACT_APP_STREAMING_CONTRACT_ADDRESS is not defined in environment variables');
    }

    // Contract ABI matching the StreamingPayment contract
    const contractABI = [
      "function startStreaming(uint256 _movieId) external",
      "function stopStreaming(uint256 _movieId) external",
      "function getStreamingCost(uint256 _movieId) external view returns (uint256)",
      "function movies(uint256) external view returns (address creator, string ipfsHash, bool isActive)",
      "function userSessions(address, uint256) external view returns (uint256 startTime, uint256 lastBillingTime, bool isActive)",
      "event StreamingStarted(address indexed user, uint256 indexed movieId, uint256 startTime)",
      "event StreamingStopped(address indexed user, uint256 indexed movieId, uint256 totalAmount)",
      "event PaymentProcessed(address indexed user, address indexed creator, uint256 amount, uint256 platformFee)"
    ];

    try {
      this.contract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.provider.getSigner()
      );
      console.log('Contract initialized successfully');
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw new Error(`Failed to initialize contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startStreaming(movieId: number): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log(`Starting stream for movie ${movieId}`);
      
      // Check if the movie exists
      const movieDetails = await this.contract.movies(movieId);
      console.log('Movie details:', movieDetails);
      
      if (!movieDetails.isActive) {
        throw new Error('Movie is not active');
      }

      // Get the streaming cost
      const cost = await this.contract.getStreamingCost(movieId);
      console.log('Streaming cost:', ethers.utils.formatUnits(cost, 6), 'USDC');

      // Start the stream
      const tx = await this.contract.startStreaming(movieId);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      console.log('Stream started successfully');
    } catch (error) {
      console.error('Error starting stream:', error);
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          throw new Error('Transaction was rejected by user');
        } else if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds to start streaming');
        } else if (error.message.includes('already streaming')) {
          throw new Error('You are already streaming this movie');
        }
      }
      throw new Error(`Failed to start streaming: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopStreaming(movieId: number): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log(`Stopping stream for movie ${movieId}`);
      const tx = await this.contract.stopStreaming(movieId);
      await tx.wait();
      console.log('Stream stopped successfully');
    } catch (error) {
      console.error('Error stopping stream:', error);
      throw error;
    }
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [creator, ipfsHash] = await this.contract.movies(movieId);
      
      // Get the streaming cost
      const cost = await this.contract.getStreamingCost(movieId);
      
      // Map movie IDs to titles and thumbnails
      const movieMetadata = {
        1: {
          title: "The Matrix",
          thumbnail: "https://www.youtube.com/embed/vKQi3bBA1y8"
        },
        2: {
          title: "Inception",
          thumbnail: "https://www.youtube.com/embed/YoHD9XEInc0"
        },
        3: {
          title: "Interstellar",
          thumbnail: "https://www.youtube.com/embed/zSWdZVtXT7E"
        }
      };

      return {
        id: movieId,
        title: movieMetadata[movieId as keyof typeof movieMetadata]?.title || `Movie ${movieId}`,
        thumbnail: movieMetadata[movieId as keyof typeof movieMetadata]?.thumbnail || '',
        ipfsHash,
        creator,
        pricePerHour: ethers.utils.formatUnits(cost, 6) // Assuming 6 decimals for USDC
      };
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw error;
    }
  }

  async getActiveStream(address: string, movieId: number): Promise<{ movieId: number; startTime: number; isActive: boolean }> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [startTime, , isActive] = await this.contract.userSessions(address, movieId);
      return {
        movieId,
        startTime: startTime.toNumber(),
        isActive
      };
    } catch (error) {
      console.error('Error getting active stream:', error);
      throw error;
    }
  }
} 