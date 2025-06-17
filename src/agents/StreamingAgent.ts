import { Web3Provider } from '@ethersproject/providers';
import { EventEmitter } from 'events';
import { StreamingService } from '../services/streamingService';

export class StreamingAgent extends EventEmitter {
  private provider: Web3Provider;
  private isInitialized: boolean = false;
  private streamingService: StreamingService;
  private activeStreams: Map<string, { startTime: number; movieId: number }> = new Map();
  private readonly MAX_STREAM_DURATION = 3600; // 1 hour in seconds

  constructor(provider: Web3Provider) {
    super();
    this.provider = provider;
    this.streamingService = new StreamingService(provider);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Initialize any required services or connections
      this.isInitialized = true;
      // Set up event listeners
      this.on('stream_started', this.handleStreamStarted.bind(this));
      this.on('stream_stopped', this.handleStreamStopped.bind(this));
      this.on('payment_received', this.handlePaymentReceived.bind(this));
    } catch (error) {
      console.error('Failed to initialize StreamingAgent:', error);
      throw error;
    }
  }

  async monitorStreams(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('StreamingAgent not initialized');
    }

    // Set up stream monitoring logic
    console.log('Monitoring streams...');
  }

  async handleWalletDisconnect(): Promise<void> {
    // Clean up any active streams or connections
    console.log('Wallet disconnected, cleaning up...');
    
    // Stop all active streams
    const viewers = Array.from(this.activeStreams.keys());
    for (const viewer of viewers) {
      try {
        await this.streamingService.stopStreaming();
        this.emit('stream_stopped', { viewer });
      } catch (error) {
        console.error('Error stopping stream:', error);
      }
    }
    this.activeStreams.clear();
  }

  handleNetworkChange(chainId: number): void {
    // Handle network changes
    console.log('Network changed to:', chainId);
    // Implement network-specific logic
  }

  private async handleStreamStarted(data: { movieId: number; viewer: string }): Promise<void> {
    this.activeStreams.set(data.viewer, {
      startTime: Date.now(),
      movieId: data.movieId
    });

    // Schedule automatic stream stop after MAX_STREAM_DURATION
    setTimeout(() => {
      this.checkAndStopStream(data.viewer);
    }, this.MAX_STREAM_DURATION * 1000);
  }

  private async handleStreamStopped(data: { viewer: string }): Promise<void> {
    this.activeStreams.delete(data.viewer);
  }

  private async handlePaymentReceived(data: { amount: string; from: string; to: string }): Promise<void> {
    // Handle payment confirmation and update stream status
    console.log('Payment received:', data);
  }

  private async checkAndStopStream(viewer: string) {
    const stream = this.activeStreams.get(viewer);
    if (!stream) return;

    const duration = (Date.now() - stream.startTime) / 1000;
    if (duration >= this.MAX_STREAM_DURATION) {
      try {
        await this.streamingService.stopStreaming();
        this.emit('stream_stopped', { viewer });
      } catch (error) {
        console.error('Error stopping stream:', error);
      }
    }
  }
} 