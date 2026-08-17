import type { MessageKey } from "./en";

export const zh: Record<MessageKey, string> = {
  // Metadata and social previews
  "meta.title": "cp0x | Hyperliquid 资产找回",
  "meta.description":
    "查看 Hyperliquid 账户，并找回订单、头寸、金库、DEX 抵押品、现货余额、借贷和 USDC 中受限的资产。cp0x 提供的免费无许可界面。",
  "meta.socialDescription":
    "查看 Hyperliquid 账户，并找回受限的余额、金库资金、抵押品、订单、头寸和 USDC。cp0x 提供的免费无许可界面。",
  "meta.imageDescription":
    "通过一个找回流程查看受限的余额、金库资金、抵押品、订单、头寸和 USDC。",

  // Header
  "header.logoLink": "cp0x 首页",
  "header.nav.label": "cp0x 站点",
  "header.nav.permissionless": "无许可界面",
  "header.switchChain": "Arbitrum",
  "header.switchChain.switching": "切换中",
  "header.switchChain.aria": "将钱包网络切换到 Arbitrum",
  "header.switchChain.ariaPending": "正在将钱包网络切换到 Arbitrum",
  "header.connectedAddress": "已连接的钱包地址：",
  "header.disconnect": "断开连接",
  "header.disconnect.aria": "断开钱包 {address} 的连接",
  "header.connect": "连接钱包",
  "header.connecting": "连接中…",

  // Language switcher
  "language.label": "选择语言",
  "language.en": "English",
  "language.en.short": "EN",
  "language.zh": "中文",
  "language.zh.short": "中文",

  // Hero
  "hero.title": "把你的资产从 Hyperliquid 取出来。",
  "hero.subtitle":
    "如果你被 app.hyperliquid.xyz 屏蔽，可以使用这个免费界面找回卡在 Hyperliquid 上的资产。",

  // Scan form
  "scan.region": "Hyperliquid 账户扫描",
  "scan.input.label": "要扫描的 Hyperliquid 钱包地址",
  "scan.input.placeholder": "粘贴另一个钱包地址",
  "scan.button.scan": "扫描",
  "scan.button.rescan": "重新扫描",
  "scan.button.scanning": "扫描中",
  "scan.button.aria.scan": "扫描钱包中可找回的 Hyperliquid 资产",
  "scan.button.aria.rescan": "重新扫描钱包中可找回的 Hyperliquid 资产",
  "scan.button.aria.scanning": "正在扫描钱包中可找回的 Hyperliquid 资产",
  "scan.hint": "粘贴地址即可查看，或连接钱包以准备提现。",
  "scan.error.invalidAddress": "请输入有效的以太坊地址。",
  "scan.error.failed": "无法扫描该 Hyperliquid 账户。",
  "scan.error.retry": "重试",
  "scan.error.retry.aria": "重新扫描该 Hyperliquid 账户",
  "wallet.error.connection": "钱包连接失败。",

  // Screen reader status
  "status.wallet.disconnected": "钱包未连接。",
  "status.wallet.wrongNetwork":
    "钱包 {address} 连接在错误的网络上。请切换到 Arbitrum 以签署找回操作。",
  "status.wallet.connected": "钱包 {address} 已连接到 Arbitrum。",
  "status.scan.scanning": " 正在扫描 Hyperliquid 账户 {address}。",
  "status.scan.readOnly":
    " 对 {address} 的只读扫描。请连接所有者钱包以执行找回操作。",
  "status.scan.ready": " {address} 的找回操作已可用。",
  "status.action.pending": " 找回操作处理中。请在钱包中确认请求。",
  "status.action.settling": " 找回操作已提交。正在重新检查 Hyperliquid 账户。",

  // Recovery board section
  "board.eyebrow": "找回流程",
  "board.title": "按以下步骤把资产从 Hyperliquid 取出。",

  // Kanban chrome
  "kanban.step": "步骤 {step}",
  "kanban.scanning": "扫描中",
  "kanban.total": "合计：",
  "kanban.empty.title": "没有锁定的资产",
  "kanban.expand": "展开另外 {count} 项",
  "kanban.collapse": "收起",
  "kanban.expand.aria.one": "在{column}中展开另外 {count} 项",
  "kanban.expand.aria.other": "在{column}中展开另外 {count} 项",
  "kanban.collapse.aria": "收起{column}列表",
  "kanban.item.action.aria": "{action} {name} — {value}",
  "kanban.item.action.ariaNoValue": "{action} {name}",
  "kanban.group.action.aria": "{action} — {column}",

  // Toasts
  "toast.region": "通知",
  "toast.close": "关闭通知：{title}",

  // Footer
  "footer.donations": "cp0x 捐赠地址",
  "footer.social": "cp0x 社交链接",
  "footer.telegram": "cp0x 的 Telegram",
  "footer.x": "cp0x 的 X（Twitter）",
  "footer.github": "cp0x 的 GitHub",

  // Column templates
  "column.orders.title": "未成交订单",
  "column.orders.description": "永续和现货市场中的挂单与触发订单。",
  "column.orders.empty": "没有挂单占用资金。",
  "column.orders.groupAction": "全部取消",
  "column.positions.title": "未平仓头寸",
  "column.positions.description": "可能占用保证金的永续敞口。",
  "column.positions.empty": "没有占用保证金的永续头寸。",
  "column.positions.groupAction": "全部平仓",
  "column.staking.title": "质押的 HYPE",
  "column.staking.description": "需要转回现货的已委托或已解除委托的 HYPE。",
  "column.staking.empty": "没有需要解除质押的 HYPE。",
  "column.spot.title": "现货资产",
  "column.spot.description": "价值超过 $10 的非 USDC 现货余额。",
  "column.spot.empty": "没有超过找回门槛的现货资产。",
  "column.vaults.title": "金库存款",
  "column.vaults.description": "协议金库或用户金库中的存款权益。",
  "column.vaults.empty": "没有等待提取的金库存款。",
  "column.portfolioMargin.title": "组合保证金",
  "column.portfolioMargin.description":
    "现货与永续统一保证金可能产生借款或供应的资产。",
  "column.portfolioMargin.empty": "未发现组合保证金借款或供应的资产。",
  "column.withdraw.title": "从 Hyperliquid 提现",
  "column.withdraw.description": "前面步骤结算后可提取的 USDC。",
  "column.withdraw.empty": "这里没有可提取的 USDC。",

  // Column totals
  "board.total.orders.one": "{count} 个订单",
  "board.total.orders.other": "{count} 个订单",
  "board.total.positions.one": "{count} 个头寸",
  "board.total.positions.other": "{count} 个头寸",
  "board.total.items.one": "{count} 项",
  "board.total.items.other": "{count} 项",

  // Shared item actions
  "board.action.sell": "卖出",
  "board.action.withdraw": "提取",
  "board.action.locked": "已锁定",
  "board.action.repay": "还款",
  "board.action.disable": "停用",
  "board.action.undelegate": "解除委托",
  "board.action.pending": "处理中",
  "board.action.move": "转移",
  "board.action.moveToPerps": "转到永续",

  // Open orders items
  "board.orders.detail": "{orderType} {side} @ {price}",
  "board.orders.side.buy": "买入",
  "board.orders.side.sell": "卖出",
  "board.orders.type.market": "市价",
  "board.orders.type.limit": "限价",
  "board.orders.type.stopMarket": "止损市价",
  "board.orders.type.stopLimit": "止损限价",
  "board.orders.type.takeProfitMarket": "止盈市价",
  "board.orders.type.takeProfitLimit": "止盈限价",
  "board.orders.value": "{size} 挂单中",

  // Open position items
  "board.positions.detail": "{side} {size} | 未实现盈亏 {pnl}",
  "board.positions.detailNoClose":
    "{side} {size} | 未实现盈亏 {pnl} | 无法平仓",
  "board.positions.side.long": "做多",
  "board.positions.side.short": "做空",

  // Spot items
  "board.spot.detail": "{size} {coin}{hold}{unavailable}",
  "board.spot.hold": " | {size} 冻结中",
  "board.spot.noMarket": " | 无 USDC 市场",
  "board.spot.balanceOnHold": " | 余额冻结中",
  "board.spot.sellUnavailable": " | 无法卖出",

  // Vault items
  "board.vaults.detail.locked": "{date}解锁",
  "board.vaults.detail.available": "可以提取。",
  "board.vaults.detail.tooSmall": "提取金额太小。",

  // Portfolio margin items
  "board.portfolioMargin.action.needs": "需要 {token}",
  "board.tokenFallback": "代币 {id}",
  "board.portfolioMargin.borrow.name": "已借入 {token}",
  "board.portfolioMargin.borrow.detail":
    "借款本金 {basis} {token} | 可用 {available}",
  "board.portfolioMargin.supply.name": "已供应 {token}",
  "board.portfolioMargin.supply.detail": "供应本金 {basis} {token}",
  "board.portfolioMargin.mode.name": "组合保证金模式",
  "board.portfolioMargin.mode.value": "已启用",
  "board.portfolioMargin.mode.canDisable": "可以关闭组合保证金模式。",
  "board.portfolioMargin.mode.blocked": "请先清空借款和已供应的资产。",

  // Staking items
  "board.staking.delegated.name": "已委托的 HYPE",
  "board.staking.delegated.locked": "验证人 {validator} 将于 {date} 解锁。",
  "board.staking.delegated.detail":
    "先从验证人 {validator} 解除委托，再提取到现货。",
  "board.staking.undelegated.name": "已解除委托的 HYPE",
  "board.staking.undelegated.detail":
    "将已解除委托的 HYPE 从质押转到现货。Hyperliquid 的质押提取需要排队 7 天。",
  "board.staking.pending.name": "待处理的质押提取",
  "board.staking.pending.detail.one": "{count} 笔质押提取正在等待 7 天队列。",
  "board.staking.pending.detail.other": "{count} 笔质押提取正在等待 7 天队列。",

  // USDC / DEX collateral items
  "board.usdc.dexCollateral.name": "{dex} 抵押品",
  "board.usdc.dexCollateral.detail": "DEX 抽象：从 {dex} 转到{destination}。",
  "board.usdc.dexCollateral.destination.spot": "现货",
  "board.usdc.dexCollateral.destination.perps": "主永续账户",
  "board.usdc.spotWallet.name": "现货钱包",
  "board.usdc.spotWallet.detail":
    "标准模式：现货 USDC 需要先转到永续账户，才能提现到 Arbitrum。",
  "board.usdc.spotWallet.onHold": "现货 USDC 当前处于冻结状态。",
  "board.usdc.unifiedAccount": "统一账户",
  "board.usdc.perpsWallet": "永续钱包",
  "board.usdc.withdraw.detail":
    "{account}的 USDC 可以提现到 Arbitrum。Hyperliquid 收取 {fee} 的提现费用，因此本次签署金额为 {net}。",

  // Pending action labels
  "action.pending.cancel": "取消中…",
  "action.pending.close": "平仓中…",
  "action.pending.sell": "卖出中…",
  "action.pending.withdraw": "提取中…",
  "action.pending.repay": "还款中…",
  "action.pending.enable": "启用中…",
  "action.pending.disable": "停用中…",
  "action.pending.undelegate": "解除委托中…",
  "action.pending.transfer": "转移中…",
  "action.settling.recheck": "重新检查中…",
  "action.settling.confirm": "确认中…",

  // Action label overrides
  "override.switching": "切换中",
  "override.switchToArbitrum": "切换到 Arbitrum",
  "override.preparingWallet": "准备钱包中",
  "override.connecting": "连接中",
  "override.connectOwner": "连接所有者钱包",

  // Error titles
  "error.title.cancel": "取消失败",
  "error.title.close": "平仓失败",
  "error.title.sell": "卖出失败",
  "error.title.vaultWithdraw": "金库提取失败",
  "error.title.repay": "还款失败",
  "error.title.withdraw": "提取失败",
  "error.title.portfolioMargin": "组合保证金更新失败",
  "error.title.undelegate": "解除委托失败",
  "error.title.dexTransfer": "DEX 转移失败",
  "error.title.spotUsdcTransfer": "现货 USDC 转移失败",
  "error.title.stakingWithdraw": "质押提取失败",
  "error.title.usdcWithdraw": "USDC 提现失败",

  // Error messages
  "error.unknown": "未知错误。",
  "error.notOwner": "请连接拥有该 Hyperliquid 账户的钱包。",
  "error.walletLoading": "钱包连接仍在加载，请稍后再试。",
  "error.walletMissingAddress": "已连接的钱包缺少账户地址。",
  "error.wrongNetwork": "请先切换到 Arbitrum，再授权会话钱包。",
  "error.noPositions": "没有可平仓的头寸。",
  "error.sessionAgentNotActive":
    "会话钱包已授权，但 Hyperliquid 尚未将其报告为已激活。请稍后再试。",

  // Success toasts
  "toast.cancelOrders.title": "订单已取消",
  "toast.cancelOrders.message": "Hyperliquid 已接受取消请求。",
  "toast.closePositions.title": "平仓请求已提交",
  "toast.closePositions.message": "已提交只减仓的市价平仓订单。",
  "toast.sellSpotAsset.title": "现货卖单已提交",
  "toast.sellSpotAsset.message": "已提交 {coin} 的市价卖单。",
  "toast.withdrawVault.title": "金库提取已提交",
  "toast.withdrawVault.message": "已提交 {vault} 的提取请求。",
  "toast.withdrawVault.uncertain":
    "请检查金库余额 —— 该提取可能已在链上提交。",
  "toast.repay.title": "还款已提交",
  "toast.repay.message": "已提交 {token} 借款的全额还款。",
  "toast.supplyWithdraw.title": "供应资产提取已提交",
  "toast.supplyWithdraw.message": "已提交 {token} 供应资产的全额提取。",
  "toast.portfolioMargin.enabled.title": "组合保证金已启用",
  "toast.portfolioMargin.enabled.message": "已提交启用组合保证金的请求。",
  "toast.portfolioMargin.disabled.title": "组合保证金已停用",
  "toast.portfolioMargin.disabled.message": "已提交停用组合保证金的请求。",
  "toast.undelegate.title": "解除委托已提交",
  "toast.undelegate.message":
    "已提交 {amount} HYPE 的解除委托请求。结算期间我们会重新扫描。",
  "toast.dexTransfer.title": "DEX 转移已提交",
  "toast.dexTransfer.message":
    "已提交 {dex} 抵押品转移。结算期间我们会重新扫描。",
  "toast.spotUsdc.title": "现货 USDC 转移已提交",
  "toast.spotUsdc.message": "已提交现货 USDC 转移。结算期间我们会重新扫描。",
  "toast.stakingWithdraw.title": "质押提取已提交",
  "toast.stakingWithdraw.message":
    "已提交 {amount} HYPE 的质押提取，将进入 Hyperliquid 的解质押队列。",
  "toast.usdcWithdraw.title": "USDC 提现已提交",
  "toast.usdcWithdraw.message": "已提交到 Arbitrum 的提现请求。",
};
