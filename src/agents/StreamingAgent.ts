import { Agent } from '@coinbase/agentkit';
import { ethers } from 'ethers';
import { StreamingService } from '../services/streamingService';

export class StreamingAgent extends Agent {
  private streamingService: StreamingService;
  private activeStreams: Map<string, { startTime: number; movieId: number }> = new Map();
  private readonly MAX_STREAM_DURATION = 3600; // 1 hour in seconds

  constructor(provider: ethers.providers.Web3Provider) {
    super('StreamingAgent');
    this.streamingService = new StreamingService(provider);
  }

  async initialize() {
    // Set up event listeners
    this.on('stream_started', this.handleStreamStarted.bind(this));
    this.on('stream_stopped', this.handleStreamStopped.bind(this));
    this.on('payment_received', this.handlePaymentReceived.bind(this));
  }

  private async handleStreamStarted(data: { movieId: number; viewer: string }) {
    const { movieId, viewer } = data;
    this.activeStreams.set(viewer, {
      startTime: Date.now(),
      movieId
    });

    // Schedule automatic stream stop after MAX_STREAM_DURATION
    setTimeout(() => {
      this.checkAndStopStream(viewer);
    }, this.MAX_STREAM_DURATION * 1000);
  }

  private async handleStreamStopped(data: { viewer: string }) {
    const { viewer } = data;
    this.activeStreams.delete(viewer);
  }

  private async handlePaymentReceived(data: { amount: string; from: string; to: string }) {
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

  // Autonomous monitoring of stream health
  async monitorStreams() {
    setInterval(() => {
      for (const [viewer, stream] of this.activeStreams.entries()) {
        this.checkAndStopStream(viewer);
      }
    }, 60000); // Check every minute
  }

  // Handle network changes
  async handleNetworkChange(chainId: number) {
    console.log('Network changed:', chainId);
    // Implement network-specific logic
  }

  // Handle wallet disconnection
  async handleWalletDisconnect() {
    // Stop all active streams
    for (const viewer of this.activeStreams.keys()) {
      try {
        await this.streamingService.stopStreaming();
        this.emit('stream_stopped', { viewer });
      } catch (error) {
        console.error('Error stopping stream:', error);
      }
    }
  }
} 