#!/usr/bin/env node
import { Account, RpcProvider, cairo } from "starknet";
import { RPC_URL, STRK_TOKEN_ADDRESS } from "./constants/index.js";
import { parseSimulationResponses } from "./utils/sim-parser.js";

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

  const responses = await account.simulateTransaction(
    [{ type: "INVOKE", payload: calls }],
    { skipValidate: true }
  );

  await parseSimulationResponses(responses, provider, accountAddress);

};

main().catch(console.error);
