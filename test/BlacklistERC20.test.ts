import hre from "hardhat";
import { ethers, deployments } from "hardhat";
import { Signer, ZeroAddress } from "ethers";
import { expect } from "chai";
import { BlacklistERC20 } from "../dist/types";
import { blacklistERC20Name } from "../deploy/01-blacklilst-erc20";
import { dummyWalletAddresses } from "./helpers/dummy-wallets";

describe("Blaclist ERC20", function () {
  let blacklistERC20AsOwner: BlacklistERC20;
  let blacklistERC20AsSender1: BlacklistERC20;
  let blacklistERC20AsSender2: BlacklistERC20;
  let blacklistERC20Address: string;

  let owner: Signer;
  let ownerAddress: string;
  let randomWallet1: Signer;
  let randomWallet1Address: string;
  let randomWallet2: Signer;
  let randomWallet2Address: string;
  let randomWallet3Address: string;

  let defaultAdminRole: string, blacklistRole: string;

  const NO_OF_DUMMY_WALLETS = dummyWalletAddresses.length;

  this.beforeAll("setup tests and deploy contracts", async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    randomWallet1 = signers[1];
    randomWallet2 = signers[2];
    let randomWallet3 = signers[3];

    ownerAddress = await owner.getAddress();
    randomWallet1Address = await randomWallet1.getAddress();
    randomWallet2Address = await randomWallet2.getAddress();
    randomWallet3Address = await randomWallet3.getAddress();

    await deployments.fixture(["test"]);

    const blacklistERC20 = await deployments.getOrNull(blacklistERC20Name);
    blacklistERC20Address = blacklistERC20!.address;

    blacklistERC20AsOwner = (await ethers.getContractAt(
      blacklistERC20Name,
      blacklistERC20Address,
      owner
    )) as unknown as BlacklistERC20;
    blacklistERC20AsSender1 = (await ethers.getContractAt(
      blacklistERC20Name,
      blacklistERC20Address,
      randomWallet1
    )) as unknown as BlacklistERC20;
    blacklistERC20AsSender2 = (await ethers.getContractAt(
      blacklistERC20Name,
      blacklistERC20Address,
      randomWallet2
    )) as unknown as BlacklistERC20;

    defaultAdminRole = await blacklistERC20AsOwner.DEFAULT_ADMIN_ROLE();
    blacklistRole = await blacklistERC20AsOwner.BLACKLIST_ROLE();

    // Transfer some tokens to other wallets for testing
    await blacklistERC20AsOwner.transfer(
      randomWallet1Address,
      hre.ethers.parseUnits("10000", "ether")
    );
    await blacklistERC20AsOwner.transfer(
      randomWallet2Address,
      hre.ethers.parseUnits("10000", "ether")
    );
  });
  it("should setup roles correctly", async function () {
    const hasAdminRole = await blacklistERC20AsOwner.hasRole(
      defaultAdminRole,
      ownerAddress
    );
    expect(hasAdminRole).to.equal(true);
    const hasBlacklistRole = await blacklistERC20AsOwner.hasRole(
      blacklistRole,
      ownerAddress
    );
    expect(hasBlacklistRole).to.equal(true);
  });
  it("addToBlacklist() - should allow anyone with BLACKLIST_ROLE to add to blacklist", async function () {
    let isBlacklisted = await blacklistERC20AsOwner.isBlacklisted(
      randomWallet1Address
    );
    expect(isBlacklisted).to.equal(false);
    await blacklistERC20AsOwner.addToBlacklist(randomWallet1Address);
    isBlacklisted = await blacklistERC20AsOwner.isBlacklisted(
      randomWallet1Address
    );
    expect(isBlacklisted).to.equal(true);
  });
  it("addToBlacklist() - should revert if sender does not have BLACKLIST_ROLE", async function () {
    await expect(
      blacklistERC20AsSender1.addToBlacklist(randomWallet2Address)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccessControlUnauthorizedAccount"
    );
  });
  it("addToBlacklist() - should revert if try to blacklist ZERO_ADDRESS", async function () {
    await expect(
      blacklistERC20AsOwner.addToBlacklist(ZeroAddress)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "ZeroAddressCannotBlacklisted"
    );
  });
  it("addToBlacklist() - should revert account is already blacklisted", async function () {
    await blacklistERC20AsOwner.addToBlacklist(randomWallet2Address);
    await expect(
      blacklistERC20AsOwner.addToBlacklist(randomWallet2Address)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccountAlreadyBlacklisted"
    );
  });
  it("addToBlacklist() - should emit a 'AddedToBlacklist' event", async function () {
    await expect(blacklistERC20AsOwner.addToBlacklist(randomWallet3Address))
      .to.emit(blacklistERC20AsOwner, "AddedToBlacklist")
      .withArgs(randomWallet3Address);
  });
  it("removeFromBlacklist() - should allow anyone with BLACKLIST_ROLE to remove from blacklist", async function () {
    let isBlacklisted = await blacklistERC20AsOwner.isBlacklisted(
      randomWallet1Address
    );
    expect(isBlacklisted).to.equal(true);
    await blacklistERC20AsOwner.removeFromBlacklist(randomWallet1Address);
    isBlacklisted = await blacklistERC20AsOwner.isBlacklisted(
      randomWallet1Address
    );
    expect(isBlacklisted).to.equal(false);
  });
  it("removeFromBlacklist() - should revert if sender does not have BLACKLIST_ROLE", async function () {
    await expect(
      blacklistERC20AsSender1.removeFromBlacklist(randomWallet2Address)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccessControlUnauthorizedAccount"
    );
  });
  it("removeFromBlacklist() - should revert if account is not blacklisted", async function () {
    await expect(
      blacklistERC20AsOwner.removeFromBlacklist(randomWallet1Address)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccountNotBlacklisted"
    );
  });
  it("removeFromBlacklist() - should emit a 'RemovedFromBlacklist' event", async function () {
    await expect(
      blacklistERC20AsOwner.removeFromBlacklist(randomWallet3Address)
    )
      .to.emit(blacklistERC20AsOwner, "RemovedFromBlacklist")
      .withArgs(randomWallet3Address);
  });
  it("batchBlacklist() - should allow anyone with BLACKLIST_ROLE to batch blacklist (add)", async function () {
    const wallets = [
      randomWallet1Address,
      randomWallet2Address,
      randomWallet3Address,
    ];
    await blacklistERC20AsOwner.batchBlacklist(wallets, true);
    for (let wallet of wallets) {
      const isBlacklisted = await blacklistERC20AsOwner.isBlacklisted(wallet);
      expect(isBlacklisted).to.equal(true);
    }
  });
  it("batchBlacklist() - should emit 'AddedToBlacklist' events (add)", async function () {
    const wallets = [
      randomWallet1Address,
      randomWallet2Address,
      randomWallet3Address,
    ];
    await expect(blacklistERC20AsOwner.batchBlacklist(wallets, true))
      .to.emit(blacklistERC20AsOwner, "AddedToBlacklist")
      .withArgs(randomWallet1Address)
      .to.emit(blacklistERC20AsOwner, "AddedToBlacklist")
      .withArgs(randomWallet2Address)
      .to.emit(blacklistERC20AsOwner, "AddedToBlacklist")
      .withArgs(randomWallet3Address);
  });
  it("batchBlacklist() - should allow anyone with BLACKLIST_ROLE to batch blacklist (remove)", async function () {
    const wallets = [
      randomWallet1Address,
      randomWallet2Address,
      randomWallet3Address,
    ];
    await blacklistERC20AsOwner.batchBlacklist(wallets, false);
    for (let wallet of wallets) {
      const isBlacklisted = await blacklistERC20AsOwner.isBlacklisted(wallet);
      expect(isBlacklisted).to.equal(false);
    }
  });
  it("batchBlacklist() - should emit 'RemovedFromBlacklist' events (remove)", async function () {
    const wallets = [
      randomWallet1Address,
      randomWallet2Address,
      randomWallet3Address,
    ];
    await expect(blacklistERC20AsOwner.batchBlacklist(wallets, false))
      .to.emit(blacklistERC20AsOwner, "RemovedFromBlacklist")
      .withArgs(randomWallet1Address)
      .to.emit(blacklistERC20AsOwner, "RemovedFromBlacklist")
      .withArgs(randomWallet2Address)
      .to.emit(blacklistERC20AsOwner, "RemovedFromBlacklist")
      .withArgs(randomWallet3Address);
  });
  it("batchBlacklist() - should revert if sender does not have BLACKLIST_ROLE (add / remove)", async function () {
    await expect(
      blacklistERC20AsSender1.batchBlacklist([randomWallet2Address], true)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccessControlUnauthorizedAccount"
    );
    await expect(
      blacklistERC20AsSender1.batchBlacklist([randomWallet2Address], false)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccessControlUnauthorizedAccount"
    );
  });
  // ======================================= //
  // At this point, no wallet is blacklisted //
  // ======================================= //
  it("transfer() - should allow regular transfers for non-blacklisted addresses", async function () {
    const transferAmount = hre.ethers.parseUnits("1000", "ether");
    await expect(
      blacklistERC20AsSender1.transfer(randomWallet3Address, transferAmount)
    ).to.changeTokenBalances(
      blacklistERC20AsOwner,
      [randomWallet1Address, randomWallet3Address],
      [-transferAmount, transferAmount]
    );
  });
  it("transfer() - should block transfers for blacklisted addresses", async function () {
    await blacklistERC20AsOwner.addToBlacklist(randomWallet1Address);
    const transferAmount = hre.ethers.parseUnits("1000", "ether");
    await expect(
      blacklistERC20AsSender1.transfer(randomWallet3Address, transferAmount)
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccountBlacklisted"
    );
  });
  it("transferFrom() - should allow regular transfers for non-blacklisted addresses", async function () {
    const transferAmount = hre.ethers.parseUnits("1000", "ether");
    await blacklistERC20AsSender2.approve(randomWallet1Address, transferAmount);
    await expect(
      blacklistERC20AsSender1.transferFrom(
        randomWallet2Address,
        randomWallet3Address,
        transferAmount
      )
    ).to.changeTokenBalances(
      blacklistERC20AsOwner,
      [randomWallet2Address, randomWallet3Address],
      [-transferAmount, transferAmount]
    );
  });
  it("transferFrom() - should block transfers for blacklisted addresses", async function () {
    await blacklistERC20AsOwner.addToBlacklist(randomWallet2Address);
    const transferAmount = hre.ethers.parseUnits("1000", "ether");
    await blacklistERC20AsSender2.approve(randomWallet1Address, transferAmount);
    await expect(
      blacklistERC20AsSender1.transferFrom(
        randomWallet2Address,
        randomWallet3Address,
        transferAmount
      )
    ).to.be.revertedWithCustomError(
      blacklistERC20AsOwner,
      "AccountBlacklisted"
    );
  });
  // ============================================ //
  // Gas estimation for blacklisting 1000 wallets //
  // ============================================ //
  it("gas-cost: addToBlacklist() - blacklist 1000 wallets", async function () {
    this.timeout(1000_0000);
    const promises = [];
    for (let i = 0; i < NO_OF_DUMMY_WALLETS; i++) {
      promises.push(
        blacklistERC20AsOwner.addToBlacklist(dummyWalletAddresses[i])
      );
    }
    await Promise.all(promises);
  });
  it("gas-cost: batchBlacklist() - blacklist 1000 wallets", async function () {
    this.timeout(1000_0000);
    const BATCH_SIZE = 1000;
    const promises = [];
    for (let i = 0; i < NO_OF_DUMMY_WALLETS / BATCH_SIZE; i++) {
      const batch = dummyWalletAddresses.slice(
        i * BATCH_SIZE,
        (i + 1) * BATCH_SIZE
      );
      promises.push(
        blacklistERC20AsOwner.batchBlacklist(
          batch.map((w) => w),
          false
        )
      );
    }
    await Promise.all(promises);
  });
  it("gas-cost: multicall() - blacklist 1000 wallets", async function () {
    this.timeout(1000_0000);
    const multicallDataPromises = [];
    for (let i = 0; i < NO_OF_DUMMY_WALLETS; i++) {
      multicallDataPromises.push(
        blacklistERC20AsOwner.addToBlacklist.populateTransaction(
          dummyWalletAddresses[i]
        )
      );
    }
    const multicallsData = await Promise.all(multicallDataPromises);
    const BATCH_SIZE = 500;

    const promises = [];
    for (let i = 0; i < NO_OF_DUMMY_WALLETS / BATCH_SIZE; i++) {
      const batch = multicallsData.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const x = batch.map((m) => m.data as string);
      promises.push(blacklistERC20AsOwner.multicall(x));
    }
    await Promise.all(promises);
  });
});
