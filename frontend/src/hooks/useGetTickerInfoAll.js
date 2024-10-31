import { useQuery } from "react-query";
import { uniSatAxios } from "../utils/axiosInstances";

export const useGetTickerInfoAll = (ticker) => {
  const variables = {
    ticks: [ticker],
  };
  return useQuery({
    queryKey: ["ticker-info-all", variables],
    queryFn: () =>
      uniSatAxios
        .post(`/v3/market/brc20/auction/brc20_types`, variables)
        .then((res) => res.data),
  });
};
