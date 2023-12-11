import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { blacklistERC20Name } from "./01-blacklilst-erc20";
import { BlacklistERC20 } from "../dist/types";

const removeFromBlacklist: DeployFunction = async function () {
  const signers = await hre.ethers.getSigners();
  const adminSigner = signers[0];

  const erc20 = await hre.deployments.getOrNull(blacklistERC20Name);
  const erc20Address = erc20!.address;

  const blacklistERC20 = (await hre.ethers.getContractAt(
    blacklistERC20Name,
    erc20Address,
    adminSigner
  )) as unknown as BlacklistERC20;

  const walletToBeBlacklisted = ""; // TODO: Some wallet here....
  const tx = await blacklistERC20.removeFromBlacklist(walletToBeBlacklisted);
  await tx.wait();
};

removeFromBlacklist.id = "remove-from-blacklist";
removeFromBlacklist.tags = ["remove-from-blacklist"];
export default removeFromBlacklist;
