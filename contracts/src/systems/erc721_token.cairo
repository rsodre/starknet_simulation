
/// Full interface for the ERC-721 token contract.
/// Exposes all ERC721Component (balance_of, owner_of, transfer, approve, mint, burn),
/// ERC721MetadataComponent (name, symbol, token_uri), and
/// SRC5Component (supports_interface) functions.
#[starknet::interface]
pub trait IERC721Token<TState> {
    // ── IERC721 ─────────────────────────────────────────────────────────────
    fn balance_of(self: @TState, account: starknet::ContractAddress) -> u256;
    fn owner_of(self: @TState, token_id: u256) -> starknet::ContractAddress;
    fn safe_transfer_from(
        ref self: TState,
        from: starknet::ContractAddress,
        to: starknet::ContractAddress,
        token_id: u256,
        data: Span<felt252>,
    );
    fn transfer_from(
        ref self: TState, from: starknet::ContractAddress, to: starknet::ContractAddress, token_id: u256,
    );
    fn approve(ref self: TState, to: starknet::ContractAddress, token_id: u256);
    fn set_approval_for_all(ref self: TState, operator: starknet::ContractAddress, approved: bool);
    fn get_approved(self: @TState, token_id: u256) -> starknet::ContractAddress;
    fn is_approved_for_all(
        self: @TState, owner: starknet::ContractAddress, operator: starknet::ContractAddress,
    ) -> bool;
    // ── IERC721Metadata ─────────────────────────────────────────────────────
    fn name(self: @TState) -> ByteArray;
    fn symbol(self: @TState) -> ByteArray;
    fn token_uri(self: @TState, token_id: u256) -> ByteArray;
    // ── ISRC5 ───────────────────────────────────────────────────────────────
    fn supports_interface(self: @TState, interface_id: felt252) -> bool;
    // ── Mint / Burn ─────────────────────────────────────────────────────────
    fn safe_mint(
        ref self: TState, to: starknet::ContractAddress, token_id: u256, data: Span<felt252>,
    );
    fn burn(ref self: TState, token_id: u256);
}

/// ERC-721 token Dojo contract.
///
/// Embeds OpenZeppelin ERC721Component (transfer, approve, mint, burn) and
/// SRC5Component (interface detection).
///
/// Initialization: call `dojo_init` via `sozo migrate` with:
///   - owner    : starknet::ContractAddress — initial owner
///   - name     : ByteArray       — token name
///   - symbol   : ByteArray       — token symbol
///   - base_uri : ByteArray       — base metadata URI
#[dojo::contract]
pub mod erc721_token {
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use super::IERC721Token;

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);

    // ── Component impl aliases ────────────────────────────────────────────
    // Not embedded — all public functions are funnelled through IERC721Token below.
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    impl ERC721MetadataImpl = ERC721Component::ERC721MetadataImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        ERC721Event: ERC721Component::Event,
    }

    /// Called once by the Dojo world during `sozo migrate`.
    fn dojo_init(ref self: ContractState, recipients: Span<starknet::ContractAddress>) {
        let name: ByteArray = "MockNFT";
        let symbol: ByteArray = "MNFT";
        let base_uri: ByteArray = "https://mock.uri/";

        self.erc721.initializer(name, symbol, base_uri);
    }

    #[abi(embed_v0)]
    impl ERC721TokenImpl of IERC721Token<ContractState> {
        // ── IERC721 ──────────────────────────────────────────────────────────

        fn balance_of(self: @ContractState, account: starknet::ContractAddress) -> u256 {
            self.erc721.balance_of(account)
        }

        fn owner_of(self: @ContractState, token_id: u256) -> starknet::ContractAddress {
            self.erc721.owner_of(token_id)
        }

        fn safe_transfer_from(
            ref self: ContractState,
            from: starknet::ContractAddress,
            to: starknet::ContractAddress,
            token_id: u256,
            data: Span<felt252>,
        ) {
            // public: ERC721Component checks caller is owner or approved
            self.erc721.safe_transfer_from(from, to, token_id, data)
        }

        fn transfer_from(
            ref self: ContractState, from: starknet::ContractAddress, to: starknet::ContractAddress, token_id: u256,
        ) {
            // public: ERC721Component checks caller is owner or approved
            self.erc721.transfer_from(from, to, token_id)
        }

        fn approve(ref self: ContractState, to: starknet::ContractAddress, token_id: u256) {
            // public: ERC721Component checks caller is owner or approved operator
            self.erc721.approve(to, token_id)
        }

        fn set_approval_for_all(
            ref self: ContractState, operator: starknet::ContractAddress, approved: bool,
        ) {
            // public: caller sets their own operator approvals
            self.erc721.set_approval_for_all(operator, approved)
        }

        fn get_approved(self: @ContractState, token_id: u256) -> starknet::ContractAddress {
            self.erc721.get_approved(token_id)
        }

        fn is_approved_for_all(
            self: @ContractState, owner: starknet::ContractAddress, operator: starknet::ContractAddress,
        ) -> bool {
            self.erc721.is_approved_for_all(owner, operator)
        }

        // ── IERC721Metadata ──────────────────────────────────────────────────

        fn name(self: @ContractState) -> ByteArray {
            self.erc721.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.symbol()
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            self.erc721.token_uri(token_id)
        }

        // ── ISRC5 ────────────────────────────────────────────────────────────

        fn supports_interface(self: @ContractState, interface_id: felt252) -> bool {
            self.src5.supports_interface(interface_id)
        }

        // ── Mint / Burn ──────────────────────────────────────────────────────

        fn safe_mint(
            ref self: ContractState,
            to: starknet::ContractAddress,
            token_id: u256,
            data: Span<felt252>,
        ) {
            self.erc721.safe_mint(to, token_id, data);
        }

        fn burn(ref self: ContractState, token_id: u256) {
            self.erc721.burn(token_id);
        }
    }
}
