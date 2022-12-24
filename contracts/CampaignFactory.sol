// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Campaign.sol";

/**
 * @title CampaignFactory
 * @author TheV
 * @notice Factory for Campaigns
 */
contract CampaignFactory {
    address[] public campaigns;
    event NewCampaign(address indexed _destination, uint256 indexed _idx, uint256 _goal);

    /**
     * @notice Allows a founder to create a new campaign
     * @param _goal The goal of the campaign
     */
    function createCampaign(
        uint256 _goal,
        string memory _badgeName,
        string memory _badgeSymbol
    ) external {
        address newCampaign = address(new Campaign(msg.sender, _goal, _badgeName, _badgeSymbol));
        campaigns.push(newCampaign);
        emit NewCampaign(newCampaign, campaigns.length - 1, _goal);
    }
}
