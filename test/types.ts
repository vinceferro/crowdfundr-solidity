import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

import type { CampaignFactory } from "../src/types/CampaignFactory";

declare module "mocha" {
  export interface Context {
    factory: CampaignFactory;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  campaign1: SignerWithAddress;
  campaign2: SignerWithAddress;
  contributor1: SignerWithAddress;
  contributor2: SignerWithAddress;
}
