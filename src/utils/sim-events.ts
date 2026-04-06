import {
  getChecksumAddress,
  hash,
  num,
  RPC,
  RpcProvider,
  type SimulateTransactionOverhead,
} from "starknet";
import { isErc20Contract, isErc721Contract, isErc1155Contract } from "./contract-type";
import { type ContractType, type SimulationEvent, type SimulationResult } from "./sim-parser";


//-----------------------------------------
// extract events from simulation
//
export const extractSimulationEvents = async (
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


//-----------------------------------------
// consolitate simulation events
//

export const consolidateSimulationEvents = async (
  allEvents: SimulationEvent[],
  provider: RpcProvider,
  caller: string,
): Promise<SimulationResult[]> => {

  // get only events with known name
  const events = allEvents.filter((event) => Boolean(event.eventName));

  // get list of contracts
  const contracts = events.reduce((acc, event) => {
    if (!acc[event.contractAddress]) {
      acc[event.contractAddress] = undefined;
    }
    return acc;
  }, {} as Record<string, ContractType | undefined>);

  // get contract types
  for (const contractAddress of Object.keys(contracts)) {
    if (await isErc20Contract(provider, contractAddress)) {
      contracts[contractAddress] = 'ERC20';
      // console.log(`ERC20:`, contractAddress)
      continue;
    } else if (await isErc721Contract(provider, contractAddress)) {
      contracts[contractAddress] = 'ERC721';
      // console.log(`ERC721:`, contractAddress)
      continue;
    } else if (await isErc1155Contract(provider, contractAddress)) {
      contracts[contractAddress] = 'ERC1155';
      // console.log(`ERC1155:`, contractAddress)
      continue;
    }
  }

  // console.log(`------- contracts: `, contracts);

  const transfers: SimulationResult[] = [];
  for (const event of events) {
    const contractType = contracts[event.contractAddress];
    // console.log(`___event`, contractType, event.eventName, event.contractAddress)

    // concatenate all keys and data
    const values: bigint[] = [
      ...event.keys.slice(1), // 1st key is selector
      ...event.data,
    ].map(v => BigInt(v));

    // ERC20: Transfer
    if (event.eventName == "Transfer" && contractType == 'ERC20') {
      const [from, to, amount] = values;
      // parse from and to
      // console.log(`>>> ERC20 Transfer: `, num.toHex(from ?? 0), num.toHex(to ?? 0), amount, amount !== undefined, from === BigInt(caller), to === BigInt(caller))
      if (amount !== undefined && (from === BigInt(caller) || to === BigInt(caller))) {
        transfers.push({
          contractAddress: event.contractAddress,
          contractType,
          eventName: event.eventName,
          decreasing: from === BigInt(caller) ? amount : 0n,
          increasing: to === BigInt(caller) ? amount : 0n,
        })
      }
    }

    // ERC721: Transfer
    if (event.eventName == "Transfer" && contractType == 'ERC721') {
      const [from, to, tokenId] = values;
      // // parse from and to
      // console.log(`>>> ERC721 Transfer: `, num.toHex(from ?? 0), num.toHex(to ?? 0), tokenId, tokenId !== undefined, from === BigInt(caller), to === BigInt(caller));
      if (tokenId !== undefined && (from === BigInt(caller) || to === BigInt(caller))) {
        transfers.push({
          contractAddress: event.contractAddress,
          contractType,
          eventName: event.eventName,
          decreasing: from === BigInt(caller) ? 1n : 0n,
          increasing: to === BigInt(caller) ? 1n : 0n,
        })
      }
    }
  }
  // console.log(`------ transfers: `, transfers);

  // consolidate
  const result = transfers.reduce((acc, transfer) => {
    const existing = acc.find((r) => r.contractAddress === transfer.contractAddress);
    if (existing) {
      const sum = existing.increasing - existing.decreasing + transfer.increasing - transfer.decreasing;
      if (sum > 0n) {
        existing.increasing = sum;
        existing.decreasing = 0n;
      } else {
        existing.increasing = 0n;
        existing.decreasing = -sum;
      }
    } else {
      acc.push(transfer);
    }
    return acc;
  }, [] as SimulationResult[]);

  return result;
}

