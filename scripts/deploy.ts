import { ethers } from "hardhat";

async function main() {
  // Deploy USDC mock for testing
  const MockUSDC = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockUSDC.deploy("Mock USDC", "USDC", 6);
  await mockUSDC.deployed();
  console.log("Mock USDC deployed to:", mockUSDC.address);

  // Deploy StreamingPayment contract
  const StreamingPayment = await ethers.getContractFactory("StreamingPayment");
  const streamingPayment = await StreamingPayment.deploy(mockUSDC.address);
  await streamingPayment.deployed();
  console.log("StreamingPayment deployed to:", streamingPayment.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 