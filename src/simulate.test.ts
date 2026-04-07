import { describe, it, expect, beforeAll } from 'vitest';
import { Account, RpcProvider } from "starknet";
import { parseSimulationResponses, type SimulationResult } from "./utils/sim-parser.js";
import * as transactions from "./constants/transactions.js";
import * as constants from "./constants/index.js";

const provider = new RpcProvider({ nodeUrl: constants.RPC_URL });

const accountAddress = constants.POPSY_ADDRESS as string;
const privateKey = '0x0';
const account = new Account({
  provider,
  address: accountAddress,
  signer: privateKey,
});

const ONE_ETH = 1_000_000_000_000_000_000n;

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
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const strkDiff = getBalanceDiff(result, constants.STRK_TOKEN_ADDRESS);
    expect(strkDiff).toBe(-10n);
  });

  it('AVNU_SWAP_SINGLE', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.AVNU_SWAP_SINGLE }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const strkDiff = getBalanceDiff(result, constants.STRK_TOKEN_ADDRESS);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBeLessThan(0n);
    expect(strkDiff).toBeGreaterThan(0n);
  });

  it('EKUBO_SWAP_SINGLE', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.EKUBO_SWAP_SINGLE }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const attackDiff = getBalanceDiff(result, constants.ATTACK_POTION_ADDRESS);
    expect(lordsDiff).toBeLessThan(0n);
    expect(attackDiff).toBeGreaterThan(0n);
  });

  it('EKUBO_SWAP_MULTIPLE', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.EKUBO_SWAP_MULTIPLE }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
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
    const responses_single = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.EKUBO_SWAP_SINGLE }],
      { skipValidate: true }
    );
    const result_single = await parseSimulationResponses(responses_single, provider, accountAddress);
    const lordsDiffSingle = getBalanceDiff(result_single, constants.LORDS_TOKEN_ADDRESS) ?? 0n;

    const responses_multiple = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.EKUBO_SWAP_MULTIPLE }],
      { skipValidate: true }
    );
    const result_multiple = await parseSimulationResponses(responses_multiple, provider, accountAddress);
    const lordsDiffMultiple = getBalanceDiff(result_multiple, constants.LORDS_TOKEN_ADDRESS) ?? 0n;

    expect(lordsDiffSingle).not.toBe(0n);
    expect(lordsDiffMultiple).not.toBe(0n);
    expect(lordsDiffMultiple).toBeLessThan(lordsDiffSingle);
  });

  it('LS2_PURCHASE_GAME', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.LS2_PURCHASE_GAME }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const ticketDiff = getBalanceDiff(result, constants.DUNGEON_TICKET_ADDRESS);
    const gameDiff = getBalanceDiff(result, constants.LS_GAME_ADDRESS);
    expect(lordsDiff).toBeLessThan(-ONE_ETH);
    expect(ticketDiff).toBe(undefined);
    expect(gameDiff).toBe(1n);
  });

  it('LS2_PURCHASE_GAME_ERROR', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.LS2_PURCHASE_GAME_ERROR }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const ticketDiff = getBalanceDiff(result, constants.DUNGEON_TICKET_ADDRESS);
    const gameDiff = getBalanceDiff(result, constants.LS_GAME_ADDRESS);
    expect(lordsDiff).toBe(undefined);
    expect(ticketDiff).toBe(undefined);
    expect(gameDiff).toBe(undefined);
  });

  it('PISTOLS_PURCHASE_PACK', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.PISTOLS_PURCHASE_PACK }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const packDiff = getBalanceDiff(result, constants.PISTOLS_PACK_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(packDiff).toBe(1n);
    expect(allowance).toBe(0n);
  });

  it('PISTOLS_OVER_ALLOWANCE', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.PISTOLS_OVER_ALLOWANCE }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const packDiff = getBalanceDiff(result, constants.PISTOLS_PACK_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(packDiff).toBe(1n);
    expect(allowance).toBeGreaterThan(0n);
  });

  it('PISTOLS_EXTRA_ALLOWANCE_BEFORE', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.PISTOLS_EXTRA_ALLOWANCE_BEFORE }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(allowance).toBeGreaterThan(0n);
  });

  it('PISTOLS_EXTRA_ALLOWANCE_AFTER', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.PISTOLS_EXTRA_ALLOWANCE_AFTER }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getBalanceDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const packDiff = getBalanceDiff(result, constants.PISTOLS_PACK_ADDRESS);
    const allowance = getAllowances(result, constants.LORDS_TOKEN_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(packDiff).toBe(1n);
    expect(allowance).toBeGreaterThan(0n);
  });

  it('PISTOLS_ERC721_TRANSFER', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.PISTOLS_ERC721_TRANSFER }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
    expect(duelistDiff).toBe(-2n);
  });

  it('PISTOLS_ERC721_APPROVE', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.PISTOLS_ERC721_APPROVE }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
    const allowance = getAllowances(result, constants.PISTOLS_DUELIST_ADDRESS);
    expect(duelistDiff).toBe(0n);
    expect(allowance).toBe(3n);
  });

  it('PISTOLS_ERC721_APPROVE_ALL', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.PISTOLS_ERC721_APPROVE_ALL }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
    const allowance = getAllowances(result, constants.PISTOLS_DUELIST_ADDRESS);
    expect(duelistDiff).toBe(0n);
    expect(allowance).toBe(1n);
  });

  // it('PISTOLS_ERC721_APPROVE_TRANSFER', async () => {
  //   const responses = await account.simulateTransaction(
  //     [{ type: "INVOKE", payload: transactions.PISTOLS_ERC721_APPROVE_TRANSFER }],
  //     { skipValidate: true }
  //   );
  //   const result = await parseSimulationResponses(responses, provider, accountAddress);
  //   // console.log(`result: `, result);
  //   const duelistDiff = getBalanceDiff(result, constants.PISTOLS_DUELIST_ADDRESS);
  //   const allowance = getAllowances(result, constants.PISTOLS_DUELIST_ADDRESS);
  //   expect(duelistDiff).toBe(-1n);
  //   expect(allowance).toBe(0n);
  // });
});
