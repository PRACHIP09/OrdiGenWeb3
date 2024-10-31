import { isMainnetUrl } from "./helpers";

const isMainnet = isMainnetUrl();

export const UNI_SAT_API_URL = isMainnet
  ? "https://open-api.unisat.io"
  : "https://open-api-testnet.unisat.io";

// Also add chains to helpers.js
export const chains = [
  {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://eth-pokt.nodies.app",
  },
  // {
  //   chainId: 12009,
  //   name: "SatoshiVM",
  //   currency: "BTC",
  //   explorerUrl: "https://svmscan.io/",
  //   rpcUrl: "https://mainnet-rpc.satoshichain.io",
  // },
  {
    chainId: 137,
    name: "Polygon",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com",
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
  },
  {
    chainId: 56,
    name: "Binance",
    currency: "BNB",
    explorerUrl: "https://bscscan.com",
    rpcUrl: "https://bsc-pokt.nodies.app",
  },
];

export const chainsTestnet = [
  {
    chainId: 11155111,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  },
  {
    chainId: 3110,
    name: "SatoshiVM",
    currency: "BTC (SatVM)",
    explorerUrl: "https://testnet.svmscan.io",
    rpcUrl: "https://test-rpc-node-http.svmscan.io",
  },
  {
    chainId: 80001,
    name: "Polygon",
    currency: "MATIC",
    explorerUrl: "https://mumbai.polygonscan.com",
    rpcUrl: "https://polygon-mumbai-pokt.nodies.app",
  },
  {
    chainId: 97,
    name: "Binance",
    currency: "tBNB",
    explorerUrl: "https://testnet.bscscan.com",
    rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
  },
];
