// interfaces/IChainLabsTicketCollection.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Interface for `ChainLabsTicketCollection` Contract
/// @author Sarat Angajala @mugiwaraa_eth
/// @notice NFT collection where each token represents a physical ticket
/// @dev Intended to be deployed from the ChainLabsTicketFactory contract
interface IChainLabsTicketCollection is IERC721 {
    /// @notice Call this function to mint a new NFT
    /// @dev Checks the amount paid, has available supply and show has not started yet before minting the token
    /// @param toAddress Recepient address for the ticket NFT
    function mintTicket(address toAddress) external payable;

    /// @notice Call this function with a signature from the owner to transfer on their behalf
    /// @dev Uses ERC712 as the signature schema, from address will be implied from the recovered address
    /// @param toAddress Recepient address for the ticket NFT
    /// @param tokenId Id of the token to transfer
    /// @param signature Signature generated using the ERC712 signature scheme
    function signedTransferFrom(
        address toAddress,
        uint256 tokenId,
        bytes calldata signature
    ) external;
}
