# Solidity API

## ChainLabsTicketFactory

Entrypoint contract to create new ticket collections and aggregate ticket operations

### isChainLabsTicketCollection

```solidity
mapping(address => bool) isChainLabsTicketCollection
```

### ERC721NotSupported

```solidity
error ERC721NotSupported(address tokenAddress)
```

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

### logTransfer

```solidity
function logTransfer(address fromAddress, address toAddress, uint256 tokenId) external
```

Aggregates logs from all ticket collection contracts

_Can only be initiated from ticket collection contracts deployed from this factory_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fromAddress | address | Owner of the token pre-transfer, null address when minting |
| toAddress | address | Owner of the token post-transfer, null address when burning |
| tokenId | uint256 | Id of the token being transferred |

