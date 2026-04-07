import {
  RpcProvider,
  type SimulateTransactionOverhead,
} from "starknet";
import {
  extractSimulationStorageDiffs,
} from "./sim-storage-diffs";
import { consolidateSimulationEvents, extractSimulationEvents } from "./sim-events";

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
}

export type ContractType = 'ERC20' | 'ERC721' | 'ERC1155';
export interface SimulationResult {
  contractAddress: string;
  contractType: ContractType;
  eventName: string;
  increasing: bigint;
  decreasing: bigint;
  allowances: Record<string, bigint>;
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
  const events = await extractSimulationEvents(responses, provider, caller);

  const result = await consolidateSimulationEvents(events, provider, caller);

  // console.log(`---------- caller: `, caller);
  // console.log(`---------- storageDiffs: `, storageDiffs);
  // console.log(`---------- events: `, events);
  // console.log(`---------- result: `, result);

  return result;
};
