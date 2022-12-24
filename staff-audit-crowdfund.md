https://github.com/ShipyardDAO/student.vinceferro/tree/ce320747ef8749fe19cec03a9bdc30b4281ed81e/crowdfund

The following is a micro audit of git commit ce320747ef8749fe19cec03a9bdc30b4281ed81e by Gary

# General Comments

Good first project!. Your code flowed nicely and simple to follow.  Good use of the factory pattern.  No high vulnerabilities, but 
it appears you misunderstood the requirement of issuing a badge(token) for every 1 ETH contributed.  Note that you should remove your 
debugging lines (console.log) and the import "hardhat/console.sol" line before submitting code for audit.  Good luck with rest of 
course!

# Design Exercise

The question for the design exercise is "How would you design your contract to support this, without creating three separate NFT 
contracts?".   However, the solution that you described included creating separate NFT contracts to determine the proper tier. Good 
attempt, but try to think of a solution that can identify a token based on different tier level without separate NFT contracts. 

# Issues

**[M-1]** Technical mistake with regards to when NFT's get minted

The requirement of the project was to award a badge based on every 1 ETH contributed. Thus, if an address contributes .4 ETH, and 
then another .6 ETH, then the address is awarded one badge(token).  If the address subsequently contributes another 2 ETH, then 2 
additional badges(tokens) should be awarded.  Lines 87-89 in Campaign.sol, is only awarding one badge(token) even if the address is 
entitled to more.  

**[M-2]** Use of _mint instead of _safeMint

In line 135 of Campaign.sol, NFT's are minted to users with the ERC721._mint function. However, this function does not check if the 
contributor address is able to handle ERC721 tokens, which would not be the case if the msg.sender was a contract that does not 
implement the equivalent of [IERC721Receiver](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/
ERC721/IERC721Receiver.sol) interface. Consider using _safeMint instead, but then must then make sure that all functions that call 
_awardContributorBadge are non susceptible to reentrancy attacks

**[L-1]** Incorrect withdraw amount for owner withdrawal

Campaign.sol: line 102 is transfering the balance of the contract back to the owner, ignoring the amount that the sender requested in 
the request (_amount). This is unexpected behavior as an event is emitted showing that the _amount was transferred.   In addition see 
Q-1 issue below regarding the use of transfer. 

**[Q-1]** Use of transfer

At lines 102 and 115 funds are sent back to contributors or withdrawn by the founder using transfer. Although this will work it is no 
longer the recommended approach (see e.g. https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/ ) as it 
limits the gas sent with the transfer call and could in future fail due to rising gas costs.

Instead of using

        payable(someAddress).transfer(amount);
        the alternative, admittedly somewhat clumsy looking, recommendation is:

        (bool success, ) = payable(someAddress).call{value: amount}("");
        require(success, "transfer failed");

**[Q-2]** Unnecessary contract state storage - declared on line 14 in CampaignFactory.sol and line 19 of Campaign.sol

There is a cost associated with state variables. Thus, remove unused state variables. 

**[Q-3]** Unnecessary use of Counters

The use of OZ's Counters contract is not necessary. Simply use a uint and increment it

**[Q-4]** Do not need to check for 0 address

Line #66 in Campaign.sol 0 address check is unnessesary

# Nitpicks

- If you were to deploy the contracts to testnet and mainnet you would want to eventually delete the import "hardhat/console.sol"; In
  addition, it should not have any console.log statements for ship ready code. 

- No need for the onlyTerminated modifier. It is only being referenced once in the contract.  You can add the require statements 
  inside the contributorWithdraw() function

# Score

| Reason | Score |
|-|-|
| Late                       | - |
| Unfinished features        | - |
| Extra features             | - |
| Vulnerability              | 5 |
| Unanswered design exercise | - |
| Insufficient tests         | - |
| Technical mistake          | - |

Total: 5

Good job!
