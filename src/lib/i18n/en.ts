export const en = {
  // Metadata and social previews
  "meta.title": "cp0x | Hyperliquid recovery",
  "meta.description":
    "Inspect a Hyperliquid account and recover assets stuck in orders, positions, vaults, DEX collateral, spot balances, borrow/lend, and USDC. Free permissionless interface by cp0x.",
  "meta.socialDescription":
    "Inspect a Hyperliquid account and recover stuck balances, vault funds, collateral, orders, positions, and USDC. Free permissionless interface by cp0x.",
  "meta.imageDescription":
    "Inspect stuck balances, vault funds, collateral, orders, positions, and USDC in one recovery path.",

  // Header
  "header.logoLink": "cp0x home",
  "header.nav.label": "cp0x sites",
  "header.nav.permissionless": "Permissionless interfaces",
  "header.switchChain": "Arbitrum",
  "header.switchChain.switching": "Switching",
  "header.switchChain.aria": "Switch wallet network to Arbitrum",
  "header.switchChain.ariaPending": "Switching wallet network to Arbitrum",
  "header.connectedAddress": "Connected wallet address: ",
  "header.disconnect": "Disconnect",
  "header.disconnect.aria": "Disconnect wallet {address}",
  "header.connect": "Connect wallet",
  "header.connecting": "Connecting...",

  // Language switcher
  "language.label": "Select language",
  "language.en": "English",
  "language.en.short": "EN",
  "language.zh": "中文",
  "language.zh.short": "中文",

  // Hero
  "hero.title": "Get your assets out of Hyperliquid.",
  "hero.subtitle":
    "Use this free interface to recover assets stuck on Hyperliquid if you got blocked from app.hyperliquid.xyz.",

  // Scan form
  "scan.region": "Hyperliquid account scan",
  "scan.input.label": "Hyperliquid wallet address to scan",
  "scan.input.placeholder": "Paste another wallet address",
  "scan.button.scan": "Scan",
  "scan.button.rescan": "Re-scan",
  "scan.button.scanning": "Scanning",
  "scan.button.aria.scan": "Scan wallet for recoverable Hyperliquid assets",
  "scan.button.aria.rescan": "Re-scan wallet for recoverable Hyperliquid assets",
  "scan.button.aria.scanning":
    "Scanning wallet for recoverable Hyperliquid assets",
  "scan.hint":
    "Paste an address to inspect it or connect your wallet to prepare withdrawal.",
  "scan.error.invalidAddress": "Enter a valid Ethereum address.",
  "scan.error.failed": "Could not scan this Hyperliquid account.",
  "scan.error.retry": "Retry",
  "scan.error.retry.aria": "Retry scanning this Hyperliquid account",
  "wallet.error.connection": "Wallet connection failed.",

  // Screen reader status
  "status.wallet.disconnected": "Wallet not connected.",
  "status.wallet.wrongNetwork":
    "Wallet {address} is connected on the wrong network. Switch to Arbitrum to sign recovery actions.",
  "status.wallet.connected": "Wallet {address} is connected on Arbitrum.",
  "status.scan.scanning": " Scanning Hyperliquid account {address}.",
  "status.scan.readOnly":
    " Read-only scan of {address}. Connect the owner wallet to run recovery actions.",
  "status.scan.ready": " Recovery actions are available for {address}.",
  "status.action.pending":
    " Recovery action pending. Confirm the request in your wallet.",
  "status.action.settling":
    " Recovery action submitted. Rechecking the Hyperliquid account.",

  // Recovery board section
  "board.eyebrow": "Recovery path",
  "board.title": "Follow these steps to get your assets out of Hyperliquid.",

  // Kanban chrome
  "kanban.step": "Step {step}",
  "kanban.scanning": "Scanning",
  "kanban.total": "Total: ",
  "kanban.empty.title": "Nothing locked",
  "kanban.expand": "Expand {count} more",
  "kanban.collapse": "Collapse",
  "kanban.expand.aria.one": "Expand {count} more item in {column}",
  "kanban.expand.aria.other": "Expand {count} more items in {column}",
  "kanban.collapse.aria": "Collapse the {column} list",
  "kanban.item.action.aria": "{action} {name} — {value}",
  "kanban.item.action.ariaNoValue": "{action} {name}",
  "kanban.group.action.aria": "{action} — {column}",

  // Toasts
  "toast.region": "Notifications",
  "toast.close": "Close notification: {title}",

  // Footer
  "footer.donations": "cp0x donation addresses",
  "footer.social": "cp0x social links",
  "footer.telegram": "cp0x on Telegram",
  "footer.x": "cp0x on X (Twitter)",
  "footer.github": "cp0x on GitHub",

  // Column templates
  "column.orders.title": "Open orders",
  "column.orders.description":
    "Resting and trigger orders across perps and spot markets.",
  "column.orders.empty": "No resting orders are holding funds.",
  "column.orders.groupAction": "Cancel all",
  "column.positions.title": "Open positions",
  "column.positions.description": "Perp exposure that can keep margin locked.",
  "column.positions.empty": "No open perp positions are using margin.",
  "column.positions.groupAction": "Close all",
  "column.staking.title": "Staked HYPE",
  "column.staking.description":
    "Delegated or undelegated HYPE that needs to move back to spot.",
  "column.staking.empty": "No staked HYPE needs to be unstaked.",
  "column.spot.title": "Spot assets",
  "column.spot.description": "Non-USDC spot balances worth more than $10.",
  "column.spot.empty": "No spot assets above the recovery threshold.",
  "column.vaults.title": "Vault deposits",
  "column.vaults.description": "Depositor equity in protocol or user vaults.",
  "column.vaults.empty": "No vault deposits are waiting to withdraw.",
  "column.portfolioMargin.title": "Portfolio margin",
  "column.portfolioMargin.description":
    "Unified spot and perps margin can create borrows or supplied assets.",
  "column.portfolioMargin.empty":
    "No portfolio margin borrows or supplied assets found.",
  "column.withdraw.title": "Withdraw from Hyperliquid",
  "column.withdraw.description":
    "Final withdrawable USDC after the previous steps settle.",
  "column.withdraw.empty": "No withdrawable USDC is locked here.",

  // Column totals
  "board.total.orders.one": "{count} order",
  "board.total.orders.other": "{count} orders",
  "board.total.positions.one": "{count} position",
  "board.total.positions.other": "{count} positions",
  "board.total.items.one": "{count} item",
  "board.total.items.other": "{count} items",

  // Shared item actions
  "board.action.sell": "Sell",
  "board.action.withdraw": "Withdraw",
  "board.action.locked": "Locked",
  "board.action.repay": "Repay",
  "board.action.disable": "Disable",
  "board.action.undelegate": "Undelegate",
  "board.action.pending": "Pending",
  "board.action.move": "Move",
  "board.action.moveToPerps": "Move to perps",

  // Open orders items
  "board.orders.detail": "{orderType} {side} at {price}",
  "board.orders.side.buy": "buy",
  "board.orders.side.sell": "sell",
  "board.orders.type.market": "Market",
  "board.orders.type.limit": "Limit",
  "board.orders.type.stopMarket": "Stop Market",
  "board.orders.type.stopLimit": "Stop Limit",
  "board.orders.type.takeProfitMarket": "Take Profit Market",
  "board.orders.type.takeProfitLimit": "Take Profit Limit",
  "board.orders.value": "{size} open",

  // Open position items
  "board.positions.detail": "{side} {size} | PnL {pnl}",
  "board.positions.detailNoClose":
    "{side} {size} | PnL {pnl} | close unavailable",
  "board.positions.side.long": "Long",
  "board.positions.side.short": "Short",

  // Spot items
  "board.spot.detail": "{size} {coin}{hold}{unavailable}",
  "board.spot.hold": " | {size} on hold",
  "board.spot.noMarket": " | no USDC market",
  "board.spot.balanceOnHold": " | balance on hold",
  "board.spot.sellUnavailable": " | sell unavailable",

  // Vault items
  "board.vaults.detail.locked": "Unlocks {date}",
  "board.vaults.detail.available": "Withdrawal is available.",
  "board.vaults.detail.tooSmall": "Withdrawal amount is too small.",

  // Portfolio margin items
  "board.portfolioMargin.action.needs": "Needs {token}",
  "board.tokenFallback": "Token {id}",
  "board.portfolioMargin.borrow.name": "Borrowed {token}",
  "board.portfolioMargin.borrow.detail":
    "Borrow basis {basis} {token} | Available {available}",
  "board.portfolioMargin.supply.name": "Supplied {token}",
  "board.portfolioMargin.supply.detail": "Supply basis {basis} {token}",
  "board.portfolioMargin.mode.name": "Portfolio margin mode",
  "board.portfolioMargin.mode.value": "Enabled",
  "board.portfolioMargin.mode.canDisable":
    "Portfolio margin mode can be disabled.",
  "board.portfolioMargin.mode.blocked":
    "Clear borrows and supplied assets first.",

  // Staking items
  "board.staking.delegated.name": "Delegated HYPE",
  "board.staking.delegated.locked":
    "Validator {validator} unlocks {date}.",
  "board.staking.delegated.detail":
    "Undelegate from validator {validator} before withdrawing to spot.",
  "board.staking.undelegated.name": "Undelegated HYPE",
  "board.staking.undelegated.detail":
    "Move undelegated HYPE from staking to spot. Hyperliquid staking withdrawals enter a 7 day queue.",
  "board.staking.pending.name": "Pending staking withdrawal",
  "board.staking.pending.detail.one":
    "{count} staking withdrawal waiting for the 7 day queue.",
  "board.staking.pending.detail.other":
    "{count} staking withdrawals waiting for the 7 day queue.",

  // USDC / DEX collateral items
  "board.usdc.dexCollateral.name": "{dex} collateral",
  "board.usdc.dexCollateral.detail":
    "DEX abstraction: move from {dex} to {destination}.",
  "board.usdc.dexCollateral.destination.spot": "spot",
  "board.usdc.dexCollateral.destination.perps": "main perps",
  "board.usdc.spotWallet.name": "Spot wallet",
  "board.usdc.spotWallet.detail":
    "Standard mode: spot USDC must move to perps before Arbitrum withdrawal.",
  "board.usdc.spotWallet.onHold": "Spot USDC is currently on hold.",
  "board.usdc.unifiedAccount": "Unified account",
  "board.usdc.perpsWallet": "Perps wallet",
  "board.usdc.withdraw.detail":
    "{account} USDC can be withdrawn to Arbitrum. Hyperliquid charges a {fee} withdrawal fee, so this signs {net}.",

  // Pending action labels
  "action.pending.cancel": "Cancelling...",
  "action.pending.close": "Closing...",
  "action.pending.sell": "Selling...",
  "action.pending.withdraw": "Withdrawing...",
  "action.pending.repay": "Repaying...",
  "action.pending.enable": "Enabling...",
  "action.pending.disable": "Disabling...",
  "action.pending.undelegate": "Undelegating...",
  "action.pending.transfer": "Transferring...",
  "action.settling.recheck": "Rechecking...",
  "action.settling.confirm": "Confirming...",

  // Action label overrides
  "override.switching": "Switching",
  "override.switchToArbitrum": "Switch to Arbitrum",
  "override.preparingWallet": "Preparing wallet",
  "override.connecting": "Connecting",
  "override.connectOwner": "Connect owner wallet",

  // Error titles
  "error.title.cancel": "Cancel failed",
  "error.title.close": "Close failed",
  "error.title.sell": "Sell failed",
  "error.title.vaultWithdraw": "Vault withdrawal failed",
  "error.title.repay": "Repay failed",
  "error.title.withdraw": "Withdraw failed",
  "error.title.portfolioMargin": "Portfolio margin update failed",
  "error.title.undelegate": "Undelegate failed",
  "error.title.dexTransfer": "DEX transfer failed",
  "error.title.spotUsdcTransfer": "Spot USDC transfer failed",
  "error.title.stakingWithdraw": "Staking withdrawal failed",
  "error.title.usdcWithdraw": "USDC withdrawal failed",

  // Error messages
  "error.unknown": "Unknown error.",
  "error.notOwner": "Connect the wallet that owns this Hyperliquid account.",
  "error.walletLoading":
    "Wallet connection is still loading. Try again in a moment.",
  "error.walletMissingAddress":
    "The connected wallet is missing an account address.",
  "error.wrongNetwork": "Switch to Arbitrum before approving the session wallet.",
  "error.noPositions": "There are no closeable positions.",
  "error.sessionAgentNotActive":
    "The session wallet was approved, but Hyperliquid did not report it as active yet. Try again in a moment.",

  // Success toasts
  "toast.cancelOrders.title": "Orders cancelled",
  "toast.cancelOrders.message": "Hyperliquid accepted the cancel request.",
  "toast.closePositions.title": "Position closes submitted",
  "toast.closePositions.message":
    "Reduce-only market close orders were submitted.",
  "toast.sellSpotAsset.title": "Spot sell submitted",
  "toast.sellSpotAsset.message":
    "A market sell order for {coin} was submitted.",
  "toast.withdrawVault.title": "Vault withdrawal submitted",
  "toast.withdrawVault.message": "{vault} withdrawal was submitted.",
  "toast.withdrawVault.uncertain":
    "Check your vault balance — the withdrawal may have been submitted on-chain.",
  "toast.repay.title": "Repay submitted",
  "toast.repay.message": "Full {token} borrow repayment was submitted.",
  "toast.supplyWithdraw.title": "Supply withdrawal submitted",
  "toast.supplyWithdraw.message":
    "Full {token} supply withdrawal was submitted.",
  "toast.portfolioMargin.enabled.title": "Portfolio margin enabled",
  "toast.portfolioMargin.enabled.message":
    "Portfolio margin enable request was submitted.",
  "toast.portfolioMargin.disabled.title": "Portfolio margin disabled",
  "toast.portfolioMargin.disabled.message":
    "Portfolio margin disable request was submitted.",
  "toast.undelegate.title": "Undelegate submitted",
  "toast.undelegate.message":
    "Undelegation for {amount} HYPE was submitted. We'll re-scan while it settles.",
  "toast.dexTransfer.title": "DEX transfer submitted",
  "toast.dexTransfer.message":
    "{dex} collateral transfer was submitted. We'll re-scan while it settles.",
  "toast.spotUsdc.title": "Spot USDC transfer submitted",
  "toast.spotUsdc.message":
    "Spot USDC transfer was submitted. We'll re-scan while it settles.",
  "toast.stakingWithdraw.title": "Staking withdrawal submitted",
  "toast.stakingWithdraw.message":
    "Staking withdrawal for {amount} HYPE was submitted. It enters Hyperliquid's unstaking queue.",
  "toast.usdcWithdraw.title": "USDC withdrawal submitted",
  "toast.usdcWithdraw.message": "Arbitrum withdrawal request was submitted.",
} as const;

export type MessageKey = keyof typeof en;
