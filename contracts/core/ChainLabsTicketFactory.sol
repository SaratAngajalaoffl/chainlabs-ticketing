// core/ChainLabsTicketFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IChainLabsTicketFactory.sol";
import "./ChainLabsTicketCollection.sol";

/// @title ChainLabsTicketFactory
/// @author Sarat Angajala @mugiwaraa_eth
/// @notice Entrypoint contract to create new ticket collections and aggregate ticket operations
contract ChainLabsTicketFactory is IChainLabsTicketFactory {
    mapping(address => bool) public isChainLabsTicketCollection;

    error ERC721NotSupported(address tokenAddress);

    /// @notice Enables anyone to create a new ticket collection for a show
    /// @notice Deploys a new ChainLabsTicketCollection contract with provided arguments
    /// @param owner Address to enable ownership priveleges to on the new ticket collection
    /// @param price Price of a single ticket
    /// @param showStartTimeStamp Show start time as a UTC timestamp
    /// @param maxSupply Maximum number of available tickets
    /// @param name Name of the ticket collection
    /// @param symbol Short-hand notation to recognise the show / event by
    /// @param baseTokenUri Base uri for the ticket collection metadata, should be in the format `ipfs://asqwe..`
    function createTicketCollection(
        address owner,
        uint256 price,
        uint256 showStartTimeStamp,
        uint256 maxSupply,
        string calldata name,
        string calldata symbol,
        string calldata baseTokenUri
    ) external {
        ChainLabsTicketCollection collection = new ChainLabsTicketCollection(
            name,
            symbol,
            owner,
            price,
            showStartTimeStamp,
            maxSupply,
            baseTokenUri
        );

        isChainLabsTicketCollection[address(collection)] = true;

        emit TicketCollectionCreated(
            address(collection),
            name,
            symbol,
            price,
            showStartTimeStamp,
            maxSupply
        );
    }

    /// @notice Aggregates logs from all ticket collection contracts
    /// @dev Can only be initiated from ticket collection contracts deployed from this factory
    /// @param fromAddress Owner of the token pre-transfer, null address when minting
    /// @param toAddress Owner of the token post-transfer, null address when burning
    /// @param tokenId Id of the token being transferred
    function logTransfer(
        address fromAddress,
        address toAddress,
        uint256 tokenId
    ) external {
        if (!isChainLabsTicketCollection[msg.sender]) {
            revert ERC721NotSupported(msg.sender);
        }

        emit TicketTransferred(msg.sender, fromAddress, toAddress, tokenId);
    }
}
