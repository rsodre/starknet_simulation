#!/usr/bin/env node
import { Account, RpcProvider, cairo, ec, hash, num, selector, type SimulateTransactionOverhead, type SimulateTransactionOverheadResponse, type TransactionTrace } from "starknet";
import { RPC_URL, STRK_TOKEN_ADDRESS } from "./constants.js";
import { getStorageVarAddress } from "./utils/storage-vars.js";

const main = async () => {
  const accountAddress = process.env.OZ_ACCOUNT_ADDRESS as string;
  const privateKey = process.env.OZ_ACCOUNT_PRIVATE_KEY as string;

  const provider = new RpcProvider({ nodeUrl: RPC_URL });

  const account = new Account({
    provider,
    address: accountAddress,
    signer: privateKey,
  });

  // Example: simulate a STRK transfer to self
  const recipient = "0x6341f305816b01e842e909b1647ba71823db56284cd76cedc6bdd0dbc5add8e";
  const calls = [
    {
      contractAddress: STRK_TOKEN_ADDRESS,
      entrypoint: "transfer",
      calldata: [recipient, cairo.uint256(2n)],
    },
    {
      contractAddress: STRK_TOKEN_ADDRESS,
      entrypoint: "transfer",
      calldata: ['0x123456789', cairo.uint256(8n)],
    },
  ];

  console.log("Simulating transaction...\n");

  const result = await account.simulateTransaction(
    [{ type: "INVOKE", payload: calls }],
    { skipValidate: true }
  );

  const response = result[0] as SimulateTransactionOverhead;
  if (!response) throw new Error("No response from simulateTransaction");

  const trace: TransactionTrace = response.transaction_trace;
  console.log(`----------- trace: `, trace);
  if (!trace) throw new Error("No trace from simulateTransaction");

  // console.log("=== Fee Estimation ===");
  // console.log("L2 gas:      ", trace.execution_resources.l2_gas.toString());
  // console.log("L1 gas:      ", trace.execution_resources.l1_gas.toString());
  // console.log("L1 data gas: ", trace.execution_resources.l1_data_gas.toString());

  const storage_diffs = trace.state_diff?.storage_diffs;
  console.log(`----------- state_diff: `, trace.state_diff);
  console.log(`----------- storage_diffs: `, storage_diffs);
  if (!storage_diffs) throw new Error("No storage_diffs from simulateTransaction");

  console.log("\n=== Storage Diffs ===");
  for (const diff of storage_diffs) {
    console.log(`Contract: ${diff.address}`);
    for (const entry of diff.storage_entries) {
      const key = entry.key;
      const value = entry.value;
      console.log(`  key: ${key}  =>  value: ${value} / ${BigInt(value).toString()}`);
    }
  }

  console.log(`ERC20_name...`,
    selector.getSelector('ERC20_name'), // OK!!!
    num.toHex(getStorageVarAddress('ERC20_name')),
  );
  console.log(`ERC20_symbol...`,
    selector.getSelector('ERC20_symbol'), // OK!!!
    num.toHex(getStorageVarAddress('ERC20_symbol')),
  );
  console.log(`ERC20_balances...`,
    selector.getSelectorFromName('ERC20_balances') == selector.getSelector('ERC20_balances'), '\n',
    selector.getSelector('ERC20_balances'), '\n',
    num.toHex(ec.starkCurve.poseidonHashMany([BigInt(selector.getSelector('ERC20_balances')), BigInt(recipient)])), '\n',
    num.toHex(getStorageVarAddress('ERC20_balances', recipient)),
  );
};

main().catch(console.error);
