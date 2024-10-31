import React, { useEffect, useState, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import icon_1 from "../../assets/img/wallets/1.png";
import icon_2 from "../../assets/img/wallets/2.png";
import { WalletButton } from "./WalletButton";
import { ethers } from "ethers";

import {
  useDisconnect,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers5/react";
import { toast } from "react-toastify";
import { useGeneralDataContext } from "../../hooks/useGeneralDataContext";
import { EthSvg } from "../svgs/EthSvg";
import {
  defaultTokenImg,
  isMainnetUrl,
  isValidChainId,
} from "../../utils/helpers";
import { chains, chainsTestnet } from "../../utils/constants";

const walletItems = [
  {
    icon: icon_1,
    title: "MetaMask",
  },
  {
    icon: icon_2,
    title: "WalletConnect",
  },
];

export const ConnectEthWalletButton = () => {
  const isMainnet = isMainnetUrl();
  const [openModal, setOpenModal] = useState(false);
  const {
    ethAccount,
    setEthAccount,
    ethNetwork,
    networkId,
    setNetworkId,
    setNetworks,
    setEthNetwork,
    setEthBalance,
  } = useGeneralDataContext();

  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const loadWeb3 = async () => {
    // Metamask
    if (window.ethereum) {
      window.web3 = new ethers.providers.Web3Provider(window.ethereum);

      const balance = await window.web3.getBalance(ethAccount);
      // Convert balance from wei to ether
      const etherBalance = ethers.utils.formatEther(balance);
      setEthBalance(Number(etherBalance).toFixed(2));
    
      window.ethereum.on("accountsChanged", async function () {
        await connectToMetaMask();
      });
      window.ethereum.on("chainChanged", async function (networkId) {
        await connectToMetaMask();
      });
    }
  };

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let chainId = await window.ethereum.request({ method: "eth_chainId" });
      chainId = parseInt(chainId, 16);
      setNetworkId(chainId);
      // if (!isValidChainId(chainId, isMainnet, chain)) {
      //   toast(
      //     `Please switch to ${chain} ${isMainnet ? "Mainnet" : "Testnet"}`,
      //     {
      //       type: "info",
      //     }
      //   );
      //   setOpenModal(false);
      //   return;
      // }

      setEthAccount(accounts[0].toLowerCase());
      // if (chainId !== '0x1') {
      //   await window.ethereum.request({
      //     method: 'wallet_switchEthereumChain',
      //     params: [{ chainId: '0x1' }], // Mainnet chain ID
      //   });
      // }
      setOpenModal(false);
      await loadWeb3();
    } else {
      toast("No metamask wallet detected", {
        type: "error",
      });
    }
  };

  const loadWeb32 = async () => {
    // Wallet Provider
    if (walletProvider) {
      window.web3 = new ethers.providers.Web3Provider(walletProvider);
      const balance = await window.web3.getBalance(ethAccount);
      // Convert balance from wei to ether
      const etherBalance = ethers.utils.formatEther(balance);
      setEthBalance(Number(etherBalance).toFixed(2));
    }
  };

  const wcLoad = async () => {
    // const chain = ethNetwork.name;
    // if (!isValidChainId(chainId, isMainnet, chain)) {
    //   toast(`Please switch to ${chain} ${isMainnet ? "Mainnet" : "Testnet"}`, {
    //     type: "info",
    //   });
    //   setOpenModal(false);
    //   return;
    // }
    setNetworkId(chainId);
    setEthAccount(address.toLowerCase());
    setOpenModal(false);
    await loadWeb32();
  };

  const connectToWalletConnect = async () => {
    open();
  };

  const disconnectETHWallet = async () => {
    try {
      setEthAccount("");
      if (isConnected) {
        disconnect();
      }
    } catch (error) {
      toast("Error disconnecting wallet, please tyr again.", {
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (isConnected && chainId && ethNetwork && ethNetwork.name && ethAccount) {
      wcLoad();
    }
  }, [isConnected, chainId, address, ethNetwork]);

  useEffect(() => {
    if (isConnected && chainId && address) {
      wcLoad();
    }
  }, [isConnected, chainId, address]);

  useEffect(() => {
    if (networkId && ethNetwork && ethNetwork.name && ethAccount) {
      connectToMetaMask();
    }
  }, [ethNetwork]);

  useEffect(() => {
    if (isMainnet) {
      setEthNetwork({ ...chains[0], icon: `/icons/${chains[0].chainId}.svg` });
    } else {
      setEthNetwork({
        ...chainsTestnet[0],
        icon: `/icons/${chainsTestnet[0].chainId}.svg`,
      });
    }
  }, []);

  return (
    <>
      <WalletButton
        onConnect={() => setOpenModal(true)}
        onDisconnect={disconnectETHWallet}
        address={ethAccount}
        icon={
          <img
            src={ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg}
            alt='logo'
            style={{ width: "22px", height: "22px" }}
          />
        }
        className='d-inline-block primary-btn border-0'
      >
        Connect ETH Wallet
      </WalletButton>
      <Modal
        className='wallet-modal'
        centered
        size='md'
        show={openModal}
        onHide={() => setOpenModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Connect Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className='items d-grid gap-2 gap-sm-3'>
            <li
              className='d-flex align-items-center gap-2'
              onClick={() => connectToMetaMask()}
            >
              <img src={icon_1} alt='' />
              <span>MetaMask</span>
            </li>
            <li
              className='d-flex align-items-center gap-2'
              onClick={() => {
                connectToWalletConnect().then(() => {
                  setOpenModal(false);
                });
              }}
            >
              <img src={icon_2} alt='' />
              <span>WalletConnect</span>
            </li>
          </ul>
        </Modal.Body>
      </Modal>
    </>
  );
};
