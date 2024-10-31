const axios = require('axios');
const cron = require('node-cron');
const ethers = require('ethers');

const Token = require('../models/tokenModel');
const Quote = require('../models/quoteModel');
const Order = require('../models/orderModel');

const { getMethods, providerEth } = require('./blockchain');

const axiosInstance = axios.create({
  baseURL: process.env.UNISAT_ENDPOINT,
  headers: {
    Authorization: `Bearer ${process.env.UNISAT_API_KEY2}`,
  },
});

async function SyncData(total) {
  const limit = 200;
  let start = 0;

  while (start < total) {
    try {
      const response = await axiosInstance.get(
        `/v1/indexer/brc20/list?start=${start}&limit=${limit}`
      );

      const data = response.data.data.detail;

      for (const tick of data) {
        try {
          await Token.create({ tick });
        } catch (err) {
          // Do nothing
        }
      }

      start += 200;

      await new Promise((resolve) => setTimeout(resolve, 60000));
    } catch (error) {
      console.error('Error occurred while fetching data:', error);
      break; // Exit the loop on error
    }
  }
}

const updateQuote = async () => {
  try {
    const ads = await Quote.find();
    const ad = ads[0];
    const { getQuote } = require('../controllers/swapController');
    const { ethAmount, maticAmount, bnbAmount, usdAmount } = await getQuote();
    if (ethAmount && usdAmount) {
      if (ad) {
        await Quote.findByIdAndUpdate(ad._id, {
          ethAmount,
          maticAmount,
          bnbAmount,
          usdAmount,
          satVMAmount: '1',
        });
      } else {
        await Quote.create({
          ethAmount,
          maticAmount,
          bnbAmount,
          usdAmount,
          satVMAmount: '1',
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
};

function findIndexOfSmallestNumber(arr) {
  let smallestIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[smallestIndex]) {
      smallestIndex = i;
    }
  }
  return smallestIndex;
}

const bridgeEth = async () => {
  try {
    // Add autobriging of ETH over to relayers when ETH amount exceeds ($2k) value - according to lowest value
    // Check balance of all btc wallets and bridge $2k to the lowest balance wallet
    const bridgeUsdAmount = 2000;

    // USD comparison
    const ads = await Quote.find();
    const ad = ads[0];
    const ethPerUsd = parseFloat(ad.ethAmount) / parseFloat(ad.usdAmount);
    const ethAmount = (ethPerUsd * bridgeUsdAmount).toFixed(5);

    const { walletEth } = await getMethods();
    let balance = await providerEth.getBalance(walletEth.address);
    balance = parseFloat(ethers.utils.formatEther(balance));

    if (balance > ethAmount) {
      const paymentAccounts = JSON.parse(process.env.PAYMENT_ACCOUNTS_BTC);

      let balances = [];
      for (const account of paymentAccounts) {
        try {
          const response = await axiosInstance.get(
            `/v1/indexer/address/${account}/balance`
          );
          const { btcSatoshi, btcPendingSatoshi } = response.data.data;
          const balance = (btcSatoshi + btcPendingSatoshi) / 100000000;
          console.log(`${account} - ${balance}`);
          balances.push(balance);
        } catch (error) {
          console.error(error);
          balances.push(9999999999);
        }

        await new Promise((resolve) => setTimeout(resolve, 60000));
      }

      const smallestIndex = findIndexOfSmallestNumber(balances);
      const recipientAddress = paymentAccounts[smallestIndex];

      console.log(
        `Bridging to btc to wallet ${recipientAddress} worth ${ethAmount} ETH`
      );
      // Bridge
      const createOrderUrl = `https://exch.cx/api/create?from_currency=ETH&to_currency=BTC&to_address=${recipientAddress}&refund_address=${walletEth.address}&rate_mode=flat`;

      const { default: fetch } = await import('node-fetch');

      const response = await fetch(createOrderUrl, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest', // Mimic XHR request
          'Content-Type': 'application/json', // Add any necessary headers
        },
      });

      const data = await response.json();
      const { orderid } = data;

      const orderStatusUrl = `https://exch.cx/api/order?orderid=${orderid}`;
      const response2 = await fetch(orderStatusUrl, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest', // Mimic XHR request
          'Content-Type': 'application/json', // Add any necessary headers
        },
      });

      const data2 = await response2.json();
      const { from_addr } = data2;

      await Order.create({ orderid, ethAmount, recipientAddress, from_addr });
      console.log(
        `Sending ${ethAmount} ETH to ${from_addr} for orderid ${orderid}`
      );

      // Send eth to from_addr
      const amountToSend = ethers.utils.parseEther(`${ethAmount}`);
      const tx = await walletEth.sendTransaction({
        to: from_addr,
        value: amountToSend,
      });
      console.log('Transaction sent:', tx.hash);
    }
  } catch (err) {
    console.error('Bridging error', err);
  }
};

const startSyncing = async () => {
  // Schedule the SyncData function to run every 12 hours
  cron.schedule('0 0 */12 * * *', async () => {
    console.log('Sync started successfully');
    const response = await axiosInstance.get(
      `/v1/indexer/brc20/list?start=0&limit=2`
    );
    const total = response.data.data.total;
    try {
      await SyncData(total);
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error occurred during sync:', error);
    }
  });
  // Schedule the updateQuote function to run every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    await updateQuote();
  });

  // Schedule the bridgeEth function to run every 50 minutes
  cron.schedule('0 */50 * * * *', async () => {
    if (process.env.UNISAT_ENDPOINT.indexOf('testnet') !== -1) {
      // Testnet
    } else {
      // Mainnet
      await bridgeEth();
    }
  });
};

module.exports = startSyncing;
