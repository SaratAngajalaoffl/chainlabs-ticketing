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

Required override to set a custom base token uri

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string Base IPFS link that contains individual files with NFT Metadata |

### _update

```solidity
function _update(address to, uint256 tokenId, address auth) internal virtual returns (address from)
```

override to call the log function on factory contract to aggregate logs

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | address of the owner pre-transfer |

### _getDigest

```solidity
function _getDigest(address toAddress, uint256 tokenId) internal view returns (bytes32)
```

_generates a digest for the token transfer intent object to be verified against the signature_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| toAddress | address | Recepient address for the NFT |
| tokenId | uint256 | Id of the NFT the user wishes to transfer |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | digest bytes32 digest data to be verified against the user provided signature |

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

