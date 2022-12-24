import { expect } from "chai"
import { ethers } from "hardhat"
import { Campaign__factory } from "../../src/types/factories/Campaign__factory"

export function shouldBehaveLikeCampaignFactory(): void {
    it("should allow for campaign creation", async function () {
        expect(await this.factory.connect(this.signers.campaign1).createCampaign(ethers.utils.parseEther("1"), "Campaign 1", "CMP1")).to.be.ok
        const campaingFactory = new Campaign__factory(this.signers.admin)
        const address = await this.factory.campaigns(0)
        const campaign = campaingFactory.attach(address)
        expect(await campaign.owner()).to.be.eq(this.signers.campaign1.address)
        expect(await campaign.goal()).to.be.eq(ethers.utils.parseEther("1"))
        expect(await campaign.totalRaised()).to.be.eq(ethers.utils.parseEther("0"))
      })
}
