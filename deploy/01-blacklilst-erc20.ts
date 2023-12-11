import "@nomiclabs/hardhat-ethers";
import hre from "hardhat";
import "hardhat-deploy";
import {
  DeployFunction,
  DeploymentSubmission,
} from "hardhat-deploy/dist/types";

export const blacklistERC20Name = "BlacklistERC20";

const deployBlaclistErc20: DeployFunction = async function () {
  const total = hre.ethers.parseUnits("100000", "ether"); // 100k
  const signers = await hre.ethers.getSigners();
  const adminSigner = signers[0];

  const blacklistERC20 = await hre.ethers.deployContract(
    blacklistERC20Name,
    [total, await adminSigner.getAddress()],
    adminSigner
  );

  await blacklistERC20.waitForDeployment();
  const tokenAddress = await blacklistERC20.getAddress();
  const artifact = await hre.deployments.getExtendedArtifact(
    blacklistERC20Name
  );

  await hre.deployments.save(blacklistERC20Name, {
    ...artifact,
    ...{ address: tokenAddress },
  } as DeploymentSubmission);

  console.log("Blacklist ERC20 token deployed to:", tokenAddress);
  if (hre.network.name !== "hardhat") {
    console.log("Contract verification started ...");
    console.log(`contracts/${blacklistERC20Name}.sol:${blacklistERC20Name}`);
    await hre.run("verify:verify", {
      address: "0xa50851c1392129b84ef045a2ed6e080a03bce144",
      contract: `contracts/${blacklistERC20Name}.sol:${blacklistERC20Name}`,
      constructorArguments: [total, await adminSigner.getAddress()],
    });
    console.log("Contract verification completed ...");
  }
};

deployBlaclistErc20.id = "deploy-blacklist-erc20";
deployBlaclistErc20.tags = ["blacklist-erc20", "test"];
export default deployBlaclistErc20;
