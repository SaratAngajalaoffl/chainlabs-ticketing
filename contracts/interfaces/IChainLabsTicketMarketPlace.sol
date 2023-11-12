// interfaces/IChainLabsTicketMarketPlace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @title Interface for the ChainLabsTicketMarketPlace contract
/// @author Sarat Angajala @mugiwaraa_eth
/// @notice Marketplace contract for users to sell/buy tickets using an auction system
interface IChainLabsTicketMarketPlace is IERC721Receiver {
    struct Sale {
        uint256 saleId;
        uint256 ticketId;
        address ticketOwner;
    }

    struct Bid {
        uint256 bidId;
        uint256 bidAmount;
        uint256 quantity;
        address bidAddress;
    }

    struct Auction {
        uint256 currentHighestBidId;
        mapping(uint256 => uint256) prevHighestBidId;
        uint256 prevAuctionPayoutTimeStamp;
        uint256 awaitPayoutClaimBidId;
    }

    struct Pool {
        uint256 headTicketSaleId;
        mapping(uint256 => uint256) prevTicketSaleId;
        uint256 numberOfSales;
        uint256 auction;
    }

    /// @notice Emitted when a seller lists a ticket for sale
    /// @param ticketCollectionAddress Address of the assossiated ticketCollection
    /// @param ticketSeller Address that owns the ticket pre-sale
    /// @param ticketId Id of the ticket the seller wants to put up for sale
    /// @param saleId Id of the sale
    event SaleAdded(
        address indexed ticketCollectionAddress,
        address indexed ticketSeller,
        uint256 ticketId,
        uint256 saleId
    );

    /// @notice Emitted when a potential buyer places a bid
    /// @param ticketCollectionAddress Address of the assossiated ticketCollection
    /// @param bidPlacerAddress Address that places that bid
    /// @param bidId Id of the newly placed bid
    /// @param quantity Number of tickets the user wants to buy
    /// @param bidAmount Amount the bidder is willing to pay per ticket
    event BidPlaced(
        address indexed ticketCollectionAddress,
        uint256 indexed bidPlacerAddress,
        uint256 bidId,
        uint256 quantity,
        uint256 bidAmount
    );

    /// @notice Emitted when a buyer claims a ticket from the auction by paying his due
    /// @param ticketCollectionAddress Address of the assossiated ticketCollection
    /// @param seller Address that recieves the payment from the sale
    /// @param buyer Address that won the auction and claimed his/her NFT
    /// @param ticketId Id of the ticket that is transferred to the buyer
    /// @param amountPaid  Amount paid by the buyer for the ticket
    event SaleFulfilled(
        address indexed ticketCollectionAddress,
        address indexed seller,
        address indexed buyer,
        uint256 ticketId,
        uint256 amountPaid
    );

    /// @notice Buyers call this function to place a bid
    /// @dev Only Bid amounts higher than the current highest bid amount are accepted to make the process simpler
    /// @param ticketContractAddress Address of the ticket collection contract the buyer wants to place a bid on
    /// @param bidAmount Amount the user is willing to pay for the ticket
    function placeBid(
        address ticketContractAddress,
        uint256 bidAmount,
        uint256 quantity
    ) external;

    /// @notice Buyers call this function once an auction cycle ends and the buyer is declared the winner
    /// @param ticketContractAddress Address of the ticket collection contract the buyer wants to claim
    function claimBid(address ticketContractAddress) external payable;
}
