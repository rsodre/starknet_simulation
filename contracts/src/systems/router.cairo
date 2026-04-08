#[starknet::interface]
pub trait IRouter<TState> {
    fn swap_transferred(ref self: TState, amount: u256);
    fn swap_approved(ref self: TState, amount: u256);
    fn purchase_erc721_transferred(ref self: TState);
    fn purchase_erc721_approved(ref self: TState, amount: u256);
    fn purchase_erc1155(ref self: TState);
}

#[dojo::contract]
pub mod router {
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use openzeppelin_interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{get_caller_address, get_contract_address};
    use super::IRouter;
    use super::super::erc721_token::{IERC721TokenDispatcher, IERC721TokenDispatcherTrait};

    #[storage]
    struct Storage {}

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {}

    fn STRK_ADDRESS() -> starknet::ContractAddress {
        0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d.try_into().unwrap()
    }

    fn dojo_init(ref self: ContractState) {}

    #[generate_trait]
    impl WorldDefaultImpl of WorldDefaultTrait {
        #[inline(always)]
        fn world_default(self: @ContractState) -> WorldStorage {
            (self.world(@"tokens"))
        }
    }

    #[abi(embed_v0)]
    impl RouterImpl of IRouter<ContractState> {
        // swap STRK for erc20_token
        // (caller transferred STRK to contract beforehand)
        fn swap_transferred(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let world = self.world_default();
            let erc20_address = world.dns_address(@"erc20_token").expect('erc20_token not found');
            let erc20 = IERC20Dispatcher { contract_address: erc20_address };
            erc20.transfer(caller, amount * 2);
        }

        // swap STRK for erc20_token
        // (caller approved contract to spend their STRK)
        fn swap_approved(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let world = self.world_default();
            let erc20_address = world.dns_address(@"erc20_token").expect('erc20_token not found');
            let erc20 = IERC20Dispatcher { contract_address: erc20_address };
            let strk = IERC20Dispatcher { contract_address: STRK_ADDRESS() };
            strk.transfer_from(caller, get_contract_address(), amount);
            erc20.transfer(caller, amount * 2);
        }

        // purchase NFT — caller transferred STRK to this contract beforehand
        fn purchase_erc721_transferred(ref self: ContractState) {
            let caller = get_caller_address();
            let world = self.world_default();
            let erc721_address = world.dns_address(@"erc721_token").expect('erc721_token not found');
            let erc721 = IERC721TokenDispatcher { contract_address: erc721_address };
            erc721.mint(caller);
        }

        // purchase NFT — caller approved this contract to spend `amount` STRK
        fn purchase_erc721_approved(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let world = self.world_default();
            let strk = IERC20Dispatcher { contract_address: STRK_ADDRESS() };
            strk.transfer_from(caller, get_contract_address(), amount);
            let erc721_address = world.dns_address(@"erc721_token").expect('erc721_token not found');
            let erc721 = IERC721TokenDispatcher { contract_address: erc721_address };
            erc721.mint(caller);
        }

        fn purchase_erc1155(ref self: ContractState) {}
    }
}
