import { useQueryClient } from "react-query";
import { GET_TOKEN_COVERSION_KEY } from "./useGetTokenConverstion";
import { useEffect } from "react";
import { useGeneralDataContext } from "./useGeneralDataContext";

export const useGetTokenConversionState = () => {
  const queryClient = useQueryClient();
  const state = queryClient.getQueryState(GET_TOKEN_COVERSION_KEY);
  const { dataConversion, setDataConversion } = useGeneralDataContext();

  const { data, status, ...rest } = state ?? {};

  useEffect(() => {
    if (status === "success") {
      setDataConversion(data);
    }
  }, [data, status]);

  return {
    data: status === "error" ? dataConversion : data,
    ...rest,
  };
};
