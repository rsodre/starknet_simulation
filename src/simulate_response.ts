#!/usr/bin/env node
import { RPC, RpcProvider, type SimulateTransactionOverhead } from "starknet";
import { RPC_URL } from "./constants/index.js";
import { parseSimulationResponses } from "./utils/sim-parser.js";

import resp from "../data/tx_ekubo_multi_resp.json";
const accountAddress = "0x76a3565794db7894484718be7f51ad5b2e76605e22722887c1260e2451ad945";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  await parseSimulationResponses(resp.result as unknown as SimulateTransactionOverhead[], provider, accountAddress);

};

main().catch(console.error);
