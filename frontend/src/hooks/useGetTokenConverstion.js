import { useQuery } from "react-query";
import { backendAxios } from "../utils/axiosInstances";

export const GET_TOKEN_COVERSION_KEY = ["token-conversion"];

export const useGetTokenConverstion = () => {
  return useQuery({
    queryKey: GET_TOKEN_COVERSION_KEY,
    queryFn: () =>
      backendAxios
        .get("/api/v1/swap/quote", {
          params: { btcAmount: 1 },
        })
        .then((res) => res.data),
    refetchInterval: 1000 * 30,
  });
};
