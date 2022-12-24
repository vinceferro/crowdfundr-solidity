import { expect } from "chai"
import { artifacts, ethers, waffle, network } from "hardhat"
import type { Artifact } from "hardhat/types"
import { Campaign__factory } from "../../src/types/factories/Campaign__factory"
import { CampaignFactory } from "../../src/types/CampaignFactory"

export function shouldBehaveLikeCampaign(): void {
  beforeEach(async function () {
    const factoryArtifact: Artifact = await artifacts.readArtifact("CampaignFactory")
    this.factory = <CampaignFactory>await waffle.deployContract(this.signers.admin, factoryArtifact, [])
  })

  it("should allow contributor to contribute only over 0.01", async function () {
    await this.factory.connect(this.signers.campaign1).createCampaign(ethers.utils.parseEther("1"), "Campaign 1", "CMP1")
    const campaignAddress = await this.factory.campaigns(0)
    const campaign = new Campaign__factory(this.signers.contributor1).attach(campaignAddress)
    await expect(campaign.contribute({value: ethers.utils.parseEther("0.009")})).to.be.revertedWith('The contribution must be greater than 0.01 ether')
    const contributeTx = await campaign.contribute({value: ethers.utils.parseEther("0.01")})
    await expect(contributeTx).to.have.changeEtherBalances([this.signers.contributor1, campaign], [ethers.utils.parseEther("-0.01"), ethers.utils.parseEther("0.01")])
    expect(await campaign.totalRaised()).to.be.eq(ethers.utils.parseEther("0.01"))
  })

  it("should reward contributor after 1ETH for project", async function () {
    await this.factory.connect(this.signers.campaign1).createCampaign(ethers.utils.parseEther("5"), "Campaign 1", "CMP1")
    const campaignAddress = await this.factory.campaigns(0)
    const campaign = new Campaign__factory(this.signers.contributor1).attach(campaignAddress)
    await campaign.contribute({value: ethers.utils.parseEther("0.5")})
    expect(await campaign.balanceOf(this.signers.contributor1.address)).to.be.eq(0)
    await campaign.contribute({value: ethers.utils.parseEther("0.5")})
    expect(await campaign.balanceOf(this.signers.contributor1.address)).to.be.eq(1)
    await campaign.contribute({value: ethers.utils.parseEther("2")})
    expect(await campaign.balanceOf(this.signers.contributor1.address)).to.be.eq(3)

    await this.factory.connect(this.signers.campaign1).createCampaign(ethers.utils.parseEther("5"), "Campaign 2", "CMP2")
    const campaignAddress1 = await this.factory.campaigns(1)
    const campaign1 = new Campaign__factory(this.signers.contributor1).attach(campaignAddress1)
    await campaign1.contribute({value: ethers.utils.parseEther("1")})
    expect(await campaign1.balanceOf(this.signers.contributor1.address)).to.be.eq(1)
  })

  it("should not allow contributor to withdraw before project termination or if project succeeded", async function () {
    await this.factory.connect(this.signers.campaign1).createCampaign(ethers.utils.parseEther("5"), "Campaign 1", "CMP1")
    const campaignAddress = await this.factory.campaigns(0)
    const campaign = new Campaign__factory(this.signers.contributor1).attach(campaignAddress)
    await campaign.contribute({value: ethers.utils.parseEther("0.5")})
    await expect(campaign.contributorWithdraw()).to.revertedWith('The project is still running')
    await campaign.contribute({value: ethers.utils.parseEther("5")})
    await network.provider.send("evm_increaseTime", [31 * 24 * 60 * 60])
    await expect(campaign.contributorWithdraw()).to.revertedWith('The project is fully funded')
  })

  it("should allow owner to terminate before goal is reached", async function () {
    await this.factory.connect(this.signers.campaign1).createCampaign(ethers.utils.parseEther("5"), "Campaign 1", "CMP1")
    const campaignAddress = await this.factory.campaigns(0)
    const campaign = new Campaign__factory(this.signers.contributor1).attach(campaignAddress)
    await campaign.contribute({value: ethers.utils.parseEther("0.5")})
    await campaign.contribute({value: ethers.utils.parseEther("0.5")})

    await expect(campaign.terminate()).to.be.revertedWith('Only the owner can call this function')

    const oldDeadline = await campaign.deadline()
    expect(await campaign.connect(this.signers.campaign1).terminate()).to.be.ok
    const newDeadline = await campaign.deadline()
    expect(newDeadline).to.be.lt(oldDeadline)

    await expect(campaign.connect(this.signers.contributor1).contribute({value: ethers.utils.parseEther("1")})).to.be.revertedWith('The deadline has passed')
    const withdrawTx = await campaign.connect(this.signers.contributor1).contributorWithdraw()
    await expect(withdrawTx).to.have.changeEtherBalances([this.signers.contributor1, campaign], [ethers.utils.parseEther("1"), ethers.utils.parseEther("-1")])
    expect(await campaign.balanceOf(this.signers.contributor1.address)).to.be.eq(1)

    await expect(campaign.connect(this.signers.campaign1).withdraw(ethers.utils.parseEther("1"))).to.be.revertedWith('The goal has not been reached')
  })

  it("should not allow owner to terminate after goal is reached", async function () {
    await this.factory.connect(this.signers.campaign1).createCampaign(ethers.utils.parseEther("5"), "Campaign 1", "CMP1")
    const campaignAddress = await this.factory.campaigns(0)
    const campaign = new Campaign__factory(this.signers.contributor1).attach(campaignAddress)
    await campaign.contribute({value: ethers.utils.parseEther("5")})

    await expect(campaign.connect(this.signers.campaign1).terminate()).to.be.revertedWith('The goal has been reached')
  })

}
