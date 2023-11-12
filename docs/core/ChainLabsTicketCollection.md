# Solidity API

## ChainLabsTicketCollection

NFT collection where each token represents a physical ticket

_Intended to be deployed from the ChainLabsTicketFactory contract_

### price

```solidity
uint256 price
```

### showStartTimeStamp

```solidity
uint256 showStartTimeStamp
```

### maxSupply

```solidity
uint256 maxSupply
```

### TokenTransferIntent

```solidity
struct TokenTransferIntent {
  address toAddress;
  uint256 tokenId;
}
```

### constructor

```solidity
constructor(string name, string symbol, address owner, uint256 _price, uint256 _showStartTimeStamp, uint256 _maxSupply, string _baseTokenUri) public
```

### InvalidPrice

```solidity
error InvalidPrice(uint256 paidAmount, uint256 price)
```

### HouseFull

```solidity
error HouseFull()
```

### ShowExpired

```solidity
error ShowExpired()
```

### _baseURI

```solidity
function _baseURI() internal view virtual returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### _getDigest

```solidity
function _getDigest(address toAddress, uint256 tokenId) internal view returns (bytes32)
```

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

