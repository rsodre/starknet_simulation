
/// Full interface for the ERC-20 token contract.
/// Exposes all ERC20Component (transfer, approve, mint, burn) and
/// ERC20MetadataComponent (name, symbol, decimals) functions.
#[starknet::interface]
pub trait IERC20Token<TState> {
    // ── IERC20 ─────────────────────────────────────────────────────────────
    fn total_supply(self: @TState) -> u256;
    fn balance_of(self: @TState, account: starknet::ContractAddress) -> u256;
    fn allowance(self: @TState, owner: starknet::ContractAddress, spender: starknet::ContractAddress) -> u256;
    fn transfer(ref self: TState, recipient: starknet::ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TState, sender: starknet::ContractAddress, recipient: starknet::ContractAddress, amount: u256,
    ) -> bool;
    fn approve(ref self: TState, spender: starknet::ContractAddress, amount: u256) -> bool;
    // ── IERC20Metadata ──────────────────────────────────────────────────────
    fn name(self: @TState) -> ByteArray;
    fn symbol(self: @TState) -> ByteArray;
    fn decimals(self: @TState) -> u8;
    // ── Mint / Burn ─────────────────────────────────────────────────────────
    fn mint(ref self: TState, recipient: starknet::ContractAddress, amount: u256);
    fn burn(ref self: TState, account: starknet::ContractAddress, amount: u256);
}

/// ERC-20 token Dojo contract.
///
/// Embeds OpenZeppelin ERC20Component (transfer, approve, allowance).
///
/// Initialization: call `dojo_init` via `sozo migrate` with:
///   - owner          : starknet::ContractAddress  — initial owner
///   - name           : ByteArray        — token name
///   - symbol         : ByteArray        — token symbol
///   - initial_supply : u256             — tokens to pre-mint (0 = skip)
///   - recipient      : starknet::ContractAddress  — pre-mint recipient (ignored when supply = 0)
#[dojo::contract]
pub mod erc20_token {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use super::IERC20Token;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // ImmutableConfig is required by ERC20MetadataImpl to supply the decimals constant.
    impl ERC20ImmutableConfig of ERC20Component::ImmutableConfig {
        const DECIMALS: u8 = 18;
    }

    // ── Component impl aliases ────────────────────────────────────────────
    // Not embedded — all public functions are funnelled through IERC20Token below.
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    impl ERC20MetadataImpl = ERC20Component::ERC20MetadataImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }

    /// Called once by the Dojo world during `sozo migrate`.
    fn dojo_init(ref self: ContractState, recipients: Span<starknet::ContractAddress>) {
        let name: ByteArray = "MockToken";
        let symbol: ByteArray = "MTK";

        self.erc20.initializer(name, symbol);
        if initial_supply > 0 {
            assert!(!recipient.is_zero(), "recipient_zero");
            self.erc20.mint(recipient, initial_supply);
        }
    }

    #[abi(embed_v0)]
    impl ERC20TokenImpl of IERC20Token<ContractState> {
        // ── IERC20 ──────────────────────────────────────────────────────────

        fn total_supply(self: @ContractState) -> u256 {
            self.erc20.total_supply()
        }

        fn balance_of(self: @ContractState, account: starknet::ContractAddress) -> u256 {
            self.erc20.balance_of(account)
        }

        fn allowance(
            self: @ContractState, owner: starknet::ContractAddress, spender: starknet::ContractAddress,
        ) -> u256 {
            self.erc20.allowance(owner, spender)
        }

        fn transfer(ref self: ContractState, recipient: starknet::ContractAddress, amount: u256) -> bool {
            // public: standard ERC20 — caller initiates transfer of own tokens
            self.erc20.transfer(recipient, amount)
        }

        fn transfer_from(
            ref self: ContractState,
            sender: starknet::ContractAddress,
            recipient: starknet::ContractAddress,
            amount: u256,
        ) -> bool {
            // public: protected by allowance check inside ERC20Component
            self.erc20.transfer_from(sender, recipient, amount)
        }

        fn approve(ref self: ContractState, spender: starknet::ContractAddress, amount: u256) -> bool {
            // public: caller sets their own allowance
            self.erc20.approve(spender, amount)
        }

        // ── IERC20Metadata ───────────────────────────────────────────────────

        fn name(self: @ContractState) -> ByteArray {
            self.erc20.name()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc20.symbol()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.erc20.decimals()
        }

        // ── Mint / Burn ──────────────────────────────────────────────────────

        fn mint(ref self: ContractState, recipient: starknet::ContractAddress, amount: u256) {
            self.erc20.mint(recipient, amount);
        }

        fn burn(ref self: ContractState, account: starknet::ContractAddress, amount: u256) {
            self.erc20.burn(account, amount);
        }
    }
}
