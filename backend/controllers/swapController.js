const dotenv = require("dotenv");
const axios = require("axios");
const bitcoin = require("bitcoinjs-lib");
const ethers = require("ethers");
const { ECPairFactory, networks } = require("ecpair");
const ecc = require("tiny-secp256k1");
const crypto = require("crypto");

const Request = require("../models/requestModel");
const Token = require("../models/tokenModel");
const Quote = require("../models/quoteModel");
const Order = require("../models/orderModel");
const {
  providerEth,
  providerSatVM,
  providerMatic,
  providerBnb,
  getMethods,
} = require("../config/blockchain");

const { createLock } = require("../utils/SimpleLock");
const { whitelist } = require("../middleware/whitelist");

// load env vars
dotenv.config({ path: "./.env" });

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const paymentAccounts = JSON.parse(process.env.PAYMENT_ACCOUNTS_BTC);

const axiosInstance = axios.create({
  baseURL: process.env.UNISAT_ENDPOINT,
  headers: {
    Authorization: `Bearer ${process.env.UNISAT_API_KEY}`,
  },
});

function sign(data) {
  return crypto
    .createHmac("sha256", process.env.FIXED_FLOAT_API_SECRET)
    .update(data)
    .digest("hex");
}

// async function request(method, params = {}) {
//   const url = 'https://fixedfloat.com/api/v2/' + method;
//   const data = JSON.stringify(params);
//   const headers = {
//     'X-API-KEY': process.env.FIXED_FLOAT_API_KEY,
//     'X-API-SIGN': sign(data),
//     'Content-Type': 'application/json; charset=UTF-8',
//   };

//   try {
//     const response = await axios.post(url, data, { headers });
//     return response.data;
//   } catch (error) {
//     throw new Error(`Error making request: ${error.message}`);
//   }
// }

const getQuote = async (btcAmount = 1) => {
  try {
    // Fixed float
    // const METHOD = 'price';
    // const DATA = {
    //   fromCcy: 'BTC',
    //   toCcy: 'ETH',
    //   amount: 1,
    //   direction: 'from',
    //   type: 'fixed',
    // };
    // const result = await request(METHOD, DATA);
    // console.log(result);
    // const exchangeRate = parseFloat(result.data.to.amount);
    // const ethAmount = btcAmount * exchangeRate;
    // const usdAmount = parseFloat(result.data.to.usd);

    // Coingecko
    const result = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,matic-network,binancecoin&vs_currencies=usd,btc"
    );
    const {
      bitcoin,
      ethereum,
      "matic-network": maticNetwork,
      binancecoin,
    } = result.data;

    const ethAmount = (1 / ethereum.btc) * btcAmount;
    const maticAmount = (1 / maticNetwork.btc) * btcAmount;
    const bnbAmount = (1 / binancecoin.btc) * btcAmount;
    const usdAmount = bitcoin.usd * btcAmount;

    return { ethAmount, maticAmount, bnbAmount, usdAmount };
  } catch (error) {
    console.error(error);
  }
};

exports.getQuote = async (btcAmount = 1) => {
  try {
    return getQuote(btcAmount);
  } catch (error) {
    console.error(error);
  }
};

function calculateTotalPrice(data) {
  let totalPrice = 0;

  data.outputInscriptions.forEach((inscription) => {
    const priceSatoshis = parseInt(inscription.price);

    // Convert satoshis to bitcoins
    const priceBTC = priceSatoshis / 100000000;

    totalPrice += priceBTC;
  });

  return totalPrice;
}

function tapTweakHash(pubKey, h) {
  return bitcoin.crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  );
}

const toXOnly = (pubKey) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

