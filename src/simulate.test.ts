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

const getContractDiff = (result: SimulationResult[], contractAddress: string): bigint | undefined => {
  const c = result.find((r) => BigInt(r.contractAddress) === BigInt(contractAddress));
  if (!c) return undefined;
  return c.increasing - c.decreasing;
}

describe('simulate', () => {
  it('STRK_MULTI_TRANSFER', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.STRK_MULTI_TRANSFER }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const strkDiff = getContractDiff(result, constants.STRK_TOKEN_ADDRESS);
    expect(strkDiff).toBe(-10n);
  });

  it('AVNU_SWAP_SINGLE', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.AVNU_SWAP_SINGLE }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const strkDiff = getContractDiff(result, constants.STRK_TOKEN_ADDRESS);
    const lordsDiff = getContractDiff(result, constants.LORDS_TOKEN_ADDRESS);
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
    const lordsDiff = getContractDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const attackDiff = getContractDiff(result, constants.ATTACK_POTION_ADDRESS);
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
    const lordsDiff = getContractDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const attackDiff = getContractDiff(result, constants.ATTACK_POTION_ADDRESS);
    const reviveDiff = getContractDiff(result, constants.REVIVE_POTION_ADDRESS);
    const lifeDiff = getContractDiff(result, constants.EXTRA_LIFE_POTION_ADDRESS);
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
    const lordsDiffSingle = getContractDiff(result_single, constants.LORDS_TOKEN_ADDRESS) ?? 0n;

    const responses_multiple = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.EKUBO_SWAP_MULTIPLE }],
      { skipValidate: true }
    );
    const result_multiple = await parseSimulationResponses(responses_multiple, provider, accountAddress);
    const lordsDiffMultiple = getContractDiff(result_multiple, constants.LORDS_TOKEN_ADDRESS) ?? 0n;

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
    const lordsDiff = getContractDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const ticketDiff = getContractDiff(result, constants.DUNGEON_TICKET_ADDRESS);
    const gameDiff = getContractDiff(result, constants.LS_GAME_ADDRESS);
    expect(lordsDiff).toBeLessThan(-ONE_ETH);
    expect(ticketDiff).toBe(0n);
    expect(gameDiff).toBe(1n);
  });

  it('LS2_PURCHASE_GAME_ERROR', async () => {
    const responses = await account.simulateTransaction(
      [{ type: "INVOKE", payload: transactions.LS2_PURCHASE_GAME_ERROR }],
      { skipValidate: true }
    );
    const result = await parseSimulationResponses(responses, provider, accountAddress);
    // console.log(`result: `, result);
    const lordsDiff = getContractDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const ticketDiff = getContractDiff(result, constants.DUNGEON_TICKET_ADDRESS);
    const gameDiff = getContractDiff(result, constants.LS_GAME_ADDRESS);
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
    const lordsDiff = getContractDiff(result, constants.LORDS_TOKEN_ADDRESS);
    const packDiff = getContractDiff(result, constants.PISTOLS_PACK_ADDRESS);
    expect(lordsDiff).toBe(-50n * ONE_ETH);
    expect(packDiff).toBe(1n);
  });
});
