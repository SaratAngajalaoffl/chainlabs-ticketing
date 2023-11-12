import { exec } from "child_process";
import { ethers } from "hardhat";

const NAME = "EthIndiaTicket";
const SYMBOL = "EIN";
const PRICE = ethers.parseUnits("2", "wei");
const SHOW_START_TIME = Math.floor(Date.now() / 100) + 10000;
const MAX_SUPPLY = 1000;
const BASE_TOKEN_URI = "ipfs://something/";

const main = async () => {
  const [owner] = await ethers.getSigners();

  console.log(`Deployment Address: ${owner.address}`);

  const ticketFactoryArtifact = await ethers.getContractFactory(
    "ChainLabsTicketFactory"
  );

  const ticketFactoryContract = await ticketFactoryArtifact.deploy();

  console.log(`Deploying ChainLabsTicketFactory`);

  await ticketFactoryContract.waitForDeployment();

  const ticketFactoryAddress = await ticketFactoryContract.getAddress();
  console.log(`ChainLabsTicketFactory: ${ticketFactoryAddress}`);

  let txReciept = await ticketFactoryContract.createTicketCollection(
    owner.address,
    PRICE,
    SHOW_START_TIME,
    MAX_SUPPLY,
    NAME,
    SYMBOL,
    BASE_TOKEN_URI
  );

  console.log(`Deploying ChainLabsTicketCollection`);

  await txReciept.wait();

  const filter = ticketFactoryContract.filters.TicketCollectionCreated;
  const [event] = await ticketFactoryContract.queryFilter(filter, -1);

  const ticketCollectionAddress = event.args.ticketCollectionAddress;
  console.log(`ChainLabsTicketCollection: ${ticketCollectionAddress}`);

  const ticketCollectionArgs = [
    NAME,
    SYMBOL,
    owner.address,
    ethers.formatEther(PRICE),
    SHOW_START_TIME,
    MAX_SUPPLY,
    BASE_TOKEN_URI,
  ].join(" ");

  const verificationCommand = `yarn hardhat verify --network sepolia ${ticketFactoryAddress} \n\
	 yarn hardhat verify --network sepolia ${ticketCollectionAddress} ${ticketCollectionArgs}`;

  console.log(`Running script to verify contracts`);

  console.log(
    `If failed, manually run the below commands \n\n ${verificationCommand}`
  );

  exec(verificationCommand);
};

main().catch((error) => console.log(`--err deploying: ${error.message}`));
