import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainLabsTicketCollection } from "../typechain-types";

const NAME = "TICKET";
const SYMBOL = "TKT";
const PRICE = ethers.parseUnits("1", "wei");
const SHOW_START_TIME = Math.floor(Date.now() / 100) + 100;
const MAX_SUPPLY = 2;
const BASE_TOKEN_URI = "ipfs://something/";

describe("ChainLabsTicketMarketPlace", () => {
  const deployContracts = async () => {
    const [account1, account2, account3] = await ethers.getSigners();

    const factoryContract = await ethers.deployContract(
      "ChainLabsTicketFactory"
    );

    const OWNER = account1.address;

    await factoryContract.createTicketCollection(
      OWNER,
      PRICE,
      SHOW_START_TIME,
      MAX_SUPPLY,
      NAME,
      SYMBOL,
      BASE_TOKEN_URI
    );

    // get deployed contract address from emitted event
    const filter = factoryContract.filters.TicketCollectionCreated;
    const [event] = await factoryContract.queryFilter(filter, -1);
    const contractAddress = event.args.ticketCollectionAddress;

    // Setup `ChainLabsTicketCollection` from the address
    const collectionFactory = await ethers.getContractFactory(
      "ChainLabsTicketCollection"
    );

    const ticketContract: ChainLabsTicketCollection = new ethers.Contract(
      contractAddress,
      collectionFactory.interface,
      collectionFactory.runner
    ) as any;

    const marketContract = await ethers.deployContract(
      "ChainLabsTicketMarketPlace"
    );

    return { account1, account2, account3, ticketContract, marketContract };
  };

  describe("when contract is deployed", () => {
    it("deployment should work", async () => {
      const { marketContract } = await loadFixture(deployContracts);

      expect(marketContract.getDeployedCode).to.not.equal(undefined);
    });
  });

  describe("when a ticket is transferred", () => {
    it("should be able to recieve tokens", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await expect(
        ticketContract["safeTransferFrom(address,address,uint256)"](
          account1.address,
          await marketContract.getAddress(),
          0
        )
      ).to.emit(ticketContract, "Transfer");
    });

    it("should emit SaleAdded event", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await expect(
        ticketContract["safeTransferFrom(address,address,uint256)"](
          account1.address,
          await marketContract.getAddress(),
          0
        )
      ).to.emit(marketContract, "SaleAdded");
    });

    it("should support adding a second sale", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await ticketContract["safeTransferFrom(address,address,uint256)"](
        account1.address,
        await marketContract.getAddress(),
        0
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await expect(
        ticketContract["safeTransferFrom(address,address,uint256)"](
          account1.address,
          await marketContract.getAddress(),
          1
        )
      ).to.emit(marketContract, "SaleAdded");
    });
  });

  describe("when a bid is placed", () => {
    it("should emit `BidPlaced` event when all parameters are present", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await expect(
        marketContract.placeBid(
          await ticketContract.getAddress(),
          ethers.parseUnits("2", "wei"),
          1
        )
      ).to.emit(marketContract, "BidPlaced");
    });

    it("should fail when placing bid with amount less than current highest", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await marketContract.placeBid(
        await ticketContract.getAddress(),
        ethers.parseUnits("2", "wei"),
        1
      );

      await expect(
        marketContract.placeBid(
          await ticketContract.getAddress(),
          ethers.parseUnits("1", "wei"),
          1
        )
      ).to.revertedWithCustomError(marketContract, "InSufficientBidAmount");
    });

    it("should succeed when placing bid with amount more than current highest", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await marketContract.placeBid(
        await ticketContract.getAddress(),
        ethers.parseUnits("2", "wei"),
        1
      );

      await expect(
        marketContract.placeBid(
          await ticketContract.getAddress(),
          ethers.parseUnits("3", "wei"),
          1
        )
      ).to.emit(marketContract, "BidPlaced");
    });
  });

  describe("when trying to claim bids", () => {
    it("Should throw error if there are no bids", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await ticketContract["safeTransferFrom(address,address,uint256)"](
        account1.address,
        await marketContract.getAddress(),
        0
      );

      await expect(
        marketContract.claimBid(await ticketContract.getAddress(), {
          value: ethers.parseUnits("2", "wei"),
        })
      ).to.revertedWithCustomError(marketContract, "NoAvailableClaims");
    });

    it("Should throw error if there are no sales", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await marketContract.placeBid(
        await ticketContract.getAddress(),
        ethers.parseUnits("2", "wei"),
        1
      );

      await expect(
        marketContract.claimBid(await ticketContract.getAddress(), {
          value: ethers.parseUnits("2", "wei"),
        })
      ).to.revertedWithCustomError(marketContract, "NoSalesAvailable");
    });

    it("Should throw error if time elapsed from last sale is not greater than auction block duration", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await ticketContract["safeTransferFrom(address,address,uint256)"](
        account1.address,
        await marketContract.getAddress(),
        0
      );

      await marketContract.placeBid(
        await ticketContract.getAddress(),
        ethers.parseUnits("2", "wei"),
        1
      );

      await expect(
        marketContract.claimBid(await ticketContract.getAddress(), {
          value: ethers.parseUnits("2", "wei"),
        })
      ).to.revertedWithCustomError(marketContract, "NoAvailableClaims");
    });

    it("Should throw error if incorrect payment amount is sent", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await ticketContract["safeTransferFrom(address,address,uint256)"](
        account1.address,
        await marketContract.getAddress(),
        0
      );

      await marketContract.placeBid(
        await ticketContract.getAddress(),
        ethers.parseUnits("2", "wei"),
        1
      );

      await time.increase(500);

      await expect(
        marketContract.claimBid(await ticketContract.getAddress(), {
          value: ethers.parseUnits("1", "wei"),
        })
      ).to.revertedWithCustomError(marketContract, "IncorrectPaymentAmount");
    });

    it("Should be able to claim if sufficient time has elapsed", async () => {
      const { account1, ticketContract, marketContract } = await loadFixture(
        deployContracts
      );

      await ticketContract.mintTicket(account1.address, { value: PRICE });

      await ticketContract["safeTransferFrom(address,address,uint256)"](
        account1.address,
        await marketContract.getAddress(),
        0
      );

      await marketContract.placeBid(
        await ticketContract.getAddress(),
        ethers.parseUnits("2", "wei"),
        1
      );

      await time.increase(500);

      await expect(
        marketContract.claimBid(await ticketContract.getAddress(), {
          value: ethers.parseUnits("2", "wei"),
        })
      ).to.emit(ticketContract, "Transfer");
    });
  });
});
