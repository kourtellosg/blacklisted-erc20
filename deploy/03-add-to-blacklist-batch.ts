import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { blacklistERC20Name } from "./01-blacklilst-erc20";
import { BlacklistERC20 } from "../dist/types";

const addToBlacklist: DeployFunction = async function () {
  const signers = await hre.ethers.getSigners();
  const adminSigner = signers[0];

  const erc20 = await hre.deployments.getOrNull(blacklistERC20Name);
  const erc20Address = erc20!.address;

  const blacklistERC20 = (await hre.ethers.getContractAt(
    blacklistERC20Name,
    erc20Address,
    adminSigner
  )) as unknown as BlacklistERC20;

  const walletsToBeBlacklisted = [
    await signers[2].getAddress(),
    await signers[3].getAddress(),
    await signers[4].getAddress(),
  ]; // TODO: Some wallet here....
  const tx = await blacklistERC20.batchBlacklist(walletsToBeBlacklisted, true); // NOTE: Change to false to remove wallets from blacklist
  await tx.wait();
};

addToBlacklist.id = "add-to-blackilst-batch";
addToBlacklist.tags = ["add-to-blackilst-batch"];
export default addToBlacklist;
