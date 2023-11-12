// core/ChainLabsTicketCollection.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/IChainLabsTicketCollection.sol";
import "./ChainLabsTicketFactory.sol";

/// @title ChainLabsTicketCollection
/// @author Sarat Angajala @mugiwaraa_eth
/// @notice NFT collection where each token represents a physical ticket
/// @dev Intended to be deployed from the ChainLabsTicketFactory contract
contract ChainLabsTicketCollection is
    ERC721,
    Ownable,
    IChainLabsTicketCollection,
    EIP712
{
    uint256 public price;
    uint256 public showStartTimeStamp;
    uint256 public maxSupply;
    string private baseTokenUri;
    address private factoryAddress;

    uint256 private _idCounter = 0; // Counter for NFT ids

    // Object to serialize user signature for transferring NFT
    struct TokenTransferIntent {
        address toAddress;
        uint256 tokenId;
    }

    constructor(
        string memory name,
        string memory symbol,
        address owner,
        uint256 _price,
        uint256 _showStartTimeStamp,
        uint256 _maxSupply,
        string memory _baseTokenUri
    ) ERC721(name, symbol) Ownable(owner) EIP712(name, "0") {
        price = _price;
        showStartTimeStamp = _showStartTimeStamp;
        maxSupply = _maxSupply;
        baseTokenUri = _baseTokenUri;
        factoryAddress = msg.sender;
    }

    error InvalidPrice(uint256 paidAmount, uint256 price); // Error for when paid amount doesn't match the specified price
    error HouseFull(); // Error for when all the tickets have been sold
    error ShowExpired(); // Error for when the show has already started

    /// @notice Required override to set a custom base token uri
    /// @return string Base IPFS link that contains individual files with NFT Metadata
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenUri;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address from) {
        from = super._update(to, tokenId, auth);
        ChainLabsTicketFactory(factoryAddress).logTransfer(from, to, tokenId);
    }

    /// @dev generates a digest for the token transfer intent object to be verified against the signature
    /// @param toAddress Recepient address for the NFT
    /// @param tokenId Id of the NFT the user wishes to transfer
    /// @return digest bytes32 digest data to be verified against the user provided signature
    function _getDigest(
        address toAddress,
        uint256 tokenId
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "TokenTransferIntent(address toAddress,uint256 tokenId)"
                        ),
                        toAddress,
                        tokenId
                    )
                )
            );
    }

    /// @notice Call this function to mint a new NFT
    /// @dev Checks the amount paid, has available supply and show has not started yet before minting the token
    /// @param toAddress Recepient address for the ticket NFT
    function mintTicket(address toAddress) external payable {
        if (msg.value != price) {
            revert InvalidPrice(msg.value, price);
        }

        if (_idCounter == maxSupply) {
            revert HouseFull();
        }

        if (block.timestamp >= showStartTimeStamp) {
            revert ShowExpired();
        }

        uint256 tokenId = _idCounter;
        ++_idCounter;

        _safeMint(toAddress, tokenId);
    }

    /// @notice Call this function with a signature from the owner to transfer on their behalf
    /// @dev Uses ERC712 as the signature schema, from address will be implied from the recovered address
    /// @param toAddress Recepient address for the ticket NFT
    /// @param tokenId Id of the token to transfer
    /// @param signature Signature generated using the ERC712 signature scheme
    function signedTransferFrom(
        address toAddress,
        uint256 tokenId,
        bytes calldata signature
    ) external {
        bytes32 digest = _getDigest(toAddress, tokenId);

        address fromAddress = ECDSA.recover(digest, signature);

        _safeTransfer(fromAddress, toAddress, tokenId);
    }
}
