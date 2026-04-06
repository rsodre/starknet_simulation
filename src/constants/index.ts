import { constants } from "starknet";
import dotenv from "dotenv";
dotenv.config();

export const CHAIN_ID = constants.StarknetChainId.SN_MAIN;
export const RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";

// export const CHAIN_ID = constants.StarknetChainId.SN_SEPOLIA;
// export const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9";

export const OZ_ACCOUNT_CLASS_HASH = "0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688";
export const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export const CLI1_ADDRESS = "0x05B01324168De545d4B54F588DF725DD417f572FD370dd264b714eF735c610b0";
export const POPSY_ADDRESS = "0x076a3565794dB7894484718bE7F51Ad5B2E76605e22722887C1260e2451aD945";
export const MATALEONE_ADDRESS = "0x0550212D3F13a373DfE9e3Ef6aA41fBA4124BDe63FD7955393f879De19f3F47F";
