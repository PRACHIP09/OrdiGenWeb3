import React, { useEffect, useRef, useState } from "react";
import { WalletButton } from "./WalletButton";
import { useGeneralDataContext } from "../../hooks/useGeneralDataContext";
import { BtcSvg } from "../svgs/BtcSvg";
import { isMainnetUrl, isValidTaprootAddress } from "../../utils/helpers";
import { toast } from "react-toastify";

export const ConnectBtcWallet = () => {
  const isMainnet = isMainnetUrl();

  const [connected, setConnected] = useState(false);
  const [network, setNetwork] = useState(isMainnet ? "livenet" : "testnet");
  const [accounts, setAccounts] = useState([]);
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const { btcAccount, setBtcAccount } = useGeneralDataContext();

  useEffect(() => {
    if (btcAccount && !isValidTaprootAddress(btcAccount) && connected) {
      toast("Please use Taproot BTC address");
    }
  }, [btcAccount, connected]);

  const loadUnisat = async () => {
    if (window.unisat) {
      let unisat = window.unisat;

      unisat.on("accountsChanged", handleAccountsChanged);
      unisat.on("networkChanged", handleNetworkChanged);
    } else {
      toast("No unisat wallet detected", {
        type: "error",
      });
    }
  };

  const getBasicInfo = async () => {
    const unisat = window.unisat;
    const [address] = await unisat.getAccounts();
    setBtcAccount(address.toLowerCase());

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
      if (isMainnet) {
        if (network && network !== "livenet") {
          await unisat.switchNetwork("livenet");
        }
      } else {
        if (network && network !== "testnet") {
          await unisat.switchNetwork("testnet");
        }
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
      setBtcAccount(_accounts[0].toLowerCase());
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setBtcAccount(_accounts[0].toLowerCase());

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

  const disconnectBTCWallet = async () => {
    setBtcAccount("");
  };

  return (
    <WalletButton
      onConnect={async () => {
        const unisat = window.unisat;
        const result = await unisat.requestAccounts();
        handleAccountsChanged(result);
      }}
      onDisconnect={disconnectBTCWallet}
      address={btcAccount}
      icon={<BtcSvg />}
      className='d-inline-block primary-btn border-0'
    >
      Connect BTC Wallet
    </WalletButton>
  );
};
