import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  // Log the network to debug the provider
  console.log('Network:', await ethers.provider.getNetwork());

  const contractAddress = process.env.REACT_APP_STREAMING_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("REACT_APP_STREAMING_CONTRACT_ADDRESS is not defined");
  }

  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("Using signer address:", signer.address);

  // Hardcoded ABI to avoid ENS resolution
  const contractABI = [
    "function addMovie(address _creator, string _ipfsHash) external",
    "function movies(uint256) external view returns (address creator, string ipfsHash, bool isActive)",
    "function getStreamingCost(uint256 _movieId) external view returns (uint256)",
    "function userSessions(address, uint256) external view returns (uint256 startTime, uint256 lastBillingTime, bool isActive)",
    "event StreamingStarted(address indexed user, uint256 indexed movieId, uint256 startTime)",
    "event StreamingStopped(address indexed user, uint256 indexed movieId, uint256 totalAmount)",
    "event PaymentProcessed(address indexed user, address indexed creator, uint256 amount, uint256 platformFee)"
  ];

  // Initialize contract with hardcoded ABI
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // Add movies
  const movies = [
    {
      id: 1,
      title: "The Matrix",
      ipfsHash: "QmSample1",
      creator: signer.address // Use the signer as the creator
    },
    {
      id: 2,
      title: "Inception",
      ipfsHash: "QmSample2",
      creator: signer.address
    },
    {
      id: 3,
      title: "Interstellar",
      ipfsHash: "QmSample3",
      creator: signer.address
    }
  ];

  console.log("Adding movies to the contract...");
  
  for (const movie of movies) {
    try {
      console.log(`Adding movie: ${movie.title}`);
      const tx = await contract.addMovie(
        movie.creator,
        movie.ipfsHash
      );
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Added movie: ${movie.title}`);
    } catch (error) {
      console.error(`Failed to add movie ${movie.title}:`, error);
    }
  }

  console.log("Done adding movies!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 