import { ethers } from "hardhat";

async function main() {
  // Get the deployed contract addresses
  const mockUSDCAddress = process.env.MOCK_USDC_ADDRESS;
  const streamingPaymentAddress = process.env.STREAMING_PAYMENT_ADDRESS;

  if (!mockUSDCAddress || !streamingPaymentAddress) {
    throw new Error("Please set MOCK_USDC_ADDRESS and STREAMING_PAYMENT_ADDRESS in your environment");
  }

  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("Using signer address:", signer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);

  // Get contract instances
  const mockUSDC = await ethers.getContractAt("MockERC20", mockUSDCAddress);
  const streamingPayment = await ethers.getContractAt("StreamingPayment", streamingPaymentAddress);

  // Mint additional USDC tokens (100,000 USDC)
  const mintAmount = ethers.utils.parseUnits("100000", 6); // 6 decimals for USDC
  console.log("Minting", ethers.utils.formatUnits(mintAmount, 6), "USDC...");
  const mintTx = await mockUSDC.mint(signer.address, mintAmount);
  await mintTx.wait();
  console.log("Mint transaction:", mintTx.hash);

  // Check balance
  const balance = await mockUSDC.balanceOf(signer.address);
  console.log("Current USDC balance:", ethers.utils.formatUnits(balance, 6));

  // Approve StreamingPayment contract to spend USDC
  console.log("Approving StreamingPayment contract to spend USDC...");
  const approveTx = await mockUSDC.approve(streamingPaymentAddress, ethers.constants.MaxUint256);
  await approveTx.wait();
  console.log("Approve transaction:", approveTx.hash);

  // Check allowance
  const allowance = await mockUSDC.allowance(signer.address, streamingPaymentAddress);
  console.log("Allowance for StreamingPayment:", ethers.utils.formatUnits(allowance, 6));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 