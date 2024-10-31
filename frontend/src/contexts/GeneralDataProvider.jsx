import { createContext, useEffect, useState } from "react";

export const GeneralDataContext = createContext({
  ethAccount: undefined,
  btcAccount: undefined,
  ethNetwork: undefined,
  networkId: undefined,
  ethBalance: undefined,
});

export const GeneralDataProvider = ({ children }) => {
  const [ethNetwork, setEthNetwork] = useState();
  const [ethAccount, setEthAccount] = useState("");
  const [btcAccount, setBtcAccount] = useState("");
  const [dataConversion, setDataConversion] = useState("");
  const [networkId, setNetworkId] = useState();
  const [networks, setNetworks] = useState([]);
  const [ethBalance, setEthBalance] = useState(0);

  return (
    <GeneralDataContext.Provider
      value={{
        ethNetwork,
        setEthNetwork,
        ethAccount,
        setEthAccount,
        btcAccount,
        setBtcAccount,
        dataConversion,
        setDataConversion,
        networkId,
        setNetworkId,
        networks,
        setNetworks,
        ethBalance,
        setEthBalance,
      }}
    >
      {children}
    </GeneralDataContext.Provider>
  );
};
