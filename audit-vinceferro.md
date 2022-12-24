# Crowdfundr micro-audit by @eswak

Code by @vinceferro https://github.com/ShipyardDAO/student.vinceferro/blob/master/crowdfund/

# High-profile vulnerabilities

No high-profile vulnerabilities found.

# Medium-profile vulnerabilities

## **[M-1]** Wrong NFT minting logic

On line 87, Campaign.sol has the following code:

```
if (oldAmount < 1 ether && contributorAmounts[msg.sender] >= 1 ether) {
```

This condition for minting NFTs is not compliant with the spec:

> One address can receive multiple badges, but should only receive 1 badge per 1 ETH.

Consider: tracking the contributed balance per user in a separate state variable and updating the NFT minting logic.

# Low-profile vulnerabilities

## **[L-1]** Wrong withdraw amount for creator

On line 102, Campaign.sol has the following code:

```
payable(msg.sender).transfer(address(this).balance);
```

This ignores the parameter `_amount` that is desired to withdraw, and withdraws the whole balance.

This also breaks composability, by using transfer() instead of call(), it only forwards a small amount of gas, and prevents some smart contract contributor to define a callback behavior on ETH reception. See https://solidity-by-example.org/sending-ether/

Consider: sending `_amount` ether instead of `address(this).balance`, and use `.call{value:_amount}("")` instead of `transfer()`.

# Quality improvement suggestions

## **[Q-1]** Repeated uses of console.sol

On line 5, CampaignFactory.sol has the following code:

```
import "hardhat/console.sol";
```

Using this library wastes some gas on live networks.

Consider: Removing all references to Hardhat's console.sol module (`console.log(...)`) after your development phase is over.

## **[Q-2]** Unused variable

On line 14, CampaignFactory.sol has the following code:

```
mapping(address => uint256) public backers;
```

This variable is not used.

Consider: Removing this public state variable.

## **[Q-3]** Missing documentation

On line 15, CampaignFactory.sol has the following code:

```
mapping(address => uint256) public backers;
```

It is not obvious what `_destination` and `_idx` are.

Consider: Documenting your events and state variables (check out [NatSpec](https://docs.soliditylang.org/en/v0.5.10/natspec-format.html)).

## **[Q-4]** Unnecessary dependency (?)

On line 6, Campaign.sol has the following code:

```
import "@openzeppelin/contracts/utils/Counters.sol";
```

It seems only the private `_tokenIds` state variable uses this library, and the calls are only used for incrementing & reading the current value.

Consider: using a normal `uint256` instead, the functionnality is simple enough to not need an additional dependency.

## **[Q-5]** Unused variable

On line 19, Campaign.sol has the following code:

```
address private badgeAddress;
```

It seems this state variable is not used.

Consider: removing this state variable.

## **[Q-6]** Missing event

Consider adding an event on contributor withdraw, all other functions that move funds emit events.
