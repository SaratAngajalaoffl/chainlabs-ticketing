import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainLabsTicketCollection } from "../typechain-types";

const NAME = "TICKET";
const SYMBOL = "TKT";
const PRICE = ethers.parseUnits("1", "wei");
const SHOW_START_TIME = Math.floor(Date.now() / 100) + 100;
const MAX_SUPPLY = 1;
const BASE_TOKEN_URI = "ipfs://something/";

describe("ChainLabsTicketFactory", () => {
  const deployChainLabsTicketFactory = async () => {
    let [owner, otherAccount] = await ethers.getSigners();

    // deploy ticket collection contract with correct arguments
    const contract = await ethers.deployContract("ChainLabsTicketFactory");

    return { owner, otherAccount, contract };
  };

  describe("when being deployed", () => {
    it("should deploy", async () => {
      const { contract } = await loadFixture(deployChainLabsTicketFactory);

      expect(await contract.getDeployedCode()).to.not.equal(undefined);
    });
  });

  describe("when creating new ticket collection", () => {
    it("should emit ticket collection creation event", async () => {
      const { owner, contract } = await loadFixture(
        deployChainLabsTicketFactory
      );

      await expect(
        contract.createTicketCollection(
          owner.address,
          PRICE,
          SHOW_START_TIME,
          MAX_SUPPLY,
          NAME,
          SYMBOL,
          BASE_TOKEN_URI
        )
      ).to.emit(contract, "TicketCollectionCreated");
    });
  });

  describe("when logging a ticket transfer", () => {
    describe("when the address trying to log isn't a ticket collection", () => {
      it("should throw ERC721NotSupported error", async () => {
        const { owner, otherAccount, contract } = await loadFixture(
          deployChainLabsTicketFactory
        );

        await expect(
          contract.logTransfer(owner.address, otherAccount.address, 0)
        ).to.revertedWithCustomError(contract, "ERC721NotSupported");
      });
    });

    describe("when the address trying to log is a ticket collection", () => {
      it("should emit the transfer event", async () => {
        const { owner, otherAccount, contract } = await loadFixture(
          deployChainLabsTicketFactory
        );

        await contract.createTicketCollection(
          owner.address,
          PRICE,
          SHOW_START_TIME,
          MAX_SUPPLY,
          NAME,
          SYMBOL,
          BASE_TOKEN_URI
        );

        // get deployed contract address from emitted event
        const filter = contract.filters.TicketCollectionCreated;
        const [event] = await contract.queryFilter(filter, -1);
        const ticketContractAddress = event.args.ticketCollectionAddress;

        // Setup `ChainLabsTicketCollection` from the address
        const collectionFactory = await ethers.getContractFactory(
          "ChainLabsTicketCollection"
        );
        const ticketContract: ChainLabsTicketCollection = new ethers.Contract(
          ticketContractAddress,
          collectionFactory.interface,
          collectionFactory.runner
        ) as any;

        expect(
          ticketContract.mintTicket(otherAccount.address, { value: PRICE })
        )
          .to.emit(contract, "TicketTransferred")
          .withArgs(
            ticketContractAddress,
            ethers.ZeroAddress,
            otherAccount.address,
            0
          );
      });
    });
  });
});
