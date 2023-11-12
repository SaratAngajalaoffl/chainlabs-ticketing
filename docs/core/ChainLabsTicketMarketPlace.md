# Solidity API

## ChainLabsTicketMarketPlace

Marketplace contract for users to sell/buy tickets using an auction system

### InSufficientBidAmount

```solidity
error InSufficientBidAmount()
```

### NoAvailableClaims

```solidity
error NoAvailableClaims()
```

### IncorrectPaymentAmount

```solidity
error IncorrectPaymentAmount()
```

### NoSalesAvailable

```solidity
error NoSalesAvailable()
```

### _verifyBidFullfillment

```solidity
function _verifyBidFullfillment(address ticketContractAddress) internal returns (bool)
```

Verifies if the specified amount of time has elapsed since the last sale and updates the storage for auction winner to claim his tickets

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketContractAddress | address | Address of the ticket collection contract the buyer wants to place a bid on |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | hasNewWinner Boolean value indicating if a new winner has been declared or not |

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

### onERC721Received

```solidity
function onERC721Received(address, address from, uint256 tokenId, bytes) external returns (bytes4)
```

Called when a user wants to put his ticket up for sale

_All token transfers to this contract are considered as being put for sale and cannot be withdrawn_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
|  | address |  |
| from | address | Owner of the token pre-transfer |
| tokenId | uint256 | Id of the token being transferred |
|  | bytes |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes4 | selector returns selector of `onERC721Received` to indicate the method is supported |

