import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

const NAME = "TICKET";
const SYMBOL = "TKT";
const PRICE = ethers.parseUnits("1", "wei");
const SHOW_START_TIME = Math.floor(Date.now() / 100) + 100;
const MAX_SUPPLY = 1;
const BASE_TOKEN_URI = "ipfs://something/";

let tokenTransferIntent = [
  { name: "toAddress", type: "address" },
  { name: "tokenId", type: "uint256" },
];

const types = {
  TokenTransferIntent: tokenTransferIntent,
};

describe("ChainLabsTicketCollection", () => {
  const deployChainLabsTicketCollection = async () => {
    let [owner, otherAccount] = await ethers.getSigners();

    const OWNER = owner.address;

    // deploy ticket collection contract with correct arguments
    const contract = await ethers.deployContract("ChainLabsTicketCollection", [
      NAME,
      SYMBOL,
      OWNER,
      PRICE,
      SHOW_START_TIME,
      MAX_SUPPLY,
      BASE_TOKEN_URI,
    ]);

    return { owner, otherAccount, contract };
  };

  describe("When deploying", async () => {
    it("Should set the right initial parameters", async () => {
      const { owner, contract } = await loadFixture(
        deployChainLabsTicketCollection
      );

      const OWNER = owner.address;

      expect(await contract.name()).to.equal(NAME);
      expect(await contract.symbol()).to.equal(SYMBOL);
      expect(await contract.owner()).to.equal(OWNER);
      expect(await contract.price()).to.equal(PRICE);
      expect(await contract.showStartTimeStamp()).to.equal(SHOW_START_TIME);
      expect(await contract.maxSupply()).to.equal(MAX_SUPPLY);
    });
  });

  describe("When minting", async () => {
    it("Should succeed and emit `Transfer` if all requirements are met", async () => {
      const { otherAccount, contract } = await loadFixture(
        deployChainLabsTicketCollection
      );

      // Mint 1 ticket to hit the maximum
      await expect(contract.mintTicket(otherAccount.address, { value: PRICE }))
        .to.emit(contract, "Transfer")
        .withArgs(ethers.ZeroAddress, otherAccount.address, 0);

      // Correct token URI is retur
      expect(await contract.tokenURI(0)).to.equal(`${BASE_TOKEN_URI}0`);
    });

    it("Should fail if not enough price is paid", async () => {
      const { otherAccount, contract } = await loadFixture(
        deployChainLabsTicketCollection
      );

      await expect(
        contract.mintTicket(otherAccount.address, {
          value: ethers.parseEther("0"),
        })
      )
        .to.revertedWithCustomError(contract, "InvalidPrice")
        .withArgs(0, 1);
    });

    it("Should fail if max supply of tickets already minted", async () => {
      const { otherAccount, contract } = await loadFixture(
        deployChainLabsTicketCollection
      );

      // Mint 1 ticket to hit the maximum
      await contract.mintTicket(otherAccount.address, { value: PRICE });

      await expect(
        contract.mintTicket(otherAccount.address, { value: PRICE })
      ).to.revertedWithCustomError(contract, "HouseFull");
    });

    it("Should fail if show already started", async () => {
      const { otherAccount, contract } = await loadFixture(
        deployChainLabsTicketCollection
      );

      time.increaseTo(SHOW_START_TIME);

      await expect(
        contract.mintTicket(otherAccount.address, { value: PRICE })
      ).to.revertedWithCustomError(contract, "ShowExpired");
    });
  });

  describe("When transferring using signature", () => {
    it("Should succeed and emit `Transfer` when signature is correct", async () => {
      const { owner, otherAccount, contract } = await loadFixture(
        deployChainLabsTicketCollection
      );

      await contract.mintTicket(otherAccount.address, { value: PRICE });

      let domainData = {
        name: NAME,
        version: "0",
        chainId: network.config.chainId,
        verifyingContract: await contract.getAddress(),
      };

      let transferIntent = {
        toAddress: owner.address,
        tokenId: 0,
      };

      const signature = await otherAccount.signTypedData(
        domainData,
        types,
        transferIntent
      );

      await expect(contract.signedTransferFrom(owner.address, 0, signature))
        .to.emit(contract, "Transfer")
        .withArgs(otherAccount.address, owner.address, 0);
    });

    it("Should fail when signed with wrong account", async () => {
      const { owner, otherAccount, contract } = await loadFixture(
        deployChainLabsTicketCollection
      );

      await contract.mintTicket(otherAccount.address, { value: PRICE });

      let domainData = {
        name: NAME,
        version: "0",
        chainId: network.config.chainId,
        verifyingContract: await contract.getAddress(),
      };

      let transferIntent = {
        toAddress: owner.address,
        tokenId: 0,
      };

      const signature = await owner.signTypedData(
        domainData,
        types,
        transferIntent
      );

      await expect(contract.signedTransferFrom(owner.address, 0, signature))
        .to.revertedWithCustomError(contract, "ERC721IncorrectOwner")
        .withArgs(owner.address, 0, otherAccount.address);
    });
  });
});
