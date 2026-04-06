#!/usr/bin/env node
import { Account, RpcProvider, cairo } from "starknet";
import { parseSimulationResponses } from "./utils/sim-parser.js";
import * as transactions from "./constants/transactions.js";
import * as constants from "./constants/index.js";

const accountAddress = constants.POPSY_ADDRESS as string;
// const accountAddress = constants.MATALEONE_ADDRESS as string;
const privateKey = '0x0';
const calls = transactions.LS2_PURCHASE_GAME;

// // Example: a STRK transfer to self
// const accountAddress = process.env.OZ_ACCOUNT_ADDRESS as string;
// const privateKey = process.env.OZ_ACCOUNT_PRIVATE_KEY as string;
// const recipient = "0x6341f305816b01e842e909b1647ba71823db56284cd76cedc6bdd0dbc5add8e";
// const calls = [
//   {
//     contractAddress: constants.STRK_TOKEN_ADDRESS,
//     entrypoint: "transfer",
//     calldata: [recipient, cairo.uint256(2n)],
//   },
//   {
//     contractAddress: constants.STRK_TOKEN_ADDRESS,
//     entrypoint: "transfer",
//     calldata: ['0x123456789', cairo.uint256(8n)],
//   },
// ];

const main = async () => {

  const provider = new RpcProvider({ nodeUrl: constants.RPC_URL });

  const account = new Account({
    provider,
    address: accountAddress,
    signer: privateKey,
  });

  console.log("Simulating transaction...\n");

  const responses = await account.simulateTransaction(
    [{ type: "INVOKE", payload: calls }],
    { skipValidate: true }
  );

  const result = await parseSimulationResponses(responses, provider, accountAddress);

  console.log(`---------- result: `, result);
  result.forEach((r) => {
    if (r.increasing) {
      console.log(`+++ ${r.eventName} ${r.contractAddress} +${r.increasing}`);
    }
    if (r.decreasing) {
      console.log(`--- ${r.eventName} ${r.contractAddress} -${r.decreasing}`);
    }
  });

};

main().catch(console.error);
