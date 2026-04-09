import {
  RpcProvider,
  type SimulateTransactionOverhead,
} from "starknet";
import { consolidateSimulationEvents, parseSimulationEvents } from "./sim-events";
// import { extractSimulationStorageDiffs } from "./sim-storage-diffs";

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

export type ContractType = 'ERC20' | 'ERC721' | 'ERC1155';

export interface SimulationEvent {
  contractAddress: string;
  contractType: ContractType | undefined;
  entryPointSelector: string;
  keys: string[];
  data: string[];
  values: bigint[];
  // derived
  eventName?: string;
}

export interface SimulationBalance {
  contractAddress: string;
  contractType: ContractType;
  balance: bigint;
  allowance: bigint;
  approvedAll: boolean;
}

export const parseSimulationResponses = async (
  responses: SimulateTransactionOverhead[],
  provider: RpcProvider,
  caller: string,
) => {
  // @ts-ignore
  if (responses[0]?.transaction_trace?.execute_invocation?.revert_reason) {
    // @ts-ignore
    console.error(responses[0]?.transaction_trace?.execute_invocation?.revert_reason);
    return [];
  }

  // const storageDiffs = await extractSimulationStorageDiffs(responses, provider, caller, false);
  const events = await parseSimulationEvents(responses, provider, BigInt(caller));

  const result = consolidateSimulationEvents(events, BigInt(caller));

  // console.log(`---------- caller: `, caller);
  // console.log(`---------- storageDiffs: `, storageDiffs);
  // console.log(`---------- events: `, events);
  // console.log(`---------- result: `, result);

  return result;
};
