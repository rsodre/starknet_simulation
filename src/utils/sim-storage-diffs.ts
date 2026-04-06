import {
  getChecksumAddress,
  RPC,
  RpcProvider,
  type SimulateTransactionOverhead,
} from "starknet";
import { type SimulationStorageDiff } from "./sim-parser";
import { getStorageVarAddress } from "./storage-vars";

export const extractSimulationStorageDiffs = async (
  responses: SimulateTransactionOverhead[],
  provider: RpcProvider,
  caller: string,
  fetchOldValues: boolean | 'always',
) => {
  const result: SimulationStorageDiff[] = [];

  const storage_diffs = responses.reduce((acc, response) => {
    const trace = response.transaction_trace as RPC.RPCSPEC09.INVOKE_TXN_TRACE;
    // console.log(`----------- trace: `, trace);
    if (!trace) {
      return acc;
    }
    const storage_diffs = trace.state_diff?.storage_diffs;
    // console.log(`----------- storage_diffs: `, storage_diffs);
    if (!storage_diffs) {
      return acc;
    }
    return acc.concat(storage_diffs);
  }, [] as RPC.RPCSPEC09.CONTRACT_STORAGE_DIFF_ITEM[]);

  for (const diff of storage_diffs) {
    const contractAddress = getChecksumAddress(diff.address);
    // console.log(`=== Storage Diffs === Contract: ${contractAddress}`);
    for (const e of diff.storage_entries) {
      const entry: SimulationStorageDiff = {
        contractAddress,
        key: e.key,
        newValue: BigInt(e.value),
      }
      // console.log(`  key: ${key}  =>  value: ${newValue} / ${newValue.toString()}`);

      // find storage by name
      const storageName = findStorageName(entry.key, caller);
      if (storageName) {
        entry.storageName = storageName;
      }

      if (fetchOldValues == 'always' || (storageName && fetchOldValues === true)) {
        const v = await provider.getStorageAt(contractAddress, entry.key);
        entry.oldValue = BigInt(v ?? 0);
        if (entry.newValue > entry.oldValue) {
          entry.increasing = entry.newValue - entry.oldValue;
        } else if (entry.newValue < entry.oldValue) {
          entry.decreasing = entry.oldValue - entry.newValue;
        }
      }

      result.push(entry);
    }
  }
  return result;
};

const findStorageName = (key: string, caller: string): string | undefined => {
  if (BigInt(key) == BigInt(getStorageVarAddress('ERC20_balances', caller))) {
    return 'ERC20_balances';
  }
  if (BigInt(key) == BigInt(getStorageVarAddress('ERC721_balances', caller))) {
    return 'ERC721_balances';
  }
  return undefined;
}
