import React, { useEffect, useState } from 'react';
import { Box, Grid, Image, Heading, Text, Button, VStack, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useWallet } from '../contexts/WalletContext';
import { StreamingService, MovieDetails } from '../services/streamingService';

const MovieList: React.FC = () => {
  const { provider, account, streamingAgent } = useWallet();
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingService, setStreamingService] = useState<StreamingService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

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
        // In a real app, this would fetch from your backend
        const sampleMovies = [
          {
            id: 1,
            title: "The Matrix",
            thumbnail: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
            ipfsHash: "QmSample1",
            creator: "0x123...",
            pricePerHour: "0.01"
          },
          {
            id: 2,
            title: "Inception",
            thumbnail: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
            ipfsHash: "QmSample2",
            creator: "0x456...",
            pricePerHour: "0.015"
          },
          {
            id: 3,
            title: "Interstellar",
            thumbnail: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
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
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Error",
        description: "Failed to start streaming",
        status: "error",
        duration: 5000,
      });
    }
  };

  const stopStreaming = async () => {
    if (!streamingService || !account || !streamingAgent) return;

    try {
      await streamingService.stopStreaming();
      setIsStreaming(false);
      setSelectedMovie(null);
      
      // Notify the streaming agent
      streamingAgent.emit('stream_stopped', { viewer: account });
      
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
          <Image 
            src={selectedMovie.thumbnail} 
            alt={selectedMovie.title}
            maxH="400px"
            objectFit="contain"
          />
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
          <Image src={movie.thumbnail} alt={movie.title} />
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