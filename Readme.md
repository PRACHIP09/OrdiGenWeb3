# ETH_TO_BRC20

## LINKS

- [Mainnet](https://ordigen.tech)

- [Testnet](https://testnet.ordigen.tech)

## Supported Chains

### Testnet
- Ethereum (Sepolia)
- SatoshiVM
- Polygon (Mumbai)
- Binance

### Mainnet
- Ethereum
- Polygon
- Binance


## Adding support for chains

### Docs
- Add chains to testnet/mainnet list

### Environment
- Add RPC_URL_CHAIN in .env/.env.example/.env.testnet.example

### Backend
- Add chain to request model
- Add chainAmount to quotes model
- Initialize and export chain providers and wallets in blockchain.js
- Update getQuote method, newSwap switch (and optionally testnet/mainnet specific exclusive checks), and confirmSwap switch in swapController.js
- Update updateQuote function in sync.js

### Frontend
- Add Wallet connect chain configs in chains in constants.js
- Add to swap dropdown (and optionally testnet/mainnet specific exclusive checks) in ConnectSwap.jsx
- Any UI changes as required for visual changes