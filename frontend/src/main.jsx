import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/scss/style.scss";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";
import App from "./App.jsx";
import { isMainnetUrl } from "./utils/helpers.js";
import { chains, chainsTestnet } from "./utils/constants.js";

const projectId = "90e7c73b4f9db61c5369a2bd03c53549";

const isMainnet = isMainnetUrl();

// WC modal
const metadata = {
  name: "Ordigen",
  description: "Cross Chain Swap",
  url: "https://ordigen.tech/",
};
const metadataTestnet = {
  name: "Ordigen Testnet",
  description: "Cross Chain Swap",
  url: "https://testnet.ordigen.tech/",
};

createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: isMainnet ? metadata : metadataTestnet,
    defaultChainId: isMainnet ? chains[0].chainId : chainsTestnet[0].chainId,
    enableEIP6963: true,
    enableInjected: true,
  }),
  chains: isMainnet ? chains : chainsTestnet,
  projectId,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
