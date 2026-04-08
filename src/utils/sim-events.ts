import {
  getChecksumAddress,
  hash,
  num,
  uint256,
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
        values: [
          ...e.keys.slice(1), // 1st key is selector
          ...e.data,
        ].map(v => BigInt(v)),
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
  "Transfer", // ok
  "Approval", // ok
  //
  // ERC-721
  // https://github.com/OpenZeppelin/cairo-contracts/blob/release-v1.0.0/packages/token/src/erc721/erc721.cairo
  "Transfer", // ok
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
  events: SimulationEvent[],
  provider: RpcProvider,
  caller: string,
): Promise<SimulationResult[]> => {

  // get list of contracts (known events only)
  const contracts = events
    .filter((event) => Boolean(event.eventName))
    .reduce((acc, event) => {
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

  //--------------------------
  // ERC20
  //
  const erc20Events: {
    contractAddress: string;
    balance: bigint;
    allowances: Record<string, bigint>;
  }[] = [];
  for (const event of events) {
    if (contracts[event.contractAddress] !== 'ERC20') continue;
    // console.log(`___event`, contractType, event.eventName, event.contractAddress)

    let erc20Event = erc20Events.find((e) => e.contractAddress === event.contractAddress);
    if (!erc20Event) {
      erc20Event = {
        contractAddress: event.contractAddress,
        balance: 0n,
        allowances: {},
      };
      erc20Events.push(erc20Event);
    }

    if (event.eventName == "Transfer") {
      const [from, to, amount_low, amount_high] = event.values;
      const amount = uint256.uint256ToBN({ low: amount_low ?? 0, high: amount_high ?? 0 });
      // console.log(`>>> ERC20 Transfer: `, num.toHex(from ?? 0), num.toHex(to ?? 0), amount, amount !== undefined, from === BigInt(caller), to === BigInt(caller))
      if (from === BigInt(caller) || to === BigInt(caller)) {
        erc20Event.balance += 
          from === BigInt(caller) ? -amount
          : to === BigInt(caller) ? amount
          : 0n;
      }
    } else if (event.eventName == "Approval") {
      const [owner, spender, amount_low, amount_high] = event.values;
      const amount = uint256.uint256ToBN({ low: amount_low ?? 0, high: amount_high ?? 0 });
      // console.log(`>>> ERC20 Transfer: `, num.toHex(from ?? 0), num.toHex(to ?? 0), amount, amount !== undefined, from === BigInt(caller), to === BigInt(caller))
      if (owner === BigInt(caller)) {
        // approval always have the updated allowance, we must overwrite it
        erc20Event.allowances[num.toHex(spender ?? 0)] = amount;
      }
    }
  }

  //--------------------------
  // ERC721
  //
  const erc721Events: {
    contractAddress: string;
    balance: bigint;
    approved: bigint[]; // tokenIds
    operators: string[]; // accounts
  }[] = [];
  for (const event of events) {
    if (contracts[event.contractAddress] !== 'ERC721') continue;
    // console.log(`___event`, contractType, event.eventName, event.contractAddress)

    let erc721Event = erc721Events.find((e) => e.contractAddress === event.contractAddress);
    if (!erc721Event) {
      erc721Event = {
        contractAddress: event.contractAddress,
        balance: 0n,
        approved: [],
        operators: [],
      };
      erc721Events.push(erc721Event);
    }

    if (event.eventName == "Transfer") {
      const [from, to, id_low, id_high] = event.values;
      const tokenId = uint256.uint256ToBN({ low: id_low ?? 0, high: id_high ?? 0 });
      // console.log(`>>> ERC721 Transfer: `, num.toHex(from ?? 0), num.toHex(to ?? 0), tokenId, tokenId !== undefined, from === BigInt(caller), to === BigInt(caller));
      if (from === BigInt(caller) || to === BigInt(caller)) {
        erc721Event.balance +=
          from === BigInt(caller) ? -1n
            : to === BigInt(caller) ? 1n
              : 0n;
        // reset approval, if any
        erc721Event.approved = erc721Event.approved.filter((t) => t !== tokenId);
      }
    } else if (event.eventName == "Approval") {
      const [owner, approved, id_low, id_high] = event.values;
      const tokenId = uint256.uint256ToBN({ low: id_low ?? 0, high: id_high ?? 0 });
      if (owner === BigInt(caller) && approved !== undefined) {
        if (!erc721Event.approved.includes(tokenId)) {
          erc721Event.approved.push(tokenId);
        }
      }
    } else if (event.eventName == "ApprovalForAll") {
      const [owner, operator, approved] = event.values;
      if (owner === BigInt(caller) && operator !== undefined && approved !== undefined) {
        const op = num.toHex(operator);
        if (!approved) {
          erc721Event.operators = erc721Event.operators.filter((o) => o !== op);
        } else if (!erc721Event.operators.includes(op)) {
          erc721Event.operators.push(op);
        }
      }
    }
  }

  //--------------------------
  // ERC1155
  //
  const erc1155Events: {
    contractAddress: string;
    balance: bigint;
    approved: bigint[]; // tokenIds
    operators: string[]; // accounts
  }[] = [];
  for (const event of events) {
    if (contracts[event.contractAddress] !== 'ERC1155') continue;
    // console.log(`___event`, contractType, event.eventName, event.contractAddress)

    let erc1155Event = erc1155Events.find((e) => e.contractAddress === event.contractAddress);
    if (!erc1155Event) {
      erc1155Event = {
        contractAddress: event.contractAddress,
        balance: 0n,
        approved: [],
        operators: [],
      };
      erc1155Events.push(erc1155Event);
    }

    if (event.eventName == "TransferSingle") {
      const [_operator, from, to, id_low, id_high, value_low, value_high] = event.values;
      const id = uint256.uint256ToBN({ low: id_low ?? 0, high: id_high ?? 0 });
      const value = uint256.uint256ToBN({ low: value_low ?? 0, high: value_high ?? 0 });
      if (value !== undefined && id !== undefined && (from === BigInt(caller) || to === BigInt(caller))) {
        erc1155Event.balance += from === BigInt(caller) ? -value : value;
        if (from === BigInt(caller)) {
          let count = value;
          erc1155Event.approved = erc1155Event.approved.filter((t) => {
            if (count > 0n && t === id) { count--; return false; }
            return true;
          });
        } else {
          for (let i = 0n; i < value; i++) {
            erc1155Event.approved.push(id);
          }
        }
      }
    } else if (event.eventName == "TransferBatch") {
      // values: [operator, from, to, ids_len, id0_low, id0_high, ..., values_len, val0_low, val0_high, ...]
      // ids and values are u256 (2 felts each)
      const [_operator, from, to, idsLen, ...rest] = event.values;
      if (idsLen !== undefined && (from === BigInt(caller) || to === BigInt(caller))) {
        const n = Number(idsLen);
        const ids: bigint[] = [];
        for (let i = 0; i < n; i++) {
          ids.push(uint256.uint256ToBN({ low: rest[i * 2] ?? 0n, high: rest[i * 2 + 1] ?? 0n }));
        }
        const valuesOffset = n * 2; // index of values_len
        const valuesLen = Number(rest[valuesOffset] ?? 0n);
        const amounts: bigint[] = [];
        for (let i = 0; i < valuesLen; i++) {
          amounts.push(uint256.uint256ToBN({ low: rest[valuesOffset + 1 + i * 2] ?? 0n, high: rest[valuesOffset + 2 + i * 2] ?? 0n }));
        }
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i]!;
          const amount = amounts[i] ?? 0n;
          erc1155Event.balance += from === BigInt(caller) ? -amount : amount;
          if (from === BigInt(caller)) {
            let count = amount;
            erc1155Event.approved = erc1155Event.approved.filter((t) => {
              if (count > 0n && t === id) { count--; return false; }
              return true;
            });
          } else {
            for (let j = 0n; j < amount; j++) {
              erc1155Event.approved.push(id);
            }
          }
        }
      }
    } else if (event.eventName == "ApprovalForAll") {
      // values: [owner, operator, approved]
      const [owner, operator, approved] = event.values;
      if (owner === BigInt(caller) && operator !== undefined && approved !== undefined) {
        const op = num.toHex(operator);
        if (!approved) {
          erc1155Event.operators = erc1155Event.operators.filter((o) => o !== op);
        } else if (!erc1155Event.operators.includes(op)) {
          erc1155Event.operators.push(op);
        }
      }
    }
  }

  // console.log(`------ events:`, events.length, events);
  // console.log(`------- erc20Events:`, erc20Events.length, erc20Events);
  // console.log(`------- erc721Events:`, erc721Events.length, erc721Events);
  // console.log(`------- erc1155Events:`, erc1155Events.length, erc1155Events);

  // consolidate
  let result: SimulationResult[] = [];

  result = result.concat(erc20Events.map((e) => ({
    contractAddress: e.contractAddress,
    contractType: 'ERC20',
    balance: e.balance,
    allowance: Object.values(e.allowances).reduce((acc, v) => acc + v, 0n),
  })));

  result = result.concat(erc721Events.map((e) => ({
    contractAddress: e.contractAddress,
    contractType: 'ERC721',
    balance: e.balance,
    allowance: BigInt(e.approved.length) + BigInt(e.operators.length),
  })));

  result = result.concat(erc1155Events.map((e) => ({
    contractAddress: e.contractAddress,
    contractType: 'ERC1155',
    balance: e.balance,
    allowance: BigInt(e.approved.length) + BigInt(e.operators.length),
  })));

  // cleanup used
  result = result.filter((r) => (r.balance != 0n || r.allowance != 0n));

  // console.log(`------- result:`, result.length, result);

  return result;
}

