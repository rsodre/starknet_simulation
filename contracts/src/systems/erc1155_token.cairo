
#[starknet::interface]
pub trait IERC1155Token<TState> {
    // ── IERC1155 ─────────────────────────────────────────────────────────────
    fn balance_of(self: @TState, account: starknet::ContractAddress, token_id: u256) -> u256;
    fn balance_of_batch(self: @TState, accounts: Span<starknet::ContractAddress>, token_ids: Span<u256>) -> Span<u256>;
    fn is_approved_for_all(self: @TState, owner: starknet::ContractAddress, operator: starknet::ContractAddress) -> bool;
    fn set_approval_for_all(ref self: TState, operator: starknet::ContractAddress, approved: bool);
    fn transfer_from(ref self: TState, from: starknet::ContractAddress, to: starknet::ContractAddress, token_id: u256, value: u256);
    fn batch_transfer_from(ref self: TState, from: starknet::ContractAddress, to: starknet::ContractAddress, token_ids: Span<u256>, values: Span<u256>);
    // ── IERC1155MetadataURI ──────────────────────────────────────────────────
    fn uri(self: @TState, token_id: u256) -> ByteArray;
    // ── ISRC5 ────────────────────────────────────────────────────────────────
    fn supports_interface(self: @TState, interface_id: felt252) -> bool;
    // ── Mint / Burn ──────────────────────────────────────────────────────────
    fn mint(ref self: TState, to: starknet::ContractAddress, token_id: u256, value: u256);
    fn mint_batch(ref self: TState, to: starknet::ContractAddress, token_ids: Span<u256>, values: Span<u256>);
    fn burn(ref self: TState, from: starknet::ContractAddress, token_id: u256, value: u256);
    fn burn_batch(ref self: TState, from: starknet::ContractAddress, token_ids: Span<u256>, values: Span<u256>);
}

#[dojo::contract]
pub mod erc1155_token {
    use core::num::traits::Zero;
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};
    use super::IERC1155Token;

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);

    // ── Component impl aliases ────────────────────────────────────────────
    // Not embedded — all public functions are funnelled through IERC1155Token below.
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl ERC1155Impl = ERC1155Component::ERC1155Impl<ContractState>;
    impl ERC1155MetadataURIImpl = ERC1155Component::ERC1155MetadataURIImpl<ContractState>;
    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC1155Event: ERC1155Component::Event,
    }

    fn BASE_URI() -> ByteArray {"https://mock.uri/{id}"}

    /// Called once by the Dojo world during `sozo migrate`.
    fn dojo_init(
        ref self: ContractState,
        recipients: Span<starknet::ContractAddress>,
        token_ids: Span<u128>,
        values: Span<u128>,
    ) {
        assert!(recipients.len() == token_ids.len(), "length_mismatch");
        assert!(recipients.len() == values.len(), "length_mismatch");

        self.erc1155.initializer(BASE_URI());

        for i in 0..recipients.len() {
            let recipient = *recipients.at(i);
            let token_id: u256 = (*token_ids.at(i)).into();
            let value: u256 = (*values.at(i)).into();
            self.mint(recipient, token_id, value);
        };
    }

    #[abi(embed_v0)]
    impl ERC1155TokenImpl of IERC1155Token<ContractState> {
        // ── IERC1155 ─────────────────────────────────────────────────────────

        fn balance_of(self: @ContractState, account: starknet::ContractAddress, token_id: u256) -> u256 {
            self.erc1155.balance_of(account, token_id)
        }

        fn balance_of_batch(
            self: @ContractState, accounts: Span<starknet::ContractAddress>, token_ids: Span<u256>,
        ) -> Span<u256> {
            self.erc1155.balance_of_batch(accounts, token_ids)
        }

        fn is_approved_for_all(
            self: @ContractState, owner: starknet::ContractAddress, operator: starknet::ContractAddress,
        ) -> bool {
            self.erc1155.is_approved_for_all(owner, operator)
        }

        fn set_approval_for_all(
            ref self: ContractState, operator: starknet::ContractAddress, approved: bool,
        ) {
            self.erc1155.set_approval_for_all(operator, approved)
        }

        fn transfer_from(
            ref self: ContractState,
            from: starknet::ContractAddress,
            to: starknet::ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            self.batch_transfer_from(from, to, [token_id].span(), [value].span());
        }

        fn batch_transfer_from(
            ref self: ContractState,
            from: starknet::ContractAddress,
            to: starknet::ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            assert(from.is_non_zero(), ERC1155Component::Errors::INVALID_SENDER);
            assert(to.is_non_zero(), ERC1155Component::Errors::INVALID_RECEIVER);
            let operator = starknet::get_caller_address();
            if from != operator {
                assert(Self::is_approved_for_all(@self, from, operator), ERC1155Component::Errors::UNAUTHORIZED);
            }
            self.erc1155.update(from, to, token_ids, values);
        }

        // ── IERC1155MetadataURI ──────────────────────────────────────────────

        fn uri(self: @ContractState, token_id: u256) -> ByteArray {
            self.erc1155.uri(token_id)
        }

        // ── ISRC5 ────────────────────────────────────────────────────────────

        fn supports_interface(self: @ContractState, interface_id: felt252) -> bool {
            self.src5.supports_interface(interface_id)
        }

        // ── Mint / Burn ──────────────────────────────────────────────────────

        fn mint(
            ref self: ContractState,
            to: starknet::ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            // self.erc1155.mint_with_acceptance_check(to, token_id, value, [].span());
            self.mint_batch(to, [token_id].span(), [value].span());
        }

        fn mint_batch(
            ref self: ContractState,
            to: starknet::ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            // self.erc1155.batch_mint_with_acceptance_check(to, token_ids, values, [].span());
            assert(to.is_non_zero(), ERC1155Component::Errors::INVALID_RECEIVER);
            self.erc1155.update(Zero::zero(), to, token_ids, values);
        }

        fn burn(ref self: ContractState, from: starknet::ContractAddress, token_id: u256, value: u256) {
            self.erc1155.burn(from, token_id, value);
        }

        fn burn_batch(
            ref self: ContractState,
            from: starknet::ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            self.erc1155.batch_burn(from, token_ids, values);
        }
    }
}
