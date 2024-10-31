import React from "react";
import { useQuery } from "react-query";
import { uniSatAxios } from "../../utils/axiosInstances";
import {
  btcToUsd,
  numberWithCommas,
  satoshisToBtc,
  showAddress,
} from "../../utils/helpers";
import { useGetTokenConversionState } from "../../hooks/useGetTokenConversionState";
import { useGetTickerInfoAll } from "../../hooks/useGetTickerInfoAll";

export const TokenInformationSection = ({ ticker }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["ticker-info", ticker],
    queryFn: () =>
      uniSatAxios
        .get(`/v1/indexer/brc20/${ticker}/info`)
        .then((res) => res.data),
  });

  const { data: dataConversion, isLoading: isLoadingConversion } =
    useGetTokenConversionState();

  const { data: dataAll, isLoading: isLoadingAll } =
    useGetTickerInfoAll(ticker);

  if (isLoading || isLoadingAll || isLoadingConversion) return null;

  let infoCards = [];

  const listItem = (dataAll?.data?.list ?? []).find(
    (item) => item.tick === ticker.toLowerCase(),
  );

  if (data?.data)
    infoCards = [
      {
        title: "Inscription ca",
        price: showAddress(data.data.inscriptionId),
      },
      {
        title: "Supply",
        price: numberWithCommas(data.data.max),
      },
      {
        title: "Minted",
        price: numberWithCommas(data.data.minted),
      },
      {
        title: "Holders",
        price: numberWithCommas(data.data.holdersCount),
      },
      {
        title: "Volume",
        price: listItem
          ? `$${numberWithCommas(
              btcToUsd(
                satoshisToBtc(listItem.btcVolume),
                dataConversion?.usdAmount,
              ).toFixed(0),
            )}`
          : "-",
      },
      {
        title: "Marketcap",
        price: listItem
          ? `$${numberWithCommas(
              btcToUsd(
                satoshisToBtc(listItem.cap),
                dataConversion?.usdAmount,
              ).toFixed(0),
            )}`
          : "-",
      },
    ];

  if (infoCards.length === 0) return null;

  return (
    <div className='search-card d-grid mt-4'>
      {infoCards.map((item, index) => (
        <div className='search-card-single' key={index}>
          <span>{item.title}:</span>
          <h6>
            <span className='text-break'>{item.price}</span>
          </h6>
        </div>
      ))}
    </div>
  );
};