function tweakSigner(signer, opts = {}) {
  let privateKey = signer.privateKey;
  if (!privateKey) {
    throw new Error("Private key is required for tweaking signer!");
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
  );
  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key!");
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

exports.getDetails = async (req, res) => {
  const paymentAccounts = JSON.parse(process.env.PAYMENT_ACCOUNTS_BTC);
  const ads = await Request.find();
  let balances = [];
  for (const account of paymentAccounts) {
    const tx = ads.filter((ad) => {
      return ad.paymentAddress.toLowerCase() == account.toLowerCase();
    });
    const successTx = tx.filter((ad) => {
      return ad.status === "Completed";
    });
    try {
      const response = await axiosInstance.get(
        `/v1/indexer/address/${account}/balance`
      );
      const { btcSatoshi, btcPendingSatoshi } = response.data.data;
      const balance = (btcSatoshi + btcPendingSatoshi) / 100000000;

      balances.push(
        `Relayer ${account} - ${balance} BTC - ${tx.length} Total Requests - ${successTx.length} Successful Requests`
      );
    } catch (error) {
      console.error(error);
      balances.push(
        `Relayer ${account} - ERROR BTC - ${tx.length} Total Requests - ${successTx.length} Successful Requests`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  res.status(200).json(balances);
};

exports.quote = async (req, res) => {
  const ad = await Quote.find();

  res.status(200).json(ad[0]);
};

exports.getOrders = async (req, res) => {
  const ads = await Order.find();

  res.status(200).json(ads);
};

const readLock = createLock("read");
exports.prepareSwap = async (req, res) => {
  await readLock.acquire();
  // Find the latest req and return the next payment address
  const mostRecentRequest = await Request.findOne().sort({ createdAt: -1 });

  if (mostRecentRequest) {
    const index =
      (mostRecentRequest.paymentAddressIndex + 1) % paymentAccounts.length;
    res.status(200).json({
      paymentAddress: paymentAccounts[index],
      paymentAddressIndex: index,
      recipientAddress: process.env.ETH_ADDRESS,
    });
  } else {
    // No reqs. return the 1st address
    res.status(200).json({
      paymentAddress: paymentAccounts[0],
      paymentAddressIndex: 0,
      recipientAddress: process.env.ETH_ADDRESS,
    });
  }

  readLock.release();
};

exports.newSwap = async (req, res) => {
  let { chain } = req.body;
  if (!chain) chain = "Ethereum";

  // Mainnet exclusive check
  if (
    process.env.UNISAT_ENDPOINT.indexOf("testnet") === -1 &&
    chain === "SatoshiVM"
  ) {
    return res.status(401).json("Invalid chain");
  }

  let totalPriceBTC = calculateTotalPrice(req.body);
  // Increase total price by 1%
  totalPriceBTC *= 1.01;
  console.log("Total in BTC:", totalPriceBTC);

  const ad = await Quote.find();
  let toPayAmount;
  switch (chain) {
    case "Ethereum":
      toPayAmount = parseFloat(ad[0].ethAmount) * parseFloat(totalPriceBTC);
      break;
    case "SatoshiVM":
      toPayAmount = parseFloat(ad[0].satVMAmount) * parseFloat(totalPriceBTC);
      break;
    case "Polygon":
      toPayAmount = parseFloat(ad[0].maticAmount) * parseFloat(totalPriceBTC);
      break;
    case "Binance":
      toPayAmount = parseFloat(ad[0].bnbAmount) * parseFloat(totalPriceBTC);
      break;
    default:
      return res.status(401).json("Invalid chain");
  }

  if (
    parseFloat(toPayAmount.toFixed(8)) > parseFloat(req.body.amountWithFees)
  ) {
    return res.status(401).json("Conversion rate changed, please try again");
  }
  const ad2 = await Request.create(req.body);
  res.status(200).json(ad2);
};

exports.signSwap = async (req, res) => {
  const { signature, userAddress, paymentAddress } = req.body;
  const data0 = {
    btcAddress: paymentAddress,
    nftAddress: userAddress,
    sign: signature,
  };
  const resp = await axiosInstance.post("/v3/market/brc20/auction/bind", data0);
  console.log(data0, resp.data);
  if (resp.data.msg != "ok") {
    return res.status(401).json("Cannot buy, try again");
  }
  const ad = await Request.findByIdAndUpdate(
    req.params.id,
    { status: "Signed" },
    {
      new: true,
    }
  );
  return res.status(200).json(ad);
};

exports.cancelSwap = async (req, res) => {
  const ad = await Request.findByIdAndUpdate(
    req.params.id,
    { status: "Cancelled" },
    {
      new: true,
    }
  );
  return res.status(200).json(ad);
};

// Create an array to store locks
const locks = Array.from({ length: paymentAccounts.length }, (_, index) =>
  createLock(`request${index + 1}`)
);
exports.confirmSwap = async (req, res) => {
  const { txHash } = req.body;
  if (!txHash) {
    return res
      .status(401)
      .json("Invalid request, No txHash was provided, contact support");
  }

  const request = await Request.findById(req.params.id);

  const { walletEth, walletSatVM, walletMatic, walletBnb } = await getMethods();
  let provider, wallet;
  switch (request.chain) {
    case "Ethereum":
      provider = providerEth;
      wallet = walletEth;
      break;
    case "SatoshiVM":
      provider = providerSatVM;
      wallet = walletSatVM;
      break;
    case "Polygon":
      provider = providerMatic;
      wallet = walletMatic;
      break;
    case "Binance":
      provider = providerBnb;
      wallet = walletBnb;
      break;
    default:
      return res.status(401).json("Invalid chain");
  }

  let fetchedTx = await provider.getTransaction(txHash);
  if (!fetchedTx) {
    console.log("Pause 1 for 10 seconds");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    fetchedTx = await provider.getTransaction(txHash);
  }
  if (!fetchedTx) {
    console.log("Pause 2 for 10 seconds");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    fetchedTx = await provider.getTransaction(txHash);
  }
  if (!fetchedTx) {
    return res.status(401).json("Cannot get the transaction, contact support");
  }

  // Log the fetched transaction details
  console.log("Fetched Transaction:", fetchedTx);

  const fromAddress = fetchedTx.from.toLowerCase();
  const valueTransferred = ethers.utils.formatEther(fetchedTx.value);

  if (
    request.userEthAddress != fromAddress ||
    parseFloat(request.amountWithFees) != parseFloat(valueTransferred)
  ) {
    return res.status(401).json("Invalid request");
  }
  if (request.status != "Signed" && request.status != "Payment Received") {
    return res.status(401).json("Invalid request");
  }

  const ad = await Request.findByIdAndUpdate(
    request._id,
    { status: "Payment Received", txHash },
    {
      new: true,
    }
  );

  res.status(200).json(ad);

  const utxoNetwork =
    process.env.UNISAT_ENDPOINT == "https://open-api.unisat.io"
      ? networks.bitcoin
      : networks.testnet;

  const pks = JSON.parse(process.env.PRIVATE_KEYS_BTC);
  const walletIndex = request.paymentAddressIndex;
  const keyPair = ECPair.fromWIF(pks[walletIndex], utxoNetwork);

  const paymentAddress = request.paymentAddress;
  const userAddress = request.userBtcAddress;
  const myPubKey = keyPair.publicKey.toString("hex");

  let newOutIns = request.outputInscriptions;
  const tweakedSigner = tweakSigner(keyPair, utxoNetwork);
  let successfulCounts = 0;

  const type = request.type;

  for (let index = 0; index < request.outputInscriptions.length; index++) {
    try {
      // pause execution with lock
      // Check wallet index and acquire the corresponding lock
      if (walletIndex >= 0 && walletIndex < locks.length) {
        await locks[walletIndex].acquire();
      } else {
        console.error("Invalid wallet index");
        break;
      }

      const outputInscription = request.outputInscriptions[index];
      const data2 = {
        auctionId: outputInscription.auctionId,
        bidPrice: outputInscription.price,
        address: paymentAddress,
        pubkey: myPubKey,
      };
      const response2 = await axiosInstance.post(
        `v3/market/${type}/auction/create_bid_prepare`,
        data2
      );
      console.log(data2, response2.data);
      if (response2.data.msg != "ok") {
        console.error("Cannot buy");
        continue;
      }
      if (response2.data.data.availableBalance == 0) {
        // Delay of 120 seconds
        await new Promise((resolve) => setTimeout(resolve, 120000));
        index--;
        continue;
      }
      const data3 = {
        auctionId: outputInscription.auctionId,
        bidPrice: outputInscription.price,
        address: paymentAddress,
        pubkey: myPubKey,
        feeRate: response2.data.data.feeRate + 10,
        nftAddress: userAddress,
      };
      const response3 = await axiosInstance.post(
        `v3/market/${type}/auction/create_bid`,
        data3
      );
      console.log(data3, response3.data);
      if (response3.data.msg != "ok") {
        console.error("Cannot buy");
        continue;
      }
      // Confirm bid and store txid
      const psbt = bitcoin.Psbt.fromHex(response3.data.data.psbtBid, {
        network: utxoNetwork,
      });
      psbt.signAllInputs(tweakedSigner);
      const finalizedPsbtBase64 = psbt.toBase64();

      const data4 = {
        auctionId: outputInscription.auctionId,
        bidId: response3.data.data.bidId,
        psbtBid: finalizedPsbtBase64,
        fromBase64: true,
        psbtBid2: "",
        psbtSettle: "",
      };
      const response4 = await axiosInstance.post(
        `v3/market/${type}/auction/confirm_bid`,
        data4
      );
      console.log(data4, response4.data);
      if (response4.data.msg != "ok") {
        console.error("Cannot buy");
        continue;
      }

      newOutIns[index] = {
        txid: response4.data.data.txid,
        // Include the original properties
        auctionId: newOutIns[index].auctionId,
        amount: newOutIns[index].amount,
        price: newOutIns[index].price,
        tick: newOutIns[index].tick,
      };
      successfulCounts++;
      await new Promise((resolve) => setTimeout(resolve, 60000));
    } catch (err) {
      console.error(err);
    } finally {
      // release lock
      // Check wallet index and release the corresponding lock
      if (walletIndex >= 0 && walletIndex < locks.length) {
        locks[walletIndex].release();
      } else {
        console.error("Invalid wallet index");
        break;
      }
    }
  }

  if (successfulCounts === request.outputInscriptions.length) {
    await Request.findByIdAndUpdate(
      request._id,
      { status: "Completed", outputInscriptions: newOutIns },
      {
        new: true,
      }
    );
  } else if (successfulCounts === 0) {
    // Do something when failed: refund
    const recipientAddress = request.userEthAddress;
    const amountToSend = ethers.utils.parseEther(`${request.amountWithFees}`);
    let refundTxHash = "";
    try {
      const tx = await wallet.sendTransaction({
        to: recipientAddress,
        value: amountToSend,
      });
      console.log("Transaction sent:", tx.hash);
      refundTxHash = tx.hash;
    } catch (error) {
      console.error("Error sending transaction:", error);
    }

    await Request.findByIdAndUpdate(
      request._id,
      { status: "Failed", outputInscriptions: newOutIns, refundTxHash },
      {
        new: true,
      }
    );
  } else {
    // Do something when partially failed
    await Request.findByIdAndUpdate(
      request._id,
      { status: "Partially Completed", outputInscriptions: newOutIns },
      {
        new: true,
      }
    );
  }

  console.info(
    `Finished processing for ${request._id}. ETH Address ${request.userEthAddress}. BTC Address: ${request.userBtcAddress}`
  );
};

let filter = {
  status: { $nin: ["Pending", "Signed"] },
};

exports.getSwaps = async (req, res) => {
  let { page, size, type, chain } = req.query;

  if (!page || page <= 0) page = 1;
  if (!size || size <= 0) size = 10;
  if (!chain) chain = "Ethereum";
  const skip = (page - 1) * size;
  const limit = parseInt(size);

  if (type) filter.type = type;
  filter.chain = chain;

  const ads = await Request.find(filter)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).json(ads);
};

exports.getSwapById = async (req, res) => {
  const ad = await Request.findById(req.params.id);
  if (!ad) return res.status(404).json("No such Requests found");
  res.status(200).json(ad);
};

exports.getSwapsByUser = async (req, res) => {
  let { page, size, type, chain } = req.query;

  if (!page || page <= 0) page = 1;
  if (!size || size <= 0) size = 10;
  if (!chain) chain = "Ethereum";
  const skip = (page - 1) * size;
  const limit = parseInt(size);

  if (type) filter.type = type;
  filter.chain = chain;

  const ads = await Request.find({
    ...filter,
    userEthAddress: req.params.walletAddress,
  })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).json(ads);
};

exports.getTokens = async (req, res) => {
  let { page, size } = req.query;

  if (!page || page <= 0) page = 1;
  if (!size || size <= 0) size = 10;
  const skip = (page - 1) * size;
  const limit = parseInt(size);

  const ads = await Token.aggregate([
    {
      $addFields: {
        hasImg: { $ne: ["$image", ""] }, // Add a field indicating if img is not empty
      },
    },
    {
      $sort: {
        hasImg: -1, // Sort by hasImg field, -1 for descending (true first)
        updatedAt: 1, // Secondary sorting by updatedAt ascending
      },
    },
  ])
    .skip(skip)
    .limit(limit);

  res.status(200).json(ads);
};

exports.searchTokens = async (req, res) => {
  let { q, page, size } = req.query;

  if (!page || page <= 0) page = 1;
  if (!size || size <= 0) size = 10;
  if (!q) q = "";
  const skip = (page - 1) * size;
  const limit = parseInt(size);

  const coms = await Token.aggregate([
    {
      $match: {
        tick: { $regex: q, $options: "i" }, // Filter documents by tick field matching the regex
      },
    },
    {
      $addFields: {
        hasImg: { $ne: ["$image", ""] }, // Add a field indicating if img is not empty
      },
    },
    {
      $sort: {
        hasImg: -1, // Sort by hasImg field, -1 for descending (true first)
        updatedAt: 1, // Secondary sorting by updatedAt ascending
      },
    },
  ])
    .skip(skip)
    .limit(limit);

  res.status(200).json(coms);
};

exports.getWhitelist = async (req, res) => {
  res.status(200).json(whitelist);
};
