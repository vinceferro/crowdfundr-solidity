import { artifacts, ethers, waffle } from "hardhat"
import type { Artifact } from "hardhat/types"
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"

import { Signers } from "../types"
import { shouldBehaveLikeCampaign } from "./Campaign.behavior"
import { CampaignFactory } from "../../src/types/CampaignFactory"

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers

    const signers: SignerWithAddress[] = await ethers.getSigners()
    this.signers = {
      admin: signers[0],
      campaign1: signers[1],
      campaign2: signers[2],
      contributor1: signers[3],
      contributor2: signers[4],
    }

    const factoryArtifact: Artifact = await artifacts.readArtifact("CampaignFactory")
    this.factory = <CampaignFactory>await waffle.deployContract(this.signers.admin, factoryArtifact, [])
  })

  describe("Campaign", function () {
    shouldBehaveLikeCampaign()
  })
})
