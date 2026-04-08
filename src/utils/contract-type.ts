import { RpcProvider } from "starknet";
import { erc20Metadata } from "@cartridge/presets";

export const isErc20Contract = async (provider: RpcProvider, contractAddress: string) => {
  try {
    // const key = getStorageVarAddress('ERC20_name');
    // const name = await provider.getStorageAt(contractAddress, key);
    // console.log(`ERC20 name:`, num.toHex(key), name, BigInt(name ?? 0) > 0n)
    // return BigInt(name ?? 0) > 0n;

    const token = erc20Metadata.find((t) => BigInt(t.l2_token_address) === BigInt(contractAddress));
    if (token) {
      return true;
    }

    const resp = await provider.callContract({
      contractAddress,
      entrypoint: 'decimals',
      calldata: [],
    });
    // console.log(`ERC20 decimals:`, resp)
    return BigInt(resp?.[0] ?? 0) > 0n;

  } catch (error) {
    // console.log(`isErc20Contract() ERROR:`, error)
    return false;
  }
}

const IERC721_ID = "0x33eb2f84c309543403fd69f0d0f363781ef06ef6faeb0131ff16ea3175bd943";
export const isErc721Contract = async (provider: RpcProvider, contractAddress: string) => {
  try {
    // const key = getStorageVarAddress('ERC721_name');
    // const name = await provider.getStorageAt(contractAddress, key);
    // return BigInt(name ?? 0) > 0n;
    const resp = await provider.callContract({
      contractAddress,
      entrypoint: 'supports_interface',
      calldata: [IERC721_ID],
    });
    return BigInt(resp?.[0] ?? 0) > 0n;
  } catch (error) {
    // console.log(`isErc721Contract() ERROR:`, error)
    return false;
  }
}

const IERC1155_ID = "0x6114a8f75559e1b39fcba08ce02961a1aa082d9256a158dd3e64964e4b1b52";
export const isErc1155Contract = async (provider: RpcProvider, contractAddress: string) => {
  try {
    // const key = getStorageVarAddress('ERC1155_uri');
    // const name = await provider.getStorageAt(contractAddress, key);
    // return BigInt(name ?? 0) > 0n;
    const resp = await provider.callContract({
      contractAddress,
      entrypoint: 'supports_interface',
      calldata: [IERC1155_ID],
    });
    return BigInt(resp?.[0] ?? 0) > 0n;
  } catch (error) {
    // console.log(`isErc1155Contract() ERROR:`, error)
    return false;
  }
}
