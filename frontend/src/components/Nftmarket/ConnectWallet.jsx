import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ethers } from "ethers";
import { toast } from "react-toastify";

import { chains, chainsTestnet } from "../../utils/constants";
import { anyToBtc, isMainnetUrl, isValidChainId } from "../../utils/helpers";

import { SelectTokenModal } from "../Dashboard/SelectTokenModal";
import { SwapProgressModal } from "../Dashboard/SwapProgressModal";
import { SelectNetworkModal } from "../Dashboard/SelectNetworkModal";
// import { SwapConfirmationModal } from "../Dashboard/SwapConfirmationModal";
import { SwapConfirmationModal } from "./SwapConfirmation";
import {
    btcToUsd,
    calculateTotalPrice,
    defaultTokenImg,
    isValidTaprootAddress,
    showAddress,
} from "../../utils/helpers";
import { useGeneralDataContext } from "../../hooks/useGeneralDataContext";
import { backendAxios } from "../../utils/axiosInstances";
import { useQueryClient } from "react-query";
import { useGetTokenConversionState } from "../../hooks/useGetTokenConversionState";

const ConnectWallet = ({
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

    console.log(selectedListItem)

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
        }
        // else if (!selectedToken) {
        //     text = "Please select a token";
        // } else if (amount === "" && !selectedListItem) {
        //     text = "Please enter an amount";
        // } else if (!selectedListItem) {
        //     text = "Please select a order to place";
        // } else if (!isValidTaprootAddress(btcAccount)) {
        //     text = "Please use a Taproot BTC address";
        // } 
        else if (maxUsdAmountCondition) {
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
            <div className='buy-now-btn' onClick={() => setOpenSwapConfirmationModal(true)}> Buy Now &nbsp; &#62;
                {/* <Button
                   
                    className='primary-btn border-0 cursor-pointer'
                // disabled={
                //     amount === "" ||
                //     !validChainId ||
                //     !selectedListItem ||
                //     isLoadingList ||
                //     !btcAccount ||
                //     !ethAccount ||
                //     !validBtcAddress ||
                //     insufficientFunds ||
                //     maxUsdAmountCondition
                // }
                >
                    Swap
                </Button> */}
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
                    tick: selectedListItem.collectionItemName, //collectionName
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
            {/* <Button
                onClick={() => setOpenSelectNetworkModal(true)}
                className='buy-now-btn-chain'
            >
                {ethNetwork ? (
                    <>
                        <img
                            src={
                                ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg
                            }
                            alt=''
                        />
                        <span>&nbsp; {ethNetwork?.currency ?? "ETH"}</span>
                    </>
                ) : (
                    <div className='d-flex opacity-50 lh-1'>Select Token</div>
                )}
            </Button> */}
            {renderSwapButton()}

            {
                openSwapConfirmationModal && (
                    <SwapConfirmationModal
                        open={openSwapConfirmationModal}
                        isLoading={isLoadingOrder}
                        onClose={() => setOpenSwapConfirmationModal(false)}
                        onConfirm={() => handlePlaceOrder()}
                        selectedListItem={selectedListItem}
                        selectedToken={selectedToken}
                    />
                )
            }

            {
                openSelectNetworkModal && (
                    <SelectNetworkModal
                        open={openSelectNetworkModal}
                        onClose={() => setOpenSelectNetworkModal(false)}
                        onSelect={handleNetwork}
                        networks={networks}
                    />
                )
            }

            {
                openSelectTokenModal && (
                    <SelectTokenModal
                        open={openSelectTokenModal}
                        onClose={() => setOpenSelectTokenModal(false)}
                        onSelect={handleSelectToken}
                    />
                )
            }

            {
                openSwapProgressModal && (
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
                )
            }
        </>
    );
};

export default ConnectWallet;
