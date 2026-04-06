export const AVNU_SWAP_SINGLE = [
  {
    contractAddress:
      "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    entrypoint: "approve",
    calldata: [
      "0x4270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f",
      "0x8ac7230489e80000",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x4270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f",
    entrypoint: "multi_route_swap",
    calldata: [
      "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x8ac7230489e80000",
      "0x0",
      "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      "0x1c7af15aad8a1b00",
      "0x0",
      "0x1c73a6df73828b19",
      "0x0",
      "0x5edc8a91216b8916384f530f1fb8ad60150aba9adaeb23c4f2053a8e1bc098e", // beneficiary
      "0x0",
      "0x0",
      "0x1",
      "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      "0x5dd3d2f4429af886cd1a3b08289dbcea99a294197e9eb43b0e0325b4b",
      "0xe8d4a51000",
      "0x6",
      "0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      "0x28f5c28f5c28f5c28f5c28f5c28f5c2",
      "0x4d5a",
      "0x0",
      "0xa26ea81948000000000000000000",
    ],
  },
];

export const EKUBO_SWAP_SINGLE = [
  {
    contractAddress:
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    entrypoint: "transfer",
    calldata: [
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
      "0x32a03ab37fef8ba51",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "multihop_swap",
    calldata: [
      "0x2",
      "0x016dea82a6588ca9fb7200125fa05631b1c1735a313e24afe9c90301e441a796",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "17014118346046924117642026945517453312",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x6f3528fe26840249f4b191ef6dff7928",
      "0xfffffc080ed7b455",
      0,
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "3402823669209384634633746074317682114",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x1000003f7f1380b75",
      "0x0",
      0,
      "0x016dea82a6588ca9fb7200125fa05631b1c1735a313e24afe9c90301e441a796",
      "0xa688906bd8b00000",
      "0x1",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear_minimum",
    calldata: [
      "0x016dea82a6588ca9fb7200125fa05631b1c1735a313e24afe9c90301e441a796",
      "0xa4de3d0e9ba40000",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear",
    calldata: [
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    ],
  },
];

export const EKUBO_SWAP_MULTIPLE = [
  {
    contractAddress:
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    entrypoint: "transfer",
    calldata: [
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
      "0x176e9649d99dd740a",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "multihop_swap",
    calldata: [
      "0x2",
      "0x01c3c8284d7eed443b42f47e764032a56eaf50a9079d67993b633930e3689814",
      "0x075afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87",
      "0",
      "0x56a4c",
      "0x005e470ff654d834983a46b8f29dfa99963d5044b993cb7b9c92243a69dab38f",
      "0x6f3528fe26840249f4b191ef6dff7928",
      "0xfffffc080ed7b455",
      0,
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x075afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87",
      "1020847100762815411640772995208708096",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x1000003f7f1380b75",
      "0x0",
      0,
      "0x01c3c8284d7eed443b42f47e764032a56eaf50a9079d67993b633930e3689814",
      "0xde0b6b3a7640000",
      "0x1",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear_minimum",
    calldata: [
      "0x01c3c8284d7eed443b42f47e764032a56eaf50a9079d67993b633930e3689814",
      "0xdbd2fc137a30000",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear",
    calldata: [
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    ],
  },
  {
    contractAddress:
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    entrypoint: "transfer",
    calldata: [
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
      "0x4f1eba34861ddd0",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "multihop_swap",
    calldata: [
      "0x2",
      "0x0103eafe79f8631932530cc687dfcdeb013c883a82619ebf81be393e2953a87a",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "17014118346046923173168730371588410572",
      "0x56a4c",
      "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc",
      "0x6f3528fe26840249f4b191ef6dff7928",
      "0xfffffc080ed7b455",
      0,
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      "0x042dd777885ad2c116be96d4d634abc90a26a790ffb5871e037dd5ae7d2ec86b",
      "17014118346046923173168730371588410572",
      "0x1744e",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0xf7c31547edfb13af0071dfd6ffe",
      "0x0",
      0,
      "0x0103eafe79f8631932530cc687dfcdeb013c883a82619ebf81be393e2953a87a",
      "0xde0b6b3a7640000",
      "0x1",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear_minimum",
    calldata: [
      "0x0103eafe79f8631932530cc687dfcdeb013c883a82619ebf81be393e2953a87a",
      "0xdbd2fc137a30000",
      "0x0",
    ],
  },
  {
    contractAddress:
      "0x04505a9f06f2bd639b6601f37a4dc0908bb70e8e0e0c34b1220827d64f4fc066",
    entrypoint: "clear",
    calldata: [
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    ],
  },
];

// caller: popsy
export const LS2_PURCHASE_GAME = [{ "contractAddress": "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "entrypoint": "transfer", "calldata": ["0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "0x125ef57237b533c6f", "0x0"] }, { "contractAddress": "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "entrypoint": "multihop_swap", "calldata": ["0x1", "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "0x0452810188c4cb3aebd63711a3b445755bc0d6c4f27b923fdd99b1a118858136", "0", "0x56a4c", "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc", "0x1000003f7f1380b75", "0x0", 0, "0x0452810188C4Cb3AEbD63711a3b445755BC0D6C4f27B923fDd99B1A118858136", "0xde0b6b3a7640000", "0x1"] }, { "contractAddress": "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "entrypoint": "clear_minimum", "calldata": ["1955023220287003686908448593668771782622329060199208410425295899940041883958", "1000000000000000000", "0"] }, { "contractAddress": "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "entrypoint": "clear", "calldata": ["0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49"] }, { "contractAddress": "0x0452810188C4Cb3AEbD63711a3b445755BC0D6C4f27B923fDd99B1A118858136", "entrypoint": "approve", "calldata": ["294172758298611957878874535440244936028848058202724233951972339591192112194", "1000000000000000000", "0"] }, { "contractAddress": "0x00a67ef20b61a9846e1c82b411175e6ab167ea9f8632bd6c2091823c3629ec42", "entrypoint": "buy_game", "calldata": ["0", "0", "482905977721", "3353844257235124925573382629261102992028433843221166170064905711558609000773", "0"] }];

// caller: popsy
export const LS2_PURCHASE_GAME_ERROR = [{ "contractAddress": "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "entrypoint": "transfer", "calldata": ["0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "0x1", "0x0"] }, { "contractAddress": "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "entrypoint": "multihop_swap", "calldata": ["0x1", "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "0x0452810188c4cb3aebd63711a3b445755bc0d6c4f27b923fdd99b1a118858136", "0", "0x56a4c", "0x043e4f09c32d13d43a880e85f69f7de93ceda62d6cf2581a582c6db635548fdc", "0x1000003f7f1380b75", "0x0", 0, "0x0452810188C4Cb3AEbD63711a3b445755BC0D6C4f27B923fDd99B1A118858136", "0xde0b6b3a7640000", "0x1"] }, { "contractAddress": "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "entrypoint": "clear_minimum", "calldata": ["1955023220287003686908448593668771782622329060199208410425295899940041883958", "1000000000000000000", "0"] }, { "contractAddress": "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e", "entrypoint": "clear", "calldata": ["0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49"] }, { "contractAddress": "0x0452810188C4Cb3AEbD63711a3b445755BC0D6C4f27B923fDd99B1A118858136", "entrypoint": "approve", "calldata": ["294172758298611957878874535440244936028848058202724233951972339591192112194", "1000000000000000000", "0"] }, { "contractAddress": "0x00a67ef20b61a9846e1c82b411175e6ab167ea9f8632bd6c2091823c3629ec42", "entrypoint": "buy_game", "calldata": ["0", "0", "482905977721", "3353844257235124925573382629261102992028433843221166170064905711558609000773", "0"] }];

// caller: popsy
export const PISTOLS_PURCHASE_PACK = [{ "contractAddress": "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "entrypoint": "approve", "calldata": ["0x0426c16fe76f12586718c07e47c8e4312e9fee5e7dc849a75f3c587ad9e70b4f", { "low": "0x2b5e3af16b1880000", "high": "0x0" }] }, { "contractAddress": "0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f", "entrypoint": "request_random", "calldata": ["3200116672885330496976366445598937750107499092679469734727006363366688022489", "0", "3353844257235124925573382629261102992028433843221166170064905711558609000773"] }, { "contractAddress": "0x71333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9", "entrypoint": "purchase_random", "calldata": [] }];
