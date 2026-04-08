import { describe, it, expect } from 'vitest';
import { Account, RpcProvider, type Call } from "starknet";
import { parseSimulationResponses, type SimulationResult } from "../utils/sim-parser.js";
import {
  CALLER,
  KATANA_RPC_URL,
  ERC20_ADDRESS,
  ERC721_ADDRESS,
  erc20_transfers,
  erc20_approvals,
  erc721_transfers,
  erc721_approvals,
  erc721_approve_all,
  ONE_ETH,
} from "./katana_transactions.js";

const provider = new RpcProvider({ nodeUrl: KATANA_RPC_URL });

const account = new Account({
  provider,
  address: CALLER,
  signer: "0x0",
});

const simulate = async (transactions: Call[]) => {
  const responses = await account.simulateTransaction(
    [{ type: "INVOKE", payload: transactions }],
    { skipValidate: true, tip: 1n }
  );
  return await parseSimulationResponses(responses, provider, CALLER);
}

const getBalanceDiff = (result: SimulationResult[], contractAddress: string): bigint | undefined => {
  const c = result.find((r) => BigInt(r.contractAddress) === BigInt(contractAddress));
  if (!c) return undefined;
  return c.balance;
}

const getAllowances = (result: SimulationResult[], contractAddress: string): bigint | undefined => {
  const c = result.find((r) => BigInt(r.contractAddress) === BigInt(contractAddress));
  if (!c) return undefined;
  return c.allowance;
}

describe('simulate katana', () => {
  it('erc20_single_transfer', async () => {
    const result = await simulate(erc20_transfers.slice(0, 1));
    // console.log(`result: `, result);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    expect(erc20Diff).toBe(-ONE_ETH);
  });

  it('erc20_multi_transfer', async () => {
    const result = await simulate(erc20_transfers);
    // console.log(`result: `, result);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    // 1 ETH + 10 ETH + 9 ETH = 20 ETH total sent
    expect(erc20Diff).toBe(-20n * ONE_ETH);
  });

  it('erc20_single_approval', async () => {
    const result = await simulate(erc20_approvals.slice(0, 1));
    // console.log(`result: `, result);
    const allowance = getAllowances(result, ERC20_ADDRESS);
    expect(allowance).toBe(ONE_ETH);
  });

  it('erc20_multi_approval', async () => {
    const result = await simulate(erc20_approvals);
    // console.log(`result: `, result);
    const allowance = getAllowances(result, ERC20_ADDRESS);
    // RECIPIENT1: 1 ETH overwritten by 10 ETH, RECIPIENT2: 9 ETH → total = 19 ETH
    expect(allowance).toBe(19n * ONE_ETH);
  });

  it('erc721_single_transfer', async () => {
    const result = await simulate(erc721_transfers.slice(0, 1));
    // console.log(`result: `, result);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(erc721Diff).toBe(-1n);
  });

  it('erc721_multi_transfer', async () => {
    const result = await simulate(erc721_transfers);
    // console.log(`result: `, result);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(erc721Diff).toBe(-3n);
  });

  it('erc721_single_approval', async () => {
    const result = await simulate(erc721_approvals.slice(0, 1));
    // console.log(`result: `, result);
    const allowance = getAllowances(result, ERC721_ADDRESS);
    expect(allowance).toBe(1n);
  });

  it('erc721_multi_approval', async () => {
    const result = await simulate(erc721_approvals);
    // console.log(`result: `, result);
    const allowance = getAllowances(result, ERC721_ADDRESS);
    // 3 distinct tokenIds approved → allowance count = 3
    expect(allowance).toBe(3n);
  });

  it('erc721_approve_all', async () => {
    const result = await simulate(erc721_approve_all);
    // console.log(`result: `, result);
    const allowance = getAllowances(result, ERC721_ADDRESS);
    // 1 operator approved → allowance count = 1
    expect(allowance).toBe(1n);
  });
});
