// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@x402/contracts/interfaces/IX402Pay.sol";

contract MovieStreaming is Ownable, ReentrancyGuard {
    IX402Pay public x402Pay;
    
    struct Movie {
        uint256 id;
        address creator;
        string ipfsHash;
        uint256 pricePerHour;
        bool isActive;
    }
    
    struct Stream {
        uint256 movieId;
        address viewer;
        uint256 startTime;
        bool isActive;
    }
    
    mapping(uint256 => Movie) public movies;
    mapping(address => Stream) public activeStreams;
    uint256 public nextMovieId;
    
    event MovieAdded(uint256 indexed movieId, address indexed creator, string ipfsHash, uint256 pricePerHour);
    event StreamStarted(uint256 indexed movieId, address indexed viewer, uint256 startTime);
    event StreamStopped(uint256 indexed movieId, address indexed viewer, uint256 duration);
    
    constructor(address _x402Pay) {
        x402Pay = IX402Pay(_x402Pay);
    }
    
    function addMovie(string memory _ipfsHash, uint256 _pricePerHour) external {
        uint256 movieId = nextMovieId++;
        movies[movieId] = Movie({
            id: movieId,
            creator: msg.sender,
            ipfsHash: _ipfsHash,
            pricePerHour: _pricePerHour,
            isActive: true
        });
        
        emit MovieAdded(movieId, msg.sender, _ipfsHash, _pricePerHour);
    }
    
    function startStreaming(uint256 _movieId) external nonReentrant {
        require(movies[_movieId].isActive, "Movie not available");
        require(activeStreams[msg.sender].isActive == false, "Already streaming");
        
        // Calculate payment using x402pay
        uint256 paymentAmount = movies[_movieId].pricePerHour;
        require(x402Pay.pay{value: paymentAmount}(msg.sender, movies[_movieId].creator, paymentAmount), "Payment failed");
        
        activeStreams[msg.sender] = Stream({
            movieId: _movieId,
            viewer: msg.sender,
            startTime: block.timestamp,
            isActive: true
        });
        
        emit StreamStarted(_movieId, msg.sender, block.timestamp);
    }
    
    function stopStreaming() external nonReentrant {
        require(activeStreams[msg.sender].isActive, "No active stream");
        
        Stream memory stream = activeStreams[msg.sender];
        uint256 duration = block.timestamp - stream.startTime;
        
        delete activeStreams[msg.sender];
        
        emit StreamStopped(stream.movieId, msg.sender, duration);
    }
    
    function getMovieDetails(uint256 _movieId) external view returns (
        address creator,
        string memory ipfsHash,
        uint256 pricePerHour,
        bool isActive
    ) {
        Movie memory movie = movies[_movieId];
        return (movie.creator, movie.ipfsHash, movie.pricePerHour, movie.isActive);
    }
    
    function getActiveStream(address _viewer) external view returns (
        uint256 movieId,
        uint256 startTime,
        bool isActive
    ) {
        Stream memory stream = activeStreams[_viewer];
        return (stream.movieId, stream.startTime, stream.isActive);
    }
} 