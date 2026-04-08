import { describe, it, expect } from 'vitest';
import { Account, RpcProvider, type Call } from "starknet";
import { parseSimulationResponses, type SimulationResult } from "../utils/sim-parser.js";
import {
  CALLER,
  KATANA_RPC_URL,
  ERC20_ADDRESS,
  ERC721_ADDRESS,
  STRK_ADDRESS,
  erc20_transfers,
  erc20_approvals,
  erc20_swap_transferred,
  erc20_swap_transferred_over,
  erc20_swap_approved,
  erc20_swap_approved_over,
  erc20_swap_approved_extra_before,
  erc20_swap_approved_extra_after,
  erc721_transfers,
  erc721_approvals,
  erc721_approve_all,
  erc721_purchase_transferred,
  erc721_purchase_approved,
  erc721_purchase_approved_over,
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

describe('simulate katana erc20', () => {
  it('erc20_single_transfer', async () => {
    const result = await simulate(erc20_transfers.slice(0, 1));
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    expect(erc20Diff).toBe(-ONE_ETH);
  });

  it('erc20_multi_transfer', async () => {
    const result = await simulate(erc20_transfers);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    // 1 ETH + 10 ETH + 9 ETH = 20 ETH total sent
    expect(erc20Diff).toBe(-20n * ONE_ETH);
    expect(strkDiff).toBe(-3n * ONE_ETH);
  });

  it('erc20_single_approval', async () => {
    const result = await simulate(erc20_approvals.slice(0, 1));
    const allowance = getAllowances(result, ERC20_ADDRESS);
    expect(allowance).toBe(ONE_ETH);
  });

  it('erc20_multi_approval', async () => {
    const result = await simulate(erc20_approvals);
    const allowance = getAllowances(result, ERC20_ADDRESS);
    const strkAllowance = getAllowances(result, STRK_ADDRESS);
    // RECIPIENT1: 1 ETH overwritten by 10 ETH, RECIPIENT2: 9 ETH → total = 19 ETH
    expect(allowance).toBe(19n * ONE_ETH);
    expect(strkAllowance).toBe(3n * ONE_ETH);
  });

  it('erc20_swap_transferred', async () => {
    const result = await simulate(erc20_swap_transferred);
    // caller sends 1 ETH STRK to router, receives 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
  });

  it('erc20_swap_transferred_over', async () => {
    const result = await simulate(erc20_swap_transferred_over);
    // caller sends 3 ETH STRK to router but swaps only 1 ETH, receives 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    expect(strkDiff).toBe(-5n * ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
  });

  it('erc20_swap_approved', async () => {
    const result = await simulate(erc20_swap_approved);
    // caller approves 1 ETH STRK, router pulls it and sends 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(0n);
  });

  it('erc20_swap_approved_over', async () => {
    const result = await simulate(erc20_swap_approved_over);
    // caller approves 3 ETH STRK but router only pulls 1 ETH, sends 2 ETH ERC20 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(3n * ONE_ETH);
  });

  it('erc20_swap_approved_extra_before', async () => {
    const result = await simulate(erc20_swap_approved_extra_before);
    // approve RECIPIENT1 3 ETH, then approve+swap ROUTER 1 ETH → ROUTER allowance consumed, RECIPIENT1 remains
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(3n * ONE_ETH);
  });

  it('erc20_swap_approved_extra_after', async () => {
    const result = await simulate(erc20_swap_approved_extra_after);
    // approve+swap ROUTER 1 ETH, then approve RECIPIENT1 3 ETH → ROUTER allowance consumed, RECIPIENT1 remains
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc20Diff = getBalanceDiff(result, ERC20_ADDRESS);
    const allowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc20Diff).toBe(2n * ONE_ETH);
    expect(allowance).toBe(3n * ONE_ETH);
  });
});

describe('simulate katana erc721', () => {
  it('erc721_single_transfer', async () => {
    const result = await simulate(erc721_transfers.slice(0, 1));
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(erc721Diff).toBe(-1n);
  });

  it('erc721_multi_transfer', async () => {
    const result = await simulate(erc721_transfers);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(erc721Diff).toBe(-3n);
  });

  it('erc721_single_approval', async () => {
    const result = await simulate(erc721_approvals.slice(0, 1));
    const allowance = getAllowances(result, ERC721_ADDRESS);
    expect(allowance).toBe(1n);
  });

  it('erc721_multi_approval', async () => {
    const result = await simulate(erc721_approvals);
    const allowance = getAllowances(result, ERC721_ADDRESS);
    // 3 distinct tokenIds approved → allowance count = 3
    expect(allowance).toBe(3n);
  });

  it('erc721_approve_all', async () => {
    const result = await simulate(erc721_approve_all);
    const allowance = getAllowances(result, ERC721_ADDRESS);
    // 1 operator approved → allowance count = 1
    expect(allowance).toBe(1n);
  });
});

describe('simulate katana erc721 purchase', () => {
  it('erc721_purchase_transferred', async () => {
    const result = await simulate(erc721_purchase_transferred);
    // caller sends 1 ETH STRK to router, receives 1 ERC721 back
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc721Diff).toBe(1n);
  });

  it('erc721_purchase_approved', async () => {
    const result = await simulate(erc721_purchase_approved);
    // caller approves 1 ETH STRK, router pulls it and mints 1 ERC721
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    const strkAllowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc721Diff).toBe(1n);
    expect(strkAllowance).toBe(0n);
  });

  it('erc721_purchase_approved_over', async () => {
    const result = await simulate(erc721_purchase_approved_over);
    // caller approves 5 ETH STRK but router only pulls 1 ETH, mints 1 ERC721
    const strkDiff = getBalanceDiff(result, STRK_ADDRESS);
    const erc721Diff = getBalanceDiff(result, ERC721_ADDRESS);
    const strkAllowance = getAllowances(result, STRK_ADDRESS);
    expect(strkDiff).toBe(-ONE_ETH);
    expect(erc721Diff).toBe(1n);
    expect(strkAllowance).toBe(4n * ONE_ETH);
  });
});
