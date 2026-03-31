import {
  getChecksumAddress,
  hash,
  num,
  RPC,
  RpcProvider,
  type SimulateTransactionOverhead,
} from "starknet";
import { type SimulationEvent } from "./sim-parser";

export const parseEvents = async (
  responses: SimulateTransactionOverhead[],
  provider: RpcProvider,
  caller: string,
) => {
  const result: SimulationEvent[] = [];

  const calls = responses.reduce((acc, response) => {
    const trace = response.transaction_trace as RPC.RPCSPEC09.INVOKE_TXN_TRACE;
    // console.log(`----------- trace: `, trace);
    if (!trace) {
      return acc;
    }
    const calls = trace.execute_invocation.calls as RPC.RPCSPEC09.FUNCTION_INVOCATION[];

    const _concatCalls = (acc: RPC.RPCSPEC09.FUNCTION_INVOCATION[], calls: RPC.RPCSPEC09.FUNCTION_INVOCATION[] | undefined) => {
      if (calls) {
        calls.forEach((call) => {
          acc.push(call);
          _concatCalls(acc, call.calls);
        });
      }
      return acc;
    }
    return _concatCalls(acc, calls);
  }, [] as RPC.RPCSPEC09.FUNCTION_INVOCATION[]);

  for (const call of calls) {
    const contractAddress: string = getChecksumAddress(call.contract_address);
    const entryPointSelector: string = call.entry_point_selector;
    const events: RPC.RPCSPEC09.ORDERED_EVENT[] = call.events;

    for (const e of events) {
      const entry: SimulationEvent = {
        contractAddress,
        entryPointSelector,
        keys: [...e.keys],
        data: [...e.data],
      }

      // find storage by name
      const eventName = findEventName(entry.keys[0] ?? "");
      if (eventName) {
        entry.eventName = eventName;
      }

      // if (storageName || fetchOld) {
      //   const v = await provider.getStorageAt(contractAddress, entry.key);
      //   entry.oldValue = BigInt(v ?? 0);
      //   if (entry.newValue > entry.oldValue) {
      //     entry.increasing = entry.newValue - entry.oldValue;
      //   } else if (entry.newValue < entry.oldValue) {
      //     entry.decreasing = entry.oldValue - entry.newValue;
      //   }
      // }

      result.push(entry);
    }
  }
  return result;
};

const eventNames = [
  //
  // ERC-20
  // https://github.com/OpenZeppelin/cairo-contracts/blob/release-v1.0.0/packages/token/src/erc20/erc20.cairo
  "Transfer",
  "Approval",
  //
  // ERC-721
  // https://github.com/OpenZeppelin/cairo-contracts/blob/release-v1.0.0/packages/token/src/erc721/erc721.cairo
  "Transfer",
  "Approval",
  "ApprovalForAll",
  //
  // ERC-1155
  // https://github.com/OpenZeppelin/cairo-contracts/blob/release-v1.0.0/packages/token/src/erc1155/erc1155.cairo
  "TransferSingle",
  "TransferBatch",
  "ApprovalForAll",
]

const findEventName = (key: string): string | undefined => {
  for (const eventName of eventNames) {
    if (BigInt(key) == BigInt(num.toHex(hash.starknetKeccak(eventName)))) {
      return eventName;
    }
  }
  return undefined;
}
