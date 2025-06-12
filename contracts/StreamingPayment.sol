// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StreamingPayment is Ownable, ReentrancyGuard {
    IERC20 public paymentToken; // USDC on Base
    uint256 public constant RATE_PER_HOUR = 30 * 1e6; // 30 USDC (6 decimals)
    uint256 public constant CREATOR_SHARE = 80; // 80%
    uint256 public constant PLATFORM_SHARE = 20; // 20%

    struct Movie {
        address creator;
        string ipfsHash;
        bool isActive;
    }

    struct StreamingSession {
        uint256 startTime;
        uint256 lastBillingTime;
        bool isActive;
    }

    mapping(uint256 => Movie) public movies;
    mapping(address => mapping(uint256 => StreamingSession)) public userSessions;
    uint256 public movieCount;

    event MovieAdded(uint256 indexed movieId, address indexed creator, string ipfsHash);
    event StreamingStarted(address indexed user, uint256 indexed movieId, uint256 startTime);
    event StreamingStopped(address indexed user, uint256 indexed movieId, uint256 totalAmount);
    event PaymentProcessed(address indexed user, address indexed creator, uint256 amount, uint256 platformFee);

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }

    function addMovie(address _creator, string memory _ipfsHash) external onlyOwner {
        movies[movieCount] = Movie({
            creator: _creator,
            ipfsHash: _ipfsHash,
            isActive: true
        });
        emit MovieAdded(movieCount, _creator, _ipfsHash);
        movieCount++;
    }

    function startStreaming(uint256 _movieId) external nonReentrant {
        require(movies[_movieId].isActive, "Movie not active");
        require(!userSessions[msg.sender][_movieId].isActive, "Already streaming");

        userSessions[msg.sender][_movieId] = StreamingSession({
            startTime: block.timestamp,
            lastBillingTime: block.timestamp,
            isActive: true
        });

        emit StreamingStarted(msg.sender, _movieId, block.timestamp);
    }

    function stopStreaming(uint256 _movieId) external nonReentrant {
        StreamingSession storage session = userSessions[msg.sender][_movieId];
        require(session.isActive, "No active session");

        uint256 duration = block.timestamp - session.lastBillingTime;
        uint256 amount = (duration * RATE_PER_HOUR) / 1 hours;
        
        if (amount > 0) {
            uint256 creatorAmount = (amount * CREATOR_SHARE) / 100;
            uint256 platformAmount = (amount * PLATFORM_SHARE) / 100;

            require(
                paymentToken.transferFrom(msg.sender, movies[_movieId].creator, creatorAmount),
                "Creator transfer failed"
            );
            require(
                paymentToken.transferFrom(msg.sender, owner(), platformAmount),
                "Platform transfer failed"
            );

            emit PaymentProcessed(msg.sender, movies[_movieId].creator, amount, platformAmount);
        }

        session.isActive = false;
        emit StreamingStopped(msg.sender, _movieId, amount);
    }

    function getStreamingCost(uint256 _movieId) external view returns (uint256) {
        StreamingSession storage session = userSessions[msg.sender][_movieId];
        if (!session.isActive) return 0;

        uint256 duration = block.timestamp - session.lastBillingTime;
        return (duration * RATE_PER_HOUR) / 1 hours;
    }
} 