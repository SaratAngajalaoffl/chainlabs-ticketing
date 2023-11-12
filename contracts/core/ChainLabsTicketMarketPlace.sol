// core/ChainLabsTicketMarketPlace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IChainLabsTicketMarketPlace.sol";
import "../interfaces/IChainLabsTicketCollection.sol";

/// @title Interface for the ChainLabsTicketMarketPlace contract
/// @author Sarat Angajala @mugiwaraa_eth
/// @notice Marketplace contract for users to sell/buy tickets using an auction system
contract ChainLabsTicketMarketPlace is IChainLabsTicketMarketPlace {
    mapping(uint256 => Bid) private _bids;
    mapping(uint256 => Sale) private _sales;

    mapping(address => Pool) private _pools;

    uint256 private _idCounter; // Combined id counter for bids and sales

    uint256 private immutable AUCTION_BLOCK_DURATION = 300;

    error InSufficientBidAmount();
    error NoAvailableClaims();
    error IncorrectPaymentAmount();
    error NoSalesAvailable();

    function _verifyBidFullfillment(
        address ticketContractAddress
    ) internal returns (bool) {
        Auction storage auction = _pools[ticketContractAddress].auction;

        uint256 currentTimestamp = block.timestamp;

        if (auction.prevAuctionPayoutTimeStamp == 0) {
            revert NoSalesAvailable();
        }

        if (
            currentTimestamp - auction.prevAuctionPayoutTimeStamp <
            AUCTION_BLOCK_DURATION
        ) {
            return false;
        }

        auction.awaitPayoutClaimBidId = auction.currentHighestBidId;
        auction.currentHighestBidId = auction.prevHighestBidId[
            auction.currentHighestBidId
        ];

        return true;
    }

    /// @notice Buyers call this function to place a bid
    /// @dev Only Bid amounts higher than the current highest bid amount are accepted to make the process simpler
    /// @param ticketContractAddress Address of the ticket collection contract the buyer wants to place a bid on
    /// @param bidAmount Amount the user is willing to pay for the ticket
    function placeBid(
        address ticketContractAddress,
        uint256 bidAmount,
        uint256 quantity
    ) external {
        Auction storage auction = _pools[ticketContractAddress].auction;

        if (_bids[auction.currentHighestBidId].bidAmount >= bidAmount) {
            revert InSufficientBidAmount();
        }

        uint256 bidId = _idCounter;

        unchecked {
            ++_idCounter;
        }

        Bid memory newBid = Bid({
            bidAmount: bidAmount,
            bidId: bidId,
            quantity: quantity,
            bidAddress: msg.sender
        });

        auction.prevHighestBidId[bidId] = auction.currentHighestBidId;
        auction.currentHighestBidId = bidId;

        _bids[bidId] = newBid;

        emit BidPlaced(
            ticketContractAddress,
            msg.sender,
            bidId,
            quantity,
            bidAmount
        );
    }

    /// @notice Buyers call this function once an auction cycle ends and the buyer is declared the winner
    /// @param ticketContractAddress Address of the ticket collection contract the buyer wants to claim
    function claimBid(address ticketContractAddress) external payable {
        _verifyBidFullfillment(ticketContractAddress);

        Pool storage pool = _pools[ticketContractAddress];
        address claimer = msg.sender;

        Bid memory payoutBid = _bids[pool.auction.awaitPayoutClaimBidId];

        uint256 quantity = payoutBid.quantity;
        uint256 bidAmount = payoutBid.bidAmount;
        address bidAddress = payoutBid.bidAddress;

        if (payoutBid.bidAddress != claimer) {
            revert NoAvailableClaims();
        }

        if (msg.value != payoutBid.quantity * payoutBid.bidAmount) {
            revert IncorrectPaymentAmount();
        }

        pool.auction.awaitPayoutClaimBidId = 0;

        for (uint256 i = 0; i < quantity; ++i) {
            uint256 headTicketSaleId = pool.headTicketSaleId;

            Sale memory sale = _sales[headTicketSaleId];
            pool.headTicketSaleId = pool.prevTicketSaleId[headTicketSaleId];

            IChainLabsTicketCollection(ticketContractAddress).safeTransferFrom(
                address(this),
                bidAddress,
                sale.ticketId
            );

            payable(sale.ticketOwner).transfer(bidAmount);

            emit SaleFulfilled(
                ticketContractAddress,
                sale.ticketOwner,
                bidAddress,
                sale.ticketId,
                bidAmount
            );
        }
    }

    /// @notice Called when a user wants to put his ticket up for sale
    /// @dev All token transfers to this contract are considered as being put for sale and cannot be withdrawn
    /// @param from Owner of the token pre-transfer
    /// @param tokenId Id of the token being transferred
    /// @return selector returns selector of `onERC721Received` to indicate the method is supported
    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        Pool storage pool = _pools[msg.sender];

        uint256 saleId = _idCounter;

        unchecked {
            ++_idCounter;
        }

        if (pool.numberOfSales == 0) {
            // if no previous sale ids, set current sale id as head
            pool.headTicketSaleId = saleId;
            pool.auction.prevAuctionPayoutTimeStamp = block.timestamp;
        } else {
            // FIFO Queue
            pool.prevTicketSaleId[pool.lastTicketSaleId] = saleId;
        }

        pool.lastTicketSaleId = saleId;
        ++pool.numberOfSales;

        Sale storage sale = _sales[saleId];
        sale.saleId = saleId;
        sale.ticketId = tokenId;
        sale.ticketOwner = from;

        emit SaleAdded(msg.sender, from, tokenId, saleId);

        return IERC721Receiver.onERC721Received.selector;
    }
}
