import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ethers } from "ethers";
import { toast } from "react-toastify";

import { chains, chainsTestnet } from "../utils/constants";
import { anyToBtc, isMainnetUrl, isValidChainId } from "../utils/helpers";

import { SelectTokenModal } from "./Dashboard/SelectTokenModal";
import { SwapProgressModal } from "./Dashboard/SwapProgressModal";
import { SelectNetworkModal } from "./Dashboard/SelectNetworkModal";
import { SwapConfirmationModal } from "./Dashboard/SwapConfirmationModal";
import {
  btcToUsd,
  calculateTotalPrice,
  defaultTokenImg,
  isValidTaprootAddress,
  showAddress,
} from "../utils/helpers";
import { useGeneralDataContext } from "../hooks/useGeneralDataContext";
import { backendAxios } from "../utils/axiosInstances";
import { useQueryClient } from "react-query";
import { useGetTokenConversionState } from "../hooks/useGetTokenConversionState";

const ConnectSwap = ({
  selectedToken,
  onSelectToken,
  amount,
  onChangeAmount,
  selectedListItem,
  onSelectListItem,
  isLoadingList,
}) => {
  const [openSelectNetworkModal, setOpenSelectNetworkModal] = useState(false);
  const [openSelectTokenModal, setOpenSelectTokenModal] = useState(false);
  const [openSwapProgressModal, setOpenSwapProgressModal] = useState(false);
  const [openSwapConfirmationModal, setOpenSwapConfirmationModal] =
    useState(false);

  const [transactionHash, setTransactionHash] = useState("");

  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const [validChainId, setValidChainId] = useState(false);

  const {
    ethAccount,
    btcAccount,
    ethNetwork,
    setEthNetwork,
    networkId,
    setNetworkId,
    networks,
    setNetworks,
    ethBalance,
    setEthBalance,
  } = useGeneralDataContext();

  const { data: dataConversion, isLoading: isLoadingConversion } =
    useGetTokenConversionState();

  const onResetValues = () => {
    onChangeAmount("");
    onSelectToken(null);
    onSelectListItem(null);
  };

  const handleSelectToken = (item) => {
    setOpenSelectTokenModal(false);
    onSelectToken(item);
  };

  const insufficientFunds = ethBalance < parseFloat(amount);
  const usdAmount = btcToUsd(
    anyToBtc(
      amount,
      ethNetwork?.name ? ethNetwork.name : "Ethereum",
      dataConversion ? dataConversion : { ethAmount: 19 }
    ),
    dataConversion?.usdAmount
  ).toFixed(2);
  const maxUsdAmountCondition = usdAmount > 2000;

  useEffect(() => {
    if (networkId) {
      setValidChainId(
        isValidChainId(
          networkId,
          isMainnetUrl(),
          ethNetwork?.name ? ethNetwork.name : "Ethereum"
        )
      );
    }
  }, [networkId, ethNetwork]);

  const renderTooltip = (props) => {
    let text = null;

    if (!btcAccount) {
      text = "Please connect BTC wallet";
    } else if (!ethAccount) {
      text = "Please connect ETH wallet";
    } else if (!selectedToken) {
      text = "Please select a token";
    } else if (amount === "" && !selectedListItem) {
      text = "Please enter an amount";
    } else if (!selectedListItem) {
      text = "Please select a order to place";
    } else if (!isValidTaprootAddress(btcAccount)) {
      text = "Please use a Taproot BTC address";
    } else if (maxUsdAmountCondition) {
      text = "Max buy limit is $2000";
    } else if (!validChainId) {
      text = `You need to switch to ${ethNetwork.name} ${isMainnetUrl() ? "Mainnet" : "Testnet"
        }`;
    } else if (insufficientFunds) {
      text = "Insufficient ETH balance";
    }

    return (
      <Tooltip id='button-tooltip' {...props}>
        {text}
      </Tooltip>
    );
  };

  const renderSwapButton = () => {
    const validBtcAddress = isValidTaprootAddress(btcAccount);

    const button = (
      <div className='buy-connect-btn'>
        <Button
          onClick={() => setOpenSwapConfirmationModal(true)}
          className='primary-btn border-0 cursor-pointer'
          disabled={
            amount === "" ||
            !validChainId ||
            !selectedListItem ||
            isLoadingList ||
            !btcAccount ||
            !ethAccount ||
            !validBtcAddress ||
            insufficientFunds ||
            maxUsdAmountCondition
          }
        >
          Swap
        </Button>
      </div>
    );

    if (
      amount > 0 &&
      selectedListItem &&
      selectedToken &&
      btcAccount &&
      ethAccount &&
      validBtcAddress &&
      !insufficientFunds &&
      validChainId
    )
      return button;

    return (
      <OverlayTrigger placement='top' overlay={renderTooltip}>
        {button}
      </OverlayTrigger>
    );
  };

  const queryClient = useQueryClient();

  const handlePlaceOrder = async () => {
    try {
      setIsLoadingOrder(true);
      const outputInscriptions = [
        {
          auctionId: selectedListItem.auctionId,
          amount: selectedListItem.amount,
          price: selectedListItem.price,
          tick: selectedListItem.tick,
        },
      ];
      let totalPriceBTC = calculateTotalPrice(outputInscriptions);
      // Increase total price by 1%
      totalPriceBTC *= 1.01;

      const quoteResp = await backendAxios.get(`/api/v1/swap/quote`, {
        params: {
          btcAmount: 1,
        },
      });
      const { ethAmount, maticAmount, bnbAmount, satVMAmount } = quoteResp.data;
      let exchangeRate = 0;
      switch (ethNetwork?.name) {
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
      const totalPriceInEth = totalPriceBTC * exchangeRate;

      console.log("Quote in ETH:", totalPriceInEth);
      const amountWithFees = `${totalPriceInEth.toFixed(8)}`;

      const prepResp = await backendAxios.get(`/api/v1/swap/prepare`);
      console.log(prepResp);
      const { paymentAddress, paymentAddressIndex, recipientAddress } =
        prepResp.data;

      // Create new req
      const data = {
        userEthAddress: ethAccount,
        userBtcAddress: btcAccount,
        paymentAddress,
        paymentAddressIndex,
        amountWithFees,
        outputInscriptions,
        chain: ethNetwork.name,
      };
      const reqResp = await backendAxios.post(`/api/v1/swap`, data);
      console.log(reqResp);

      // Handle Sign
      const ordinalsAddress = btcAccount;
      const message = `Please confirm that\nPayment Address: ${paymentAddress}\nOrdinals Address: ${ordinalsAddress}`;
      let res = await window.unisat.signMessage(message, "bip322-simple");
      const signResp = await backendAxios.put(
        `/api/v1/swap/sign/${reqResp.data._id}`,
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
      console.log("txReceipt: ", txReceipt);
      const txHash = txReceipt.transactionHash;
      setTransactionHash(txHash);
      console.log("Transaction Hash:", txHash);

      // Confirm swap
      const confirmResp = await backendAxios.put(
        `/api/v1/swap/confirm/${reqResp.data._id}`,
        {
          txHash,
        }
      );
      console.log(confirmResp);

      // Handle see Status
      // window.open("http://localhost:5000/api/v1/swap/");

      setOpenSwapProgressModal(true);
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    } catch (e) {
      toast(e.message, {
        type: "error",
      });
      console.log(e);
    } finally {
      setIsLoadingOrder(false);
      setOpenSwapConfirmationModal(false);
    }
  };

  const handleNetwork = (chainId) => {
    setOpenSelectNetworkModal(false);
    setEthNetwork(networks.find((network) => network.chainId == chainId));
  };

  useEffect(() => {
    if (isMainnetUrl()) {
      setNetworks(
        chains.map((chain) => ({
          ...chain,
          icon: `/icons/${chain.chainId}.svg`,
        }))
      );
    } else {
      setNetworks(
        chainsTestnet.map((chain) => ({
          ...chain,
          icon: `/icons/${chain.chainId}.svg`,
        }))
      );
    }
  }, [isMainnetUrl, setNetworks]);

  return (
    <>
      <div className='buy-connect mx-auto'>
        <div className='buy-connect-single'>
          <div className='d-flex justify-content-between'>
            <div
              className='buy-connect-single-left flex-grow-1'
              style={{ maxWidth: 190 }}
            >
              <p>Spend Amount</p>
              <input
                type='number'
                className='d-block bg-transparent border-0 p-0 w-100'
                placeholder='0'
                value={amount}
                onChange={(e) => onChangeAmount(e.target.value)}
              />
              {isLoadingConversion || !Boolean(amount) ? null : (
                <span>${usdAmount}</span>
              )}
            </div>
            <div
              className='buy-connect-single-right d-flex justify-content-end align-items-end flex-column'
              style={{ width: 450 }}
            >
              <div className='buy-network d-flex align-items-center justify-content-center gap-2'>
                <Button
                  onClick={() => setOpenSelectNetworkModal(true)}
                  className='buy-exchange my-0'
                >
                  {ethNetwork ? (
                    <>
                      <img
                        src={
                          ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg
                        }
                        alt=''
                      />
                      <span>{ethNetwork?.currency ?? "ETH"}</span>
                    </>
                  ) : (
                    <div className='d-flex opacity-50 lh-1'>Select Token</div>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <p className='balance text-end'>Balance: {validChainId ? ethBalance : '-'}</p>
        </div>

        <div className='buy-connect-single d-flex justify-content-between align-items-center'>
          <button className='data-icon d-flex align-items-center justify-content-center'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g clipPath='url(#clip0_1_1847)'>
                <path
                  d='M1.61906 11.8332C1.29504 11.8332 1.00426 12.0322 0.886792 12.3341C0.769329 12.6361 0.849282 12.9792 1.08813 13.1982L7.37384 18.96C7.60352 19.1706 7.93593 19.2255 8.22114 19.1001C8.50635 18.9746 8.69047 18.6924 8.69047 18.3809L8.69047 1.61898C8.69047 1.18504 8.3387 0.833268 7.90476 0.833268C7.47082 0.833268 7.11905 1.18504 7.11905 1.61898V11.8332H1.61906Z'
                  fill='#F1F1F7'
                />
                <path
                  d='M18.3809 8.16659L12.8809 8.16659V18.3809C12.8809 18.8148 12.5292 19.1666 12.0952 19.1666C11.6613 19.1666 11.3095 18.8148 11.3095 18.3809L11.3095 1.61898C11.3095 1.30739 11.4936 1.02524 11.7789 0.899779C12.0641 0.774316 12.3965 0.829241 12.6262 1.03979L18.9119 6.80168C19.1507 7.02063 19.2307 7.36374 19.1132 7.66571C18.9957 7.96769 18.7049 8.16659 18.3809 8.16659Z'
                  fill='#F1F1F7'
                />
              </g>
              <defs>
                <clipPath id='clip0_1_1847'>
                  <rect width='20' height='20' fill='currentColor' />
                </clipPath>
              </defs>
            </svg>
          </button>
          <div className='buy-connect-single-left'>
            <span className='d-block second-span'>BRC-20 ASSETS</span>
          </div>
          <div className='buy-connect-single-right'>
            <Button
              onClick={() => setOpenSelectTokenModal(true)}
              className='buy-exchange my-0'
            >
              {selectedToken ? (
                <>
                  <img
                    src={
                      selectedToken?.image
                        ? selectedToken?.image
                        : defaultTokenImg
                    }
                    alt=''
                  />
                  <span>{selectedToken?.tick?.toUpperCase()}</span>
                </>
              ) : (
                <div className='d-flex opacity-50 lh-1'>Select Token</div>
              )}
            </Button>
          </div>
        </div>

        <div className='buy-connect-single last-padding d-flex  justify-content-between align-items-center'>
          <p className='p2'>Receiving Address:</p>
          <p className='p2'>{showAddress(btcAccount)}</p>
        </div>

        <p style={{ fontSize: 14, marginLeft: 8 }}>Fees 1%</p>

        {renderSwapButton()}
      </div>

      {openSwapConfirmationModal && (
        <SwapConfirmationModal
          open={openSwapConfirmationModal}
          isLoading={isLoadingOrder}
          onClose={() => setOpenSwapConfirmationModal(false)}
          onConfirm={() => handlePlaceOrder()}
          selectedListItem={selectedListItem}
          selectedToken={selectedToken}
        />
      )}

      {openSelectNetworkModal && (
        <SelectNetworkModal
          open={openSelectNetworkModal}
          onClose={() => setOpenSelectNetworkModal(false)}
          onSelect={handleNetwork}
          networks={networks}
        />
      )}

      {openSelectTokenModal && (
        <SelectTokenModal
          open={openSelectTokenModal}
          onClose={() => setOpenSelectTokenModal(false)}
          onSelect={handleSelectToken}
        />
      )}

      {openSwapProgressModal && (
        <SwapProgressModal
          open={openSwapProgressModal}
          onClose={() => {
            setOpenSwapProgressModal(false);
            onResetValues();
            queryClient.invalidateQueries({
              queryKey: ["listing"],
            });
          }}
          txHash={transactionHash}
        />
      )}
    </>
  );
};

export default ConnectSwap;
