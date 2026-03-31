// from:
// https://github.com/snapshot-labs/sx-monorepo/blob/95e332bfde5afe530cf1a337832d61de6337fb60/packages/sx.js/src/utils/encoding/storage-vars.ts
// 

import { ec, hash } from 'starknet';

const MAX_STORAGE_ITEM_SIZE = 256n;
const ADDR_BOUND = 2n ** 251n - MAX_STORAGE_ITEM_SIZE;

/**
 * Returns the storage address of a Starknet storage variable given its name and arguments.
 * https://github.com/starkware-libs/cairo-lang/blob/d61255f32a7011e9014e1204471103c719cfd5cb/src/starkware/starknet/public/abi.py#L60-L70
 * @param varName storage_var name
 * @param args additional arguments
 */
export function getStorageVarAddress(varName: string, ...args: string[]) {
  let res = hash.starknetKeccak(varName);
  for (const arg of args) {
    const prefixedArg = `0x${arg.replace('0x', '')}`;
    const computedHash = ec.starkCurve.pedersen(res, prefixedArg);
    res = BigInt(computedHash);
  }
  return (res % ADDR_BOUND).toString();
}
