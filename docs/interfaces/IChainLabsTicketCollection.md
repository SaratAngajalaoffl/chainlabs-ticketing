# Solidity API

## IChainLabsTicketCollection

NFT collection where each token represents a physical ticket

_Intended to be deployed from the ChainLabsTicketFactory contract_

### mintTicket

```solidity
function mintTicket(address toAddress) external payable
```

Call this function to mint a new NFT

_Checks the amount paid, has available supply and show has not started yet before minting the token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| toAddress | address | Recepient address for the ticket NFT |

### signedTransferFrom

```solidity
function signedTransferFrom(address toAddress, uint256 tokenId, bytes signature) external
```

Call this function with a signature from the owner to transfer on their behalf

_Uses ERC712 as the signature schema, from address will be implied from the recovered address_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| toAddress | address | Recepient address for the ticket NFT |
| tokenId | uint256 | Id of the token to transfer |
| signature | bytes | Signature generated using the ERC712 signature scheme |

