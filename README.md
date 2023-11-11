# Chainlabs Ticketing

This repo contains a set of smart contracts on the Ethereum blockchain to facilitate the creation, resale, and validation of NFT-based event tickets (digital twins of traditional tickets sold on platforms like Eventbrite).

# Project Setup

## Environment Setup

### Mandatory config variables to set

-   INFURA_KEY
-   MNEMONIC
-   ETHERSCAN_API_KEY

Set the environment variables using the below command

```shell
yarn hardhat vars set INFURA_KEY
yarn hardhat vars set MNEMONIC
yarn hardhat vars set ETHERSCAN_API_KEY
```

## Basic Commands

### Run Tests

```shell
yarn hardhat test
```

### Run tests with gas reports

```shell
REPORT_GAS=true yarn hardhat test
```

### Deploy contracts to default network

```shell
yarn hardhat run scripts/deploy.ts
```

# Design Thought Process

## Initial thoughts

-   Should tickets for all shows be condensed into a single collection?

    -   Pros
        -   Gas Efficient, no need for show administrators to deploy a contract for every show, can just mint new tickets with new tokenUris
    -   Cons
        -   Ideally, show information should be tracked off-chain using metadata. But grouping NFTs for all shows into a single connection would mean we need to track show information of each NFT on chain. which becomes tedious when clubbed into a single collection.
        -   Would make the logic for ticket marketplace where people would place ticket orders for certain shows complex as the orders and shows need to be matched within the same collection.
    -   Verdict
        -   Deploy a single factory contract which can create a different NFT collection for each show and keep track of show timing etc within itself (Gas tradeoff is worth it)

-   Mechanism for the ticket MarketPlace contract

    -   Use (showTime - currentTime) and ticketsAvailableForSale to dynamically calculate a fee in a given range of acceptable price
        -   Harder to track demand as ticketsAvailableForSale is a bad indicator of demand. There can only be one ticket in the pool but no interested buyers. Or there can be a 1000 tickets with 10,000 interested buyers. Without tracking buyer intentions on-chain it's harder to calculate demand
    -   Create an Auction system for ticket sales where buyers place bids and bids are fulfilled in a highest-value-first at regular intervals
        -   This enables the price to automatically balance itself based on market conditions
