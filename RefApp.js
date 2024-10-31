/* 
- Swap would be disabled until wallets are connected i.e. btcAddress and account has values (not null or '')
- Once wallet connected, disconnect option on button
- Validation for Taproot address (BTC wallet): check function below
- Addresses should always be sent as lowercase to APIs: .toLowerCase() {TODO}
- Cannot close modal until handlePlaceOrder is complete, if closed again handlePlaceOrder would be called from start
- Error handling: try catch {TODO}
*/

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
  useDisconnect,
} from '@web3modal/ethers5/react';

const projectId = '90e7c73b4f9db61c5369a2bd03c53549';

// Set chain
const chain = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl:
    'https://eth-mainnet.g.alchemy.com/v2/C3KpiNSWTz48Q2_oXLxojpjnhqZGPcDD',
};

// WC modal
const metadata = {
  name: 'Ordigen',
  description: 'Cross Chain Swap',
  url: 'https://ordigen.tech/',
};

createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: chain.chainId,
    enableEIP6963: true,
    enableInjected: true,
  }),
  chains: [chain],
  projectId,
});

function calculateTotalPrice(outputInscriptions) {
  let totalPrice = 0;

  outputInscriptions.forEach((inscription) => {
    const priceSatoshis = parseInt(inscription.price);

    // Convert satoshis to bitcoins
    const priceBTC = priceSatoshis / 100000000;

    totalPrice += priceBTC;
  });

  return totalPrice;
}

function isValidTaprootAddress(address) {
  const taprootRegex = /^bc1[0-9a-zA-Z]{59}$/;
  return taprootRegex.test(address);
}

// Example usage:
console.log(
  isValidTaprootAddress(
    'bc1p9zas24eqa4m6x405ltjkt3rrlcjusjlf8l8fyrgpn20prt8ktepsgdm0a3'
  )
); // Should return true
console.log(
  isValidTaprootAddress('bc1q0u0jhew7m4997lf6fdte3f3n89tkdjq7pksc5h')
); // Should return false
console.log(isValidTaprootAddress('3GC8S8NcT32KUonu7Wv57mTM9mAnqX5WGQ')); // Should return false
console.log(isValidTaprootAddress('1CcZhnvuSS8G13CA6QwqwzzkhEUGgZkiQe')); // Should return false
console.log(
  isValidTaprootAddress(
    'tb1p55qanu6m49amks2vt6dezs6xqvu8hsj2suwzxmn0us9yd60yvk6qqwe4ur'
  )
); // Should return false
console.log(
  isValidTaprootAddress('tb1q0u0jhew7m4997lf6fdte3f3n89tkdjq7tstt0y')
); // Should return false

