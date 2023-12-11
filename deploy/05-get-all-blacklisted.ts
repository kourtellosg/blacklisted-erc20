import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { blacklistERC20Name } from "./01-blacklilst-erc20";

const getAllBlacklisted: DeployFunction = async function () {
  const erc20 = await hre.deployments.getOrNull(blacklistERC20Name);
  // here we use the erc20 address we deployed, but any blacklistERC20 token address can be used
  const erc20Address = erc20!.address;

  const addToBlacklistLogs = await hre.ethers.provider.getLogs({
    address: erc20Address,
    topics: [hre.ethers.id("AddedToBlacklist(address)")],
  });
  const blacklistedAddresses = addToBlacklistLogs.map((log) => {
    return hre.ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.data);
  });
  console.log("blacklistedAddresses", blacklistedAddresses);
};

getAllBlacklisted.id = "get-all-blacklisted";
getAllBlacklisted.tags = ["get-all-blacklisted"];
export default getAllBlacklisted;
