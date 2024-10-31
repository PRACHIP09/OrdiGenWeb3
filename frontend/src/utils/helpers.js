import icon_9 from "../assets/img/icon/9.svg";
import { chains, chainsTestnet } from "./constants";

const BTC_TO_SAT = 100000000;

export function isMainnetUrl() {
  return (
    !window.location.href.includes("localhost") &&
    !window.location.href.includes("testnet")
  );
}

let chainIdsMap = {};
chains.forEach((chain) => {
  chainIdsMap[chain.name] = chain.chainId;
});

let chainIdsMapTestnet = {};
chainsTestnet.forEach((chain) => {
  chainIdsMapTestnet[chain.name] = chain.chainId;
});

export function isValidChainId(chainId, isMainnet = false, chain = "Ethereum") {
  if (isMainnet) {
    if (chainId !== chainIdsMap[chain]) {
      return false;
    }
  } else {
    if (chainId !== chainIdsMapTestnet[chain]) {
      return false;
    }
  }
  return true;
}

export const satoshisToBtc = (satoshis) => satoshis / BTC_TO_SAT;
export const btcToSatoshis = (btc) => btc * BTC_TO_SAT;

export const anyToBtc = (any, chain = "Ethereum", dataConversion) => {
  const { ethAmount, maticAmount, bnbAmount, satVMAmount } = dataConversion;
  let exchangeRate = 0;
  switch (chain) {
    case "Ethereum":
      exchangeRate = ethAmount;
      break;
    case "SatoshiVM":
      exchangeRate = satVMAmount;
      break;
    case "Polygon":
      exchangeRate = maticAmount;
      break;
    case "Binance":
      exchangeRate = bnbAmount;
      break;
    default:
      exchangeRate = ethAmount;
      break;
  }
  return any / exchangeRate;
};

export const btcToAny = (btc, chain = "Ethereum", dataConversion) => {
  const { ethAmount, maticAmount, bnbAmount, satVMAmount } = dataConversion;
  let exchangeRate = 0;
  switch (chain) {
    case "Ethereum":
      exchangeRate = ethAmount;
      break;
    case "SatoshiVM":
      exchangeRate = satVMAmount;
      break;
    case "Polygon":
      exchangeRate = maticAmount;
      break;
    case "Binance":
      exchangeRate = bnbAmount;
      break;
    default:
      exchangeRate = ethAmount;
      break;
  }
  return btc * exchangeRate;
};

export const btcToEth = (btc, btc_to_eth = 19) => btc * btc_to_eth;

export const ethToBtc = (eth, btc_to_eth = 19) => eth / btc_to_eth;

export const btcToUsd = (btc, btc_to_usd = 49_000) => btc * btc_to_usd;

export const usdToBtc = (usd, btc_to_usd = 49_000) => usd / btc_to_usd;

export const showAddress = (address) =>
  address
    ? `${address.substring(0, 6)}...${address.substring(
        address.length - 6,
        address.length
      )}`
    : "";

export function numberWithCommas(x) {
  if (!x) return 0;

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const defaultTokenImg = icon_9;

export function calculateTotalPrice(outputInscriptions) {
  let totalPrice = 0;

  outputInscriptions.forEach((inscription) => {
    const priceSatoshis = parseInt(inscription.price);

    // Convert satoshis to bitcoins
    const priceBTC = priceSatoshis / 100000000;

    totalPrice += priceBTC;
  });

  return totalPrice;
}

export function isValidTaprootAddress(address) {
  const isMainnet = isMainnetUrl();
  const taprootRegex = isMainnet
    ? /^bc1[0-9a-zA-Z]{59}$/
    : /^tb1[0-9a-zA-Z]{59}$/;
  return taprootRegex.test(address);
}

export function getMaxIndexByStatus(status) {
  let maxIndexActive = 0;
  if (status === "Pending") {
    maxIndexActive = 0;
  } else if (status === "Payment Received") {
    maxIndexActive = 1;
  } else if (status === "Completed") {
    maxIndexActive = 4;
  } else {
    maxIndexActive = -1;
  }
  return maxIndexActive;
}
