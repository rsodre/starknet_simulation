import type { Call } from "starknet";

export const KATANA_RPC_URL = "http://localhost:5050";

// Katana accounts
export const CALLER = "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec";
export const OPERATOR = "0x13d9ee239f33fea4f8785b9e3870ade909e20a9599ae7cd62c1c292b73af1b7";
export const RECIPIENT1 = "0x17cc6ca902ed4e8baa8463a7009ff18cc294fa85a94b4ce6ac30a9ebd6057c7";
export const RECIPIENT2 = "0x2af9427c5a277474c079a1283c880ee8a6f0f8fbf73ce969c08d88befec1bba";

// contracts: https://github.com/rsodre/starknet_simulation
export const ERC20_ADDRESS = "0x07110260306c295a6d9fe81f7acd6d12a02d09e3902e944fe2a62f1c756310c6";
export const ERC721_ADDRESS = "0x0405c073447f1bfc25b35e987aefc03f8f64a45e1993a0362e2a5a195111f61d";
export const ERC1155_ADDRESS = "0x07f6f20d1993a0caeb38e753032fe6443aee2ff692abf3cb4552fdde1d66fa8a";

export const ONE_ETH = 1_000_000_000_000_000_000n;

export const erc20_transfers: Call[] = [
  { "contractAddress": ERC20_ADDRESS, "entrypoint": "transfer", "calldata": [RECIPIENT1, ONE_ETH, "0x0"] },
  { "contractAddress": ERC20_ADDRESS, "entrypoint": "transfer", "calldata": [RECIPIENT1, 10n * ONE_ETH, "0x0"] },
  { "contractAddress": ERC20_ADDRESS, "entrypoint": "transfer", "calldata": [RECIPIENT2, 9n * ONE_ETH, "0x0"] },
];

export const erc20_approvals: Call[] = [
  { "contractAddress": ERC20_ADDRESS, "entrypoint": "approve", "calldata": [RECIPIENT1, ONE_ETH, "0x0"] },
  { "contractAddress": ERC20_ADDRESS, "entrypoint": "approve", "calldata": [RECIPIENT1, 10n * ONE_ETH, "0x0"] },
  { "contractAddress": ERC20_ADDRESS, "entrypoint": "approve", "calldata": [RECIPIENT2, 9n * ONE_ETH, "0x0"] },
];

export const erc721_transfers: Call[] = [
  { "contractAddress": ERC721_ADDRESS, "entrypoint": "transfer_from", "calldata": [CALLER, RECIPIENT1, "0x1", "0x0"] },
  { "contractAddress": ERC721_ADDRESS, "entrypoint": "transfer_from", "calldata": [CALLER, RECIPIENT1, "0x2", "0x0"] },
  { "contractAddress": ERC721_ADDRESS, "entrypoint": "transfer_from", "calldata": [CALLER, RECIPIENT2, "0x3", "0x0"] },
];

export const erc721_approvals: Call[] = [
  { "contractAddress": ERC721_ADDRESS, "entrypoint": "approve", "calldata": [RECIPIENT1, "0x1", "0x0"] },
  { "contractAddress": ERC721_ADDRESS, "entrypoint": "approve", "calldata": [RECIPIENT1, "0x2", "0x0"] },
  { "contractAddress": ERC721_ADDRESS, "entrypoint": "approve", "calldata": [RECIPIENT2, "0x3", "0x0"] },
];

export const erc721_approve_all: Call[] = [
  { "contractAddress": ERC721_ADDRESS, "entrypoint": "set_approval_for_all", "calldata": [OPERATOR, "0x1"] },
];

