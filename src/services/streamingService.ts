import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import MovieStreamingABI from '../contracts/MovieStreaming.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_STREAMING_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error('REACT_APP_STREAMING_CONTRACT_ADDRESS is not defined in environment variables');
}

export interface MovieDetails {
  id: number;
  title: string;
  thumbnail: string;
  ipfsHash: string;
  creator: string;
  pricePerHour: string;
}

export class StreamingService {
  private contract: ethers.Contract | null = null;
  private provider: Web3Provider;

  constructor(provider: Web3Provider) {
    this.provider = provider;
    if (CONTRACT_ADDRESS) {
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MovieStreamingABI.abi,
        provider.getSigner()
      );
    }
  }

  async startStreaming(movieId: number): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please check your environment variables.');
    }

    try {
      const tx = await this.contract.startStreaming(movieId);
      await tx.wait();
    } catch (error) {
      console.error('Error starting stream:', error);
      throw error;
    }
  }

  async stopStreaming(): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please check your environment variables.');
    }

    try {
      const tx = await this.contract.stopStreaming();
      await tx.wait();
    } catch (error) {
      console.error('Error stopping stream:', error);
      throw error;
    }
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please check your environment variables.');
    }

    try {
      const [creator, ipfsHash, pricePerHour, isActive] = await this.contract.getMovieDetails(movieId);
      return {
        id: movieId,
        title: `Movie ${movieId}`, // In a real app, this would come from IPFS metadata
        thumbnail: `https://ipfs.io/ipfs/${ipfsHash}/thumbnail.jpg`,
        ipfsHash,
        creator,
        pricePerHour: ethers.utils.formatEther(pricePerHour)
      };
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw error;
    }
  }

  async getActiveStream(address: string): Promise<{ movieId: number; startTime: number; isActive: boolean }> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Please check your environment variables.');
    }

    try {
      const [movieId, startTime, isActive] = await this.contract.getActiveStream(address);
      return {
        movieId: movieId.toNumber(),
        startTime: startTime.toNumber(),
        isActive
      };
    } catch (error) {
      console.error('Error getting active stream:', error);
      throw error;
    }
  }
} 