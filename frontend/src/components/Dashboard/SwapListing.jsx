import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import img_1 from "../../assets/img/icon/1.svg";
import img_2 from "../../assets/img/icon/2.svg";
import img_3 from "../../assets/img/swap-title-logo.png";
import { LoadingPrices } from "./LoadingPrices";
import {
  btcToAny,
  btcToUsd,
  defaultTokenImg,
  numberWithCommas,
  satoshisToBtc,
} from "../../utils/helpers";
import { GET_TOKEN_COVERSION_KEY } from "../../hooks/useGetTokenConverstion";
import { useQueryClient } from "react-query";
import { useGetTokenConversionState } from "../../hooks/useGetTokenConversionState";
import { SelectingCardConfirmation } from "./SelectingCardConfirmation";
import { useGetTickerInfoAll } from "../../hooks/useGetTickerInfoAll";
import { useGeneralDataContext } from "../../hooks/useGeneralDataContext";

export const SwapListing = ({
  data,
  isLoading,
  selectedToken,
  amount,
  selectedListItem,
  onSelectListItem,
}) => {
  const [openSelectCardModal, setOpenSelectCardModal] = useState(false);
  const list = data?.data?.list ?? [];

  const { data: dataConversion, isLoading: isLoadingConversion } =
    useGetTokenConversionState();

  const { ethNetwork } = useGeneralDataContext();

  const { data: dataAll, isLoading: isLoadingAll } = useGetTickerInfoAll(
    selectedToken.tick
  );

  const listItem = (dataAll?.data?.list ?? []).find(
    (_item) => _item.tick.toLowerCase() === selectedToken.tick.toLowerCase()
  );

  const queryClient = useQueryClient();

  // refetch conversion when amount or selected token changed
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: GET_TOKEN_COVERSION_KEY,
    });
  }, [queryClient, amount, selectedToken]);

  if (isLoading || isLoadingConversion) {
    return <LoadingPrices />;
  }

  return (
    <>
      <div className='swap'>
        <div className='swap-title d-flex justify-content-between'>
          <div className='swap-title-wrap'>
            <div className='swap-title-wrap-icon'>
              <img src={ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg} alt='' />
            </div>
            <h5>{ethNetwork.currency}</h5>
            <p>{ethNetwork.name} NETWORK</p>
          </div>
          <div className='swap-title-wrap'>
            <div className='swap-title-wrap-icon medal-border'>
              <img src={img_3} alt='' />
            </div>
          </div>
          <div className='swap-title-wrap'>
            <div className='swap-title-wrap-icon'>
              <img
                src={
                  selectedToken?.image ? selectedToken?.image : defaultTokenImg
                }
                alt=''
              />
            </div>
            <h5>{selectedToken?.tick?.toUpperCase()}</h5>
            <p>BRC-20 NETWORK</p>
          </div>
        </div>
        {list.length > 0 ? (
          <>
            <Row className='justify-content-center'>
              {list.map((item, index) => {
                const priceInEth = btcToAny(
                  satoshisToBtc(item.price),
                  ethNetwork.name,
                  dataConversion
                ).toFixed(8);

                return (
                  <Col
                    xs={6}
                    xl={4}
                    xxl={3}
                    key={item.auctionId}
                    className='mb-4'
                  >
                    <div
                      className={`swap-card ${
                        selectedListItem?.auctionId === item.auctionId
                          ? "active"
                          : ""
                      }`}
                      role='button'
                      onClick={() => {
                        if (
                          listItem &&
                          item.unitPrice > listItem?.curPrice * 1.05
                        ) {
                          setOpenSelectCardModal(true);
                        }
                        onSelectListItem(item, priceInEth);
                      }}
                    >
                      <div className='swap-card-count text-center px-1'>
                        <h3 className='text-break'>{item.amount}</h3>
                        <h4>
                          <span className='text-break'>
                            {numberWithCommas(item.unitPrice.toFixed(0))}
                          </span>{" "}
                          <span>sats/{selectedToken?.tick?.toUpperCase()}</span>
                        </h4>
                        <span>
                          $
                          {btcToUsd(
                            satoshisToBtc(item.unitPrice),
                            dataConversion?.usdAmount
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className='swap-card-price'>
                        <p>#{item.inscriptionNumber}</p>
                        <div className='swap-card-price-bottom d-flex align-items-center justify-content-between'>
                          <div className='swap-card-price-bottom-logo'>
                            <img src={ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg} alt='' />
                            <span>{priceInEth}</span>
                          </div>
                          <span>
                            $
                            {btcToUsd(
                              satoshisToBtc(item.price),
                              dataConversion?.usdAmount
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
            <div className='text text-center'>
              <p>
                Select tokens to purchase from above quotes. *Your Spend amount
                may vary.
              </p>
            </div>
          </>
        ) : (
          <div className='text text-center'>
            <p>Nothing found. Please change the amount or the token.</p>
          </div>
        )}
      </div>
      {openSelectCardModal && (
        <SelectingCardConfirmation
          open={openSelectCardModal}
          onClose={() => setOpenSelectCardModal(false)}
          curPrice={listItem?.curPrice}
          ticker={listItem?.tick}
        />
      )}
    </>
  );
};
