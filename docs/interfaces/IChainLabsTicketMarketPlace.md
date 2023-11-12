# Solidity API

## IChainLabsTicketMarketPlace

Marketplace contract for users to sell/buy tickets using an auction system

### Sale

```solidity
struct Sale {
  uint256 saleId;
  uint256 ticketId;
  address ticketOwner;
}
```

### Bid

```solidity
struct Bid {
  uint256 bidId;
  uint256 bidAmount;
  uint256 quantity;
  address bidAddress;
}
```

### Auction

```solidity
struct Auction {
  uint256 currentHighestBidId;
  mapping(uint256 => uint256) prevHighestBidId;
  uint256 prevAuctionPayoutTimeStamp;
  uint256 awaitPayoutClaimBidId;
}
```

### Pool

```solidity
struct Pool {
  uint256 headTicketSaleId;
  mapping(uint256 => uint256) prevTicketSaleId;
  uint256 numberOfSales;
  uint256 auction;
}
```

### SaleAdded

```solidity
event SaleAdded(address ticketCollectionAddress, address ticketSeller, uint256 ticketId, uint256 saleId)
```

Emitted when a seller lists a ticket for sale

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketCollectionAddress | address | Address of the assossiated ticketCollection |
| ticketSeller | address | Address that owns the ticket pre-sale |
| ticketId | uint256 | Id of the ticket the seller wants to put up for sale |
| saleId | uint256 | Id of the sale |

### BidPlaced

```solidity
event BidPlaced(address ticketCollectionAddress, uint256 bidPlacerAddress, uint256 bidId, uint256 quantity, uint256 bidAmount)
```

Emitted when a potential buyer places a bid

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketCollectionAddress | address | Address of the assossiated ticketCollection |
| bidPlacerAddress | uint256 | Address that places that bid |
| bidId | uint256 | Id of the newly placed bid |
| quantity | uint256 | Number of tickets the user wants to buy |
| bidAmount | uint256 | Amount the bidder is willing to pay per ticket |

### SaleFulfilled

```solidity
event SaleFulfilled(address ticketCollectionAddress, address seller, address buyer, uint256 ticketId, uint256 amountPaid)
```

Emitted when a buyer claims a ticket from the auction by paying his due

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketCollectionAddress | address | Address of the assossiated ticketCollection |
| seller | address | Address that recieves the payment from the sale |
| buyer | address | Address that won the auction and claimed his/her NFT |
| ticketId | uint256 | Id of the ticket that is transferred to the buyer |
| amountPaid | uint256 | Amount paid by the buyer for the ticket |

### placeBid

```solidity
function placeBid(address ticketContractAddress, uint256 bidAmount, uint256 quantity) external
```

Buyers call this function to place a bid

_Only Bid amounts higher than the current highest bid amount are accepted to make the process simpler_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketContractAddress | address | Address of the ticket collection contract the buyer wants to place a bid on |
| bidAmount | uint256 | Amount the user is willing to pay for the ticket |
| quantity | uint256 |  |

### claimBid

```solidity
function claimBid(address ticketContractAddress) external payable
```

Buyers call this function once an auction cycle ends and the buyer is declared the winner

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketContractAddress | address | Address of the ticket collection contract the buyer wants to claim |

