const dotenv = require('dotenv');
const { ethers } = require('ethers');

// load env vars
dotenv.config({ path: './.env' });

const providerEth = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_ETH);
const providerSatVM = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_SATVM);
const providerMatic = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_MATIC);
const providerBnb = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_BNB);

let walletEth, walletSatVM, walletMatic, walletBnb;

const initializeBlockchain = async () => {
  try {
    walletEth = new ethers.Wallet(process.env.PRIVATE_KEY_ETH, providerEth);
    walletSatVM = new ethers.Wallet(process.env.PRIVATE_KEY_ETH, providerSatVM);
    walletMatic = new ethers.Wallet(process.env.PRIVATE_KEY_ETH, providerMatic);
    walletBnb = new ethers.Wallet(process.env.PRIVATE_KEY_ETH, providerBnb);
  } catch (err) {
    console.log(err);
  }
};

const getMethods = async () => {
  return {
    walletEth,
    walletSatVM,
    walletMatic,
    walletBnb,
  };
};

module.exports = {
  initializeBlockchain,
  providerEth,
  providerSatVM,
  providerMatic,
  providerBnb,
  getMethods,
};
