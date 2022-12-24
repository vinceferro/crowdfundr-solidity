// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title Campaign
 * @author TheV
 * @notice This contract represent a Campaign that can be funded by the community,
 * having a time limit of 30 days and a specific target.
 */
contract Campaign is ERC721 {
    uint256 private _tokenIds;

    address public owner;

    uint256 public goal;
    uint256 public totalRaised;
    uint256 public deadline;
    mapping(address => uint256) public contributorAmounts;

    event Contribution(address indexed _contributor, uint256 amount);
    event Withdrawal(address indexed _recipient, uint256 _amount);
    event Terminated();

    uint8 locked = 1;

    modifier lock() {
        require(locked == 1, "E_LOCKED");
        locked = 2;
        _;
        locked = 1;
    }

    modifier onlyActive() {
        require(block.timestamp < deadline, "The deadline has passed");
        _;
    }

    modifier onlyFundable() {
        require(totalRaised < goal, "The goal has been reached");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /**
     * @author TheV
     * @notice Constructor of the campaign
     * @dev totalRaised is 0 by default, deadline is set to block.timestamp + 30 days by default
     * @param _owner The address of the owner of the campaign
     * @param _goal The goal of the campaign. Must be over 0.01 ETH as that's the minumum amount
     * of ETH that can be donated
     * @param _badgeName The name passed to the ERC721 constructor for the badge NFT
     * @param _badgeSymbol The symbol passed to the ERC721 constructor for the badge NFT
     */
    constructor(
        address _owner,
        uint256 _goal,
        string memory _badgeName,
        string memory _badgeSymbol
    ) ERC721(_badgeName, _badgeSymbol) {
        require(_goal > 0.01 ether, "The goal must be greater than 0.01 ether");
        owner = _owner;
        goal = _goal;
        deadline = block.timestamp + 30 days;
    }

    /**
     * @notice Allows the user to contribute to the campaign
     * @dev The contribution must be at least 0.01 ETH
     */
    function contribute() external payable onlyActive onlyFundable lock {
        require(msg.value >= 0.01 ether, "The contribution must be greater than 0.01 ether");
        totalRaised += msg.value;
        uint256 oldAmount = contributorAmounts[msg.sender];
        uint256 newAmount = oldAmount + msg.value;
        contributorAmounts[msg.sender] = newAmount;

        emit Contribution(msg.sender, msg.value);
        uint256 toMint = (newAmount / 10**18) - (oldAmount / 10**18);
        // gas optimization
        if (toMint > 0) {
            for (uint256 i = 0; i < toMint; ++i) {
                _safeMint(msg.sender, _tokenIds + 1 + i);
            }
            _tokenIds += toMint; // gas optimization
        }
    }

    /**
     * @notice Allows the owner to withdraw the funds
     * @dev The owner can only withdraw the funds if the goal is reached
     */
    function withdraw(uint256 _amount) external onlyOwner lock {
        require(totalRaised >= goal, "The goal has not been reached");
        require(_amount <= address(this).balance, "The amount to withdraw is greater than the balance");
        emit Withdrawal(owner, _amount);

        (bool success, ) = payable(msg.sender).call{ value: _amount }("");
        require(success, "transfer failed");
    }

    /**
     * @notice Allows the contributor to withdraw the funds
     * @dev The contributor can only withdraw the funds if the project is terminated
     */
    function contributorWithdraw() external lock {
        require(block.timestamp > deadline, "The project is still running");
        require(totalRaised < goal, "The project is fully funded");
        uint256 userContribution = contributorAmounts[msg.sender];
        require(userContribution > 0, "You have not contributed to this project");
        contributorAmounts[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{ value: userContribution }("");
        require(success, "transfer failed");
    }

    /**
     * @notice Allows the owner to terminate the campaign
     * @dev The campaing is terminated by overriding the deadline with the current timestamp - 1 days
     * as reasonable buffer for block time
     */
    function terminate() external onlyOwner onlyActive onlyFundable lock {
        deadline = block.timestamp - 1 days;
        emit Terminated();
    }
}
