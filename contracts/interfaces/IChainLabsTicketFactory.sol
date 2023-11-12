// interfaces/IChainLabsTicketFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Interface for ChainLabsTicketFactory
/// @author Sarat Angajala @mugiwaraa_eth
/// @notice Entrypoint contract to create new ticket collections and aggregate ticket operations
interface IChainLabsTicketFactory {
    /// @notice Emitted everytime a new ticket collection is listed
    /// @param ticketCollectionAddress Address of the newly created collection
    /// @param name Name of the ticket collection
    /// @param symbol Short-hand notation to recognise the show / event by
    /// @param price Price of a single ticket
    /// @param showTime Show start time as a UTC timestamp
    /// @param maxSupply Maximum number of available tickets
    event TicketCollectionCreated(
        address ticketCollectionAddress,
        string name,
        string symbol,
        uint256 price,
        uint256 showTime,
        uint256 maxSupply
    );

    /// @notice Emitted everytime a ticket is transferred between addresses
    /// @dev Transfers from null address indicate mints and transfers to null address indicate burns
    /// @param ticketCollectionAddress Parent Collection to which the transferred ticket belongs to
    /// @param fromAddress Owner of the ticket pre-transfer
    /// @param toAddress Owner of the ticket post-transfer
    /// @param tokenId Id of the token corresponding to the ticket being transferred
    event TicketTransferred(
        address indexed ticketCollectionAddress,
        address indexed fromAddress,
        address indexed toAddress,
        uint256 tokenId
    );

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
    ) external;
}
