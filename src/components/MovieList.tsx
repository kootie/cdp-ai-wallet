import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Heading, Text, Button, VStack, useToast, Alert, AlertIcon, AspectRatio, Image } from '@chakra-ui/react';
import { useWallet } from '../contexts/WalletContext';
import { StreamingService, MovieDetails } from '../services/streamingService';

const MovieList: React.FC = () => {
  const { provider, account, streamingAgent } = useWallet();
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingService, setStreamingService] = useState<StreamingService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toast = useToast();

  // Thumbnail images for the grid view
  const thumbnails = {
    "The Matrix": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    "Inception": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    "Interstellar": "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"
  };

  useEffect(() => {
    if (provider) {
      try {
        setStreamingService(new StreamingService(provider));
        setError(null);
      } catch (err) {
        setError('Failed to initialize streaming service. Please check your environment variables.');
        console.error('Error initializing streaming service:', err);
      }
    }
  }, [provider]);

  useEffect(() => {
    const loadMovies = async () => {
      if (!streamingService) return;
      
      try {
        const sampleMovies = [
          {
            id: 1,
            title: "The Matrix",
            thumbnail: "/trailers/The Matrix.mp4",
            ipfsHash: "QmSample1",
            creator: "0x123...",
            pricePerHour: "0.01"
          },
          {
            id: 2,
            title: "Inception",
            thumbnail: "/trailers/Inception.mp4",
            ipfsHash: "QmSample2",
            creator: "0x456...",
            pricePerHour: "0.015"
          },
          {
            id: 3,
            title: "Interstellar",
            thumbnail: "/trailers/Interstellar.mp4",
            ipfsHash: "QmSample3",
            creator: "0x789...",
            pricePerHour: "0.02"
          }
        ];
        setMovies(sampleMovies);
      } catch (error) {
        console.error('Error loading movies:', error);
        toast({
          title: "Error",
          description: "Failed to load movies",
          status: "error",
          duration: 5000,
        });
      }
    };

    loadMovies();
  }, [streamingService, toast]);

  // Check for active streams when account changes
  useEffect(() => {
    const checkActiveStreams = async () => {
      if (!streamingService || !account) return;

      try {
        // Check each movie for active streams
        for (const movie of movies) {
          const stream = await streamingService.getActiveStream(account, movie.id);
          if (stream.isActive) {
            setSelectedMovie(movie);
            setIsStreaming(true);
            break;
          }
        }
      } catch (error) {
        console.error('Error checking active streams:', error);
      }
    };

    checkActiveStreams();
  }, [account, streamingService, movies]);

  const verifyVideoFile = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        console.error('Video file not found:', url);
        return false;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('video/')) {
        console.error('Invalid content type:', contentType);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying video file:', error);
      return false;
    }
  };

  const startStreaming = async (movie: MovieDetails) => {
    if (!streamingService || !account || !streamingAgent) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 5000,
      });
      return;
    }

    try {
      // Verify video file before starting stream
      const isVideoValid = await verifyVideoFile(movie.thumbnail);
      if (!isVideoValid) {
        toast({
          title: "Error",
          description: "Video file is not accessible or invalid",
          status: "error",
          duration: 5000,
        });
        return;
      }

      // Check if user is already streaming any movie
      for (const m of movies) {
        const stream = await streamingService.getActiveStream(account, m.id);
        if (stream.isActive) {
          toast({
            title: "Error",
            description: "You are already streaming a movie. Please stop the current stream first.",
            status: "error",
            duration: 5000,
          });
          return;
        }
      }

      console.log('Starting stream for movie:', movie);
      await streamingService.startStreaming(movie.id);
      setSelectedMovie(movie);
      setIsStreaming(true);
      
      // Notify the streaming agent
      streamingAgent.emit('stream_started', { movieId: movie.id, viewer: account });
      
      toast({
        title: "Success",
        description: "Streaming started successfully",
        status: "success",
        duration: 5000,
      });

      // Start playing the video
      if (videoRef.current) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          toast({
            title: "Warning",
            description: "Video playback failed, but streaming is active",
            status: "warning",
            duration: 5000,
          });
        });
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      let errorMessage = "Failed to start streaming";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    }
  };

  const stopStreaming = async () => {
    if (!streamingService || !account || !streamingAgent || !selectedMovie) return;

    try {
      await streamingService.stopStreaming(selectedMovie.id);
      setIsStreaming(false);
      setSelectedMovie(null);
      
      // Notify the streaming agent
      streamingAgent.emit('stream_stopped', { viewer: account });
      
      // Stop the video
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      
      toast({
        title: "Success",
        description: "Streaming stopped successfully",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast({
        title: "Error",
        description: "Failed to stop streaming",
        status: "error",
        duration: 5000,
      });
    }
  };

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (isStreaming && selectedMovie) {
    return (
      <Box w="100%" p={4} borderWidth={1} borderRadius="lg">
        <VStack spacing={4}>
          <Heading size="md">{selectedMovie.title}</Heading>
          <AspectRatio ratio={16/9} w="100%" maxW="800px">
            <video
              ref={videoRef}
              src={selectedMovie.thumbnail}
              controls
              autoPlay
              style={{ width: '100%', height: '100%' }}
              onError={(e) => {
                const video = e.target as HTMLVideoElement;
                console.error('Video Error:', {
                  error: video.error,
                  errorCode: video.error?.code,
                  errorMessage: video.error?.message,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.currentSrc
                });
                toast({
                  title: "Video Error",
                  description: `Error code: ${video.error?.code}, Message: ${video.error?.message}`,
                  status: "error",
                  duration: 5000,
                });
              }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log('Video Metadata Loaded:', {
                  duration: video.duration,
                  videoWidth: video.videoWidth,
                  videoHeight: video.videoHeight,
                  readyState: video.readyState,
                  networkState: video.networkState
                });
              }}
              onCanPlay={(e) => {
                console.log('Video can play');
                const video = e.target as HTMLVideoElement;
                video.play().catch(error => {
                  console.error('Playback Error:', error);
                  toast({
                    title: "Playback Error",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                  });
                });
              }}
            />
          </AspectRatio>
          <Text>Creator: {selectedMovie.creator}</Text>
          <Text>Price per hour: {selectedMovie.pricePerHour} ETH</Text>
          <Button colorScheme="red" onClick={stopStreaming}>
            Stop Streaming
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} w="100%">
      {movies.map((movie) => (
        <Box
          key={movie.id}
          borderWidth={1}
          borderRadius="lg"
          overflow="hidden"
        >
          <AspectRatio ratio={16/9}>
            <Image
              src={thumbnails[movie.title as keyof typeof thumbnails]}
              alt={movie.title}
              objectFit="cover"
            />
          </AspectRatio>
          <Box p={4}>
            <Heading size="md">{movie.title}</Heading>
            <Text mt={2}>Creator: {movie.creator}</Text>
            <Text mt={2}>Price: {movie.pricePerHour} ETH/hour</Text>
            <Button
              colorScheme="blue"
              mt={4}
              onClick={() => startStreaming(movie)}
            >
              Watch Now
            </Button>
          </Box>
        </Box>
      ))}
    </Grid>
  );
};

export default MovieList; 