const RefApp = () => {
  const { open } = useWeb3Modal();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();

  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(''); // eth
  const [publicKey, setPublicKey] = useState('');
  const [btcAddress, setBtcAddress] = useState(''); // btc
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState('livenet');

  // ------------------------------ ETH
  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new ethers.providers.Web3Provider(window.ethereum);

      window.ethereum.on('accountsChanged', async function () {
        await connectToMetaMask();
      });
    }
  };

  const loadWeb32 = async () => {
    if (walletProvider) {
      window.web3 = new ethers.providers.Web3Provider(walletProvider);
    }
  };

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
      // Prod
      // const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      // if (chainId !== '0x1') {
      //   await window.ethereum.request({
      //     method: 'wallet_switchEthereumChain',
      //     params: [{ chainId: '0x1' }], // Mainnet chain ID
      //   });
      // }

      await loadWeb3();
    } else {
      // notifyError('No metamask wallet detected');
    }
  };

  const wcLoad = async () => {
    if (chainId !== 1) {
      // notifyError('Please switch to Ethereum Mainnet');
    }
    setAccount(address);
    await loadWeb32();
  };

  useEffect(() => {
    if (isConnected && chainId) {
      wcLoad();
    }
  }, [isConnected, chainId, address]);

  const connectToWalletConnect = async () => {
    open();
  };

  const disconnectETHWallet = async () => {
    try {
      setAccount('');
      if (isConnected) {
        disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const disconnectBTCWallet = async () => {
    setBtcAddress('');
  };

  // ------------------------------ BTC
  const loadUnisat = async () => {
    if (window.unisat) {
      let unisat = window.unisat;

      unisat.on('accountsChanged', handleAccountsChanged);
      unisat.on('networkChanged', handleNetworkChanged);
    } else {
      // notifyError('No unisat wallet detected');
    }
  };

  const getBasicInfo = async () => {
    const unisat = window.unisat;
    const [address] = await unisat.getAccounts();
    setBtcAddress(address);

    const publicKey = await unisat.getPublicKey();
    setPublicKey(publicKey);

    const balance = await unisat.getBalance();
    setBalance(balance);

    const network = await unisat.getNetwork();
    setNetwork(network);
  };

  useEffect(() => {
    const switchNetwork = async () => {
      const network = await window.unisat?.getNetwork();
      if (network && network !== 'livenet') {
        await unisat.switchNetwork('livenet');
      }
    };
    if (connected) {
      switchNetwork();
    }
  }, [network]);

  const selfRef = useRef({
    accounts: [],
  });
  const self = selfRef.current;
  const handleAccountsChanged = (_accounts) => {
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setBtcAddress(_accounts[0]);

      loadUnisat();
      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const handleNetworkChanged = (network) => {
    setNetwork(network);
    getBasicInfo();
  };

  // -------------------- Order
  const handlePlaceOrder = async () => {
    try {
      const outputInscriptions = [
        {
          auctionId: '0l9re57k6lvzui3healcr3dks8banuco',
          amount: '1',
          price: '5000',
          tick: 'gray',
        },
      ];
      let totalPriceBTC = calculateTotalPrice(outputInscriptions);
      // Increase total price by 1%
      totalPriceBTC *= 1.01;
      console.log('Total in BTC:', totalPriceBTC);

      const quoteResp = await axios.get(
        `http://localhost:5000/api/v1/swap/quote?btcAmount=${totalPriceBTC}`
      );
      const { ethAmount } = quoteResp.data;

      console.log('Quote in ETH:', ethAmount);
      const amountWithFees = `${ethAmount.toFixed(8)}`;

      const prepResp = await axios.get(
        `http://localhost:5000/api/v1/swap/prepare`
      );
      console.log(prepResp);
      const { paymentAddress, paymentAddressIndex, recipientAddress } =
        prepResp.data;

      // Create new req
      const data = {
        userEthAddress: account,
        userBtcAddress: btcAddress,
        paymentAddress,
        paymentAddressIndex,
        amountWithFees,
        outputInscriptions,
      };
      const reqResp = await axios.post(
        `http://localhost:5000/api/v1/swap`,
        data
      );
      console.log(reqResp);

      // Handle Sign
      const ordinalsAddress = btcAddress;
      const message = `Please confirm that\nPayment Address: ${paymentAddress}\nOrdinals Address: ${ordinalsAddress}`;
      let res = await window.unisat.signMessage(message, 'bip322-simple');
      const signResp = await axios.put(
        `http://localhost:5000/api/v1/swap/sign/${reqResp.data._id}`,
        {
          signature: res,
          userAddress: ordinalsAddress,
          paymentAddress,
        }
      );
      console.log(signResp);

      // Handle Send Eth
      const signer = window.web3.getSigner();

      const amountToSend = ethers.utils.parseEther(amountWithFees);

      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: amountToSend,
      });

      const txReceipt = await tx.wait(1);
      console.log('txReceipt: ', txReceipt);
      const txHash = txReceipt.transactionHash;
      console.log('Transaction Hash:', txHash);

      // Confirm swap
      const confirmResp = await axios.put(
        `http://localhost:5000/api/v1/swap/confirm/${reqResp.data._id}`,
        {
          txHash,
        }
      );
      console.log(confirmResp);

      // Handle see Status
      window.open('http://localhost:5000/api/v1/swap/');
    } catch (e) {
      console.log(e);
    }
  };

  const unisat = window.unisat;
  return (
    <div>
      <button
        onClick={async () => {
          const result = await unisat.requestAccounts();
          handleAccountsChanged(result);
        }}
      >
        Connect Unisat Wallet
      </button>
      <button onClick={() => connectToMetaMask()}>Connect Metamask</button>
      <button onClick={() => connectToWalletConnect()}>
        Connect WalletConnect
      </button>
      {' '}BTC Address: {btcAddress} {' '} ETH Address: {account}
    </div>
  );
};

export default RefApp;
