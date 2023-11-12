# Solidity API

## IChainLabsTicketFactory

Entrypoint contract to create new ticket collections and aggregate ticket operations

### TicketCollectionCreated

```solidity
event TicketCollectionCreated(address ticketCollectionAddress, string name, string symbol, uint256 price, uint256 showTime, uint256 maxSupply)
```

Emitted everytime a new ticket collection is listed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketCollectionAddress | address | Address of the newly created collection |
| name | string | Name of the ticket collection |
| symbol | string | Short-hand notation to recognise the show / event by |
| price | uint256 | Price of a single ticket |
| showTime | uint256 | Show start time as a UTC timestamp |
| maxSupply | uint256 | Maximum number of available tickets |

### TicketTransferred

```solidity
event TicketTransferred(address ticketCollectionAddress, address fromAddress, address toAddress, uint256 tokenId)
```

Emitted everytime a ticket is transferred between addresses

_Transfers from null address indicate mints and transfers to null address indicate burns_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketCollectionAddress | address | Parent Collection to which the transferred ticket belongs to |
| fromAddress | address | Owner of the ticket pre-transfer |
| toAddress | address | Owner of the ticket post-transfer |
| tokenId | uint256 | Id of the token corresponding to the ticket being transferred |

### createTicketCollection

```solidity
function createTicketCollection(address owner, uint256 price, uint256 showStartTimeStamp, uint256 maxSupply, string name, string symbol, string baseTokenUri) external
```

Enables anyone to create a new ticket collection for a show
Deploys a new ChainLabsTicketCollection contract with provided arguments

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | Address to enable ownership priveleges to on the new ticket collection |
| price | uint256 | Price of a single ticket |
| showStartTimeStamp | uint256 | Show start time as a UTC timestamp |
| maxSupply | uint256 | Maximum number of available tickets |
| name | string | Name of the ticket collection |
| symbol | string | Short-hand notation to recognise the show / event by |
| baseTokenUri | string | Base uri for the ticket collection metadata, should be in the format `ipfs://asqwe..` |

