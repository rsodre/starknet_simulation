import { describe, it, expect, beforeAll } from 'vitest';
import { Account, RpcProvider, type Call } from "starknet";
import { parseSimulationResponses, type SimulationResult } from "../utils/sim-parser.js";
import * as transactions from "../constants/transactions.js";
import * as constants from "../constants/index.js";

const provider = new RpcProvider({ nodeUrl: constants.RPC_URL_MAINNET });

const caller = constants.POPSY_ADDRESS as string;
const account = new Account({
  provider,
  address: caller,
  signer: "0x0",
});

const ONE_ETH = 1_000_000_000_000_000_000n;

const simulate = async (transactions: Call[]) => {
  const responses = await account.simulateTransaction(
    [{ type: "INVOKE", payload: transactions }],
    { skipValidate: true, tip: 1n }
  );
  return await parseSimulationResponses(responses, provider, caller);
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

describe('simulate', () => {
  it('STRK_MULTI_TRANSFER', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.STRK_MULTI_TRANSFER }],
      { skipValidate: true, tip: 1n }
    );
    const result = await parseSimulationResponses(responses, provider, caller);
    // console.log(`result: `, result);
    const strkDiff = getBalanceDiff(result, constants.STRK_TOKEN_ADDRESS);
    expect(strkDiff).toBe(-10n);
  });

  it('AVNU_SWAP_SINGLE', async () => {
    const result = await simulate(transactions.AVNU_SWAP_SINGLE);
    // console.log(`result: `, result);
    const strkDiff = getBalanceDiff(result, constants.STRK_TOKEN_ADDRESS);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBeLessThan(0n);
    expect(strkDiff).toBeGreaterThan(0n);
  });

  it('EKUBO_SWAP_SINGLE', async () => {
    const result = await simulate(transactions.EKUBO_SWAP_SINGLE);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const attackDiff = getBalanceDiff(result, constants.ATTACK_POTION_ADDRESS);
    expect(lordsDiff).toBeLessThan(0n);
    expect(attackDiff).toBeGreaterThan(0n);
  });

  it('EKUBO_SWAP_MULTIPLE', async () => {
    const result = await simulate(transactions.EKUBO_SWAP_MULTIPLE);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const attackDiff = getBalanceDiff(result, constants.ATTACK_POTION_ADDRESS);
    const reviveDiff = getBalanceDiff(result, constants.REVIVE_POTION_ADDRESS);
    const lifeDiff = getBalanceDiff(result, constants.EXTRA_LIFE_POTION_ADDRESS);
    expect(lordsDiff).toBeLessThan(0n);
    expect(attackDiff).toBeGreaterThan(0n);
    expect(reviveDiff).toBeGreaterThan(0n);
    expect(lifeDiff).toBeGreaterThan(0n);
  });

  it('EKUBO_SWAP_SUM', async () => {
    const result_single = await simulate(transactions.EKUBO_SWAP_SINGLE);
    const lordsDiffSingle = getBalanceDiff(result_single, constants.LORDS_TOKEN_ADDRESS) ?? 0n;

    const result_multiple = await simulate(transactions.EKUBO_SWAP_MULTIPLE);
    const lordsDiffMultiple = getBalanceDiff(result_multiple, constants.LORDS_TOKEN_ADDRESS) ?? 0n;

    expect(lordsDiffSingle).not.toBe(0n);
    expect(lordsDiffMultiple).not.toBe(0n);
    expect(lordsDiffMultiple).toBeLessThan(lordsDiffSingle);
  });

  it('LS2_PURCHASE_GAME', async () => {
    const result = await simulate(transactions.LS2_PURCHASE_GAME);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const ticketDiff = getBalanceDiff(result, constants.DUNGEON_TICKET_ADDRESS);
    const gameDiff = getBalanceDiff(result, constants.LS_GAME_ADDRESS);
    expect(lordsDiff).toBeLessThan(-ONE_ETH);
    expect(ticketDiff).toBe(undefined);
    expect(gameDiff).toBe(1n);
  });

  it('LS2_PURCHASE_GAME_ERROR', async () => {
    const result = await simulate(transactions.LS2_PURCHASE_GAME_ERROR);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const ticketDiff = getBalanceDiff(result, constants.DUNGEON_TICKET_ADDRESS);
    const gameDiff = getBalanceDiff(result, constants.LS_GAME_ADDRESS);
    expect(lordsDiff).toBe(undefined);
    expect(ticketDiff).toBe(undefined);
    expect(gameDiff).toBe(undefined);
  });

  it('PISTOLS_PURCHASE_PACK', async () => {
    const result = await simulate(transactions.PISTOLS_PURCHASE_PACK);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const packDiff = getBalanceDiff(result, constants.PISTOLS_PACK_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(packDiff).toBe(1n);
    expect(allowance).toBe(0n);
  });

  it('PISTOLS_OVER_ALLOWANCE', async () => {
    const result = await simulate(transactions.PISTOLS_OVER_ALLOWANCE);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const packDiff = getBalanceDiff(result, constants.PISTOLS_PACK_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(packDiff).toBe(1n);
    expect(allowance).toBeGreaterThan(0n);
  });

  it('PISTOLS_EXTRA_ALLOWANCE_BEFORE', async () => {
    const result = await simulate(transactions.PISTOLS_EXTRA_ALLOWANCE_BEFORE);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(allowance).toBeGreaterThan(0n);
  });

  it('PISTOLS_EXTRA_ALLOWANCE_AFTER', async () => {
    const result = await simulate(transactions.PISTOLS_EXTRA_ALLOWANCE_AFTER);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const packDiff = getBalanceDiff(result, constants.PISTOLS_PACK_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(packDiff).toBe(1n);
    expect(allowance).toBeGreaterThan(0n);
  });

  it('PISTOLS_ERC721_TRANSFER', async () => {
    const result = await simulate(transactions.PISTOLS_ERC721_TRANSFER);
    // console.log(`result: `, result);
    const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
    expect(duelistDiff).toBe(-2n);
  });

  it('PISTOLS_ERC721_APPROVE', async () => {
    const result = await simulate(transactions.PISTOLS_ERC721_APPROVE);
    // console.log(`result: `, result);
    const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
    const allowance = getAllowances(result, constants.PISTOLS_DUELIST_ADDRESS);
    expect(duelistDiff).toBe(0n);
    expect(allowance).toBe(3n);
  });

  it('PISTOLS_ERC721_APPROVE_ALL', async () => {
    const result = await simulate(transactions.PISTOLS_ERC721_APPROVE_ALL);
    // console.log(`result: `, result);
    const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
    const allowance = getAllowances(result, constants.PISTOLS_DUELIST_ADDRESS);
    expect(duelistDiff).toBe(0n);
    expect(allowance).toBe(1n);
  });

  // it('PISTOLS_ERC721_APPROVE_TRANSFER', async () => {
  //   const result = await simulate(transactions.PISTOLS_ERC721_APPROVE_TRANSFER);
  //   // console.log(`result: `, result);
  //   const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
  //   const allowance = getAllowances(result, constants.PISTOLS_DUELIST_ADDRESS);
  //   expect(duelistDiff).toBe(-1n);
  //   expect(allowance).toBe(0n);
  // });
});
