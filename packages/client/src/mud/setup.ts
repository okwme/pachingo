import { setupMUDV2Network } from "@latticexyz/std-client";
import { createFastTxExecutor, createFaucetService } from "@latticexyz/network";
import { getNetworkConfig } from "./getNetworkConfig";
import { defineContractComponents } from "./contractComponents";
import { clientComponents } from "./clientComponents";
import { world } from "./world";
import { Contract, Signer, utils } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IWorld__factory } from "../../../contracts/types/ethers-contracts/factories/IWorld__factory";
import { ethers } from "ethers";
export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  console.log('SETUPPPPP')
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();
  console.log({ networkConfig })
  const result = await setupMUDV2Network<typeof contractComponents>({
    networkConfig,
    world,
    contractComponents,
    syncThread: "main",
  });

  result.startSync();

  // Request drip from faucet
  const signer = result.network.signer.get();
  if (!networkConfig.devMode && networkConfig.faucetServiceUrl && signer) {
    const address = await signer.getAddress();
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const balance = await signer.getBalance();
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance?.lte(utils.parseEther("1"));
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");
        // Double drip
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  } else if (!networkConfig.devMode && signer && !networkConfig.faucetServiceUrl) {
    const address = await signer.getAddress();
    console.info("[Dev Faucet]: Player address -> ", address);
    const balance = await signer.getBalance();
    console.info(`[Dev Faucet]: Player balance -> ${balance}`);

    if (balance?.lte(utils.parseEther("10"))) {
      // create ethers wallet with private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
      // send ether to the player address
      const provider = new JsonRpcProvider("http://localhost:8545");
      const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
      const tx = await wallet.sendTransaction({ to: address, value: ethers.utils.parseEther("10") });
      await tx.wait();
      console.log('users wallet funded')
    }


  }

  // Create a World contract instance
  const worldContract = IWorld__factory.connect(
    networkConfig.worldAddress,
    signer ?? result.network.providers.get().json
  );

  // Create a fast tx executor
  const fastTxExecutor =
    signer?.provider instanceof JsonRpcProvider
      ? await createFastTxExecutor(
        signer as Signer & { provider: JsonRpcProvider }
      )
      : null;

  // TODO: infer this from fastTxExecute signature?
  type BoundFastTxExecuteFn<C extends Contract> = <F extends keyof C>(
    func: F,
    args: Parameters<C[F]>,
    options?: {
      retryCount?: number;
    }
  ) => Promise<ReturnType<C[F]>>;

  function bindFastTxExecute<C extends Contract>(
    contract: C
  ): BoundFastTxExecuteFn<C> {
    return async function (...args) {
      if (!fastTxExecutor) {
        throw new Error("no signer");
      }
      const { tx } = await fastTxExecutor.fastTxExecute(contract, ...args);
      return await tx;
    };
  }

  return {
    ...result,
    components: {
      ...result.components,
      ...clientComponents,
    },
    worldContract,
    worldSend: bindFastTxExecute(worldContract),
    fastTxExecutor,
  };
}
