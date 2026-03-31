import {
  RpcProvider,
  type SimulateTransactionOverhead,
} from "starknet";
import {
  parseStorageDiffs,
  isErc20Contract,
  isErc721Contract,
  isErc1155Contract,
} from "./sim-storage-diffs";
import { parseEvents } from "./sim-events";

export interface SimulationStorageDiff {
  contractAddress: string;
  key: string;
  newValue: bigint;
  // derived
  oldValue?: bigint | undefined;
  increasing?: bigint | undefined;
  decreasing?: bigint | undefined;
  storageName?: string | undefined;
}

export interface SimulationEvent {
  contractAddress: string;
  entryPointSelector: string;
  keys: string[];
  data: string[];
  // derived
  eventName?: string;
  increasing?: bigint | undefined;
  decreasing?: bigint | undefined;
}

type ContractType = 'ERC20' | 'ERC721' | 'ERC1155';
export interface SimulationContract {
  contractAddress: string;
  type: ContractType | undefined;
}

export const parseSimulationResponses = async (
  responses: SimulateTransactionOverhead[],
  provider: RpcProvider,
  caller: string,
) => {
  const storageDiffs = await parseStorageDiffs(responses, provider, caller, false);
  const events = await parseEvents(responses, provider, caller);

  const contracts: SimulationContract[] = events.map((event) => {
    return {
      contractAddress: event.contractAddress,
      type: undefined,
    };
  });

  for (const event of events) {
    console.log(`___event`, event.eventName, event.contractAddress)
    if (
      event.eventName == "Transfer" &&
      event.keys.length == 3 &&
      event.data.length == 2 &&
      await checkContractType(provider, contracts, event.contractAddress, 'ERC20')
    ) {
      // Lords ERC20 (1+2 keys, 2 data)
      const from = BigInt(event.keys[1] ?? 0);
      const to = BigInt(event.keys[2] ?? 0);
      const amount = BigInt(event.data[0] ?? 0);
      if (from == BigInt(caller)) {
        event.decreasing = amount;
      } else if (to == BigInt(caller)) {
        event.increasing = amount;
      }
    } else if (
      event.eventName == "Transfer" &&
      event.keys.length == 1 &&
      event.data.length == 4 &&
      await checkContractType(provider, contracts, event.contractAddress, 'ERC20')
    ) {
      // OpenZeppelin ERC20 (1+0 keys, 4 data)
      const from = BigInt(event.data[0] ?? 0);
      const to = BigInt(event.data[1] ?? 0);
      const amount = BigInt(event.data[2] ?? 0);
      if (from == BigInt(caller)) {
        event.decreasing = amount;
      } else if (to == BigInt(caller)) {
        event.increasing = amount;
      }
    } else if (
      event.eventName == "Transfer" &&
      event.keys.length == 3 &&
      event.data.length == 2 &&
      await checkContractType(provider, contracts, event.contractAddress, 'ERC721')
    ) {
      // OpenZeppelin ERC721 (1+2 keys, 2 data)
      const from = BigInt(event.keys[1] ?? 0);
      const to = BigInt(event.keys[2] ?? 0);
      if (from == BigInt(caller)) {
        event.decreasing = 1n;
      } else if (to == BigInt(caller)) {
        event.increasing = 1n;
      }
    } else if (
      event.eventName == "Transfer" &&
      event.keys.length == 1 &&
      event.data.length == 4 &&
      await checkContractType(provider, contracts, event.contractAddress, 'ERC721')
    ) {
      // ??? ERC721 (1+0 keys, 4 data)
      const from = BigInt(event.data[0] ?? 0);
      const to = BigInt(event.data[1] ?? 0);
      if (from == BigInt(caller)) {
        event.decreasing = 1n;
      } else if (to == BigInt(caller)) {
        event.increasing = 1n;
      }
    }
  }

  console.log(`---------- storageDiffs: `, storageDiffs);
  console.log(`---------- events: `, events);
  console.log(`---------- contracts: `, contracts);

  events.forEach((event) => {
    if (event.increasing) {
      console.log(`+++ ${event.eventName} ${event.contractAddress} +${event.increasing}`);
    }
    if (event.decreasing) {
      console.log(`--- ${event.eventName} ${event.contractAddress} -${event.decreasing}`);
    }
  });

};

const checkContractType = async (provider: RpcProvider, contracts: SimulationContract[], contractAddress: string, type: ContractType): Promise<boolean> => {
  for (let i = 0; i < contracts.length; i++) {
    if (contracts[i]!.contractAddress == contractAddress) {
      if (contracts[i]!.type === type) {
        return true;
      }
      if (contracts[i]!.type !== undefined) {
        return false;
      }
      if (type == 'ERC20' && await isErc20Contract(provider, contractAddress)) {
        contracts[i]!.type = type;
        console.log(`ERC20:`, contractAddress)
        return true;
      }
      if (type == 'ERC721' && await isErc721Contract(provider, contractAddress)) {
        contracts[i]!.type = type;
        return true;
      }
      if (type == 'ERC1155' && await isErc1155Contract(provider, contractAddress)) {
        contracts[i]!.type = type;
        return true;
      }
      return false;
    }
  }
  return false;
}