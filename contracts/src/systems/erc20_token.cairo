
#[starknet::interface]
pub trait IERC20Token<TState> {
    // ── IERC20 ─────────────────────────────────────────────────────────────
    fn total_supply(self: @TState) -> u256;
    fn balance_of(self: @TState, account: starknet::ContractAddress) -> u256;
    fn allowance(self: @TState, owner: starknet::ContractAddress, spender: starknet::ContractAddress) -> u256;
    fn transfer(ref self: TState, recipient: starknet::ContractAddress, amount: u256) -> bool;
    fn transfer_from(ref self: TState, sender: starknet::ContractAddress, recipient: starknet::ContractAddress, amount: u256) -> bool;
    fn approve(ref self: TState, spender: starknet::ContractAddress, amount: u256) -> bool;
    // ── IERC20Metadata ──────────────────────────────────────────────────────
    fn name(self: @TState) -> ByteArray;
    fn symbol(self: @TState) -> ByteArray;
    fn decimals(self: @TState) -> u8;
    // ── Mint / Burn ─────────────────────────────────────────────────────────
    fn mint(ref self: TState, recipient: starknet::ContractAddress, amount: u256);
    fn burn(ref self: TState, account: starknet::ContractAddress, amount: u256);
}

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

    fn NAME() -> ByteArray {"MockToken"}
    fn SYMBOL() -> ByteArray {"MTK"}

    /// Called once by the Dojo world during `sozo migrate`.
    fn dojo_init(ref self: ContractState, recipients: Span<starknet::ContractAddress>) {
        self.erc20.initializer(NAME(), SYMBOL());

        for i in 0..recipients.len() {
            self.erc20.mint(*recipients.at(i), 100_000_000_000_000_000_000_u256);
        };
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
            self.erc20.transfer(recipient, amount)
        }

        fn transfer_from(
            ref self: ContractState,
            sender: starknet::ContractAddress,
            recipient: starknet::ContractAddress,
            amount: u256,
        ) -> bool {
            self.erc20.transfer_from(sender, recipient, amount)
        }

        fn approve(ref self: ContractState, spender: starknet::ContractAddress, amount: u256) -> bool {
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
