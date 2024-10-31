import Header from "../components/Header/Header";
import { Col, Container, Row } from "react-bootstrap";
import ConnectSwap from "../components/ConnectSwap";
import { DashboardAccordion } from "../components/Dashboard/DashboardAccordion";
import { LoadingPrices } from "../components/Dashboard/LoadingPrices";
import { SwapListing } from "../components/Dashboard/SwapListing";
import { TokenInformationSection } from "../components/Dashboard/TokenInformationSection";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { backendAxios, uniSatAxios } from "../utils/axiosInstances";
import { anyToBtc, btcToSatoshis } from "../utils/helpers";
import { useDebounce } from "../hooks/useDebounce";
import { RecentTransactions } from "../components/Dashboard/RecentTransactions/RecentTransactions";
import { useGeneralDataContext } from "../hooks/useGeneralDataContext";
import { useGetTokenConverstion } from "../hooks/useGetTokenConverstion";
import { useGetTokenConversionState } from "../hooks/useGetTokenConversionState";
import { BetaMessageModal } from "../components/Dashboard/BetaMessageModal";
import { BRCButton } from "../components/Dashboard/BRCButton";
import { StakeButton } from "../components/Dashboard/StakeButton";
import { CollectionButton } from "../components/Dashboard/CollectionButton";

const Dashboard = () => {
  const [selectedToken, setSelectedToken] = useState();
  const [selectedListItem, setSelectedListItem] = useState(null);

  const [amount, setAmount] = useState("");
  const [amountToShowOnUI, setAmountToShowOnUI] = useState("");
  const [minP, setMinP] = useState(0.8);
  const [maxP, setMaxP] = useState(1.2);
  const debouncedAmount = useDebounce(amount, 500);

  const [openBetaModal, setOpenBetaModal] = useState(undefined);

  const { btcAccount, ethAccount, ethNetwork } = useGeneralDataContext();

  useEffect(() => {
    if (btcAccount && ethAccount) {
      setOpenBetaModal(true);
    }
  }, [btcAccount, ethAccount]);

  const { data: dataConversion, isLoading: isLoadingConversion } =
    useGetTokenConversionState();
  const variables = {
    filter: {
      nftType: "brc20",
      nftConfirm: true,
      isEnd: false,
      ...(selectedToken && { tick: selectedToken.tick }),
      ...(debouncedAmount && {
        minPrice: Math.floor(
          btcToSatoshis(
            anyToBtc(debouncedAmount, ethNetwork.name, dataConversion) * minP
          )
        ),
        maxPrice: Math.floor(
          btcToSatoshis(
            anyToBtc(debouncedAmount, ethNetwork.name, dataConversion) * maxP
          )
        ),
      }),
    },
    sort: { unitPrice: 1, initPrice: 1 },
    start: 0,
    limit: 4,
    flash: false,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["listing", variables],
    queryFn: () =>
      uniSatAxios
        .post("/v3/market/brc20/auction/list", variables)
        .then((res) => res.data),
    enabled: Boolean(selectedToken),
  });
  console.log(minP, maxP);
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && data?.data?.list?.length === 0) {
      if (minP === 0.8) {
        setMinP(0.5);
        setMaxP(1.5);
      } else if (minP == 0.5) {
        setMinP(0.1);
        setMaxP(1.9);
      }
    }
  }, [amount, data, minP]);

  useEffect(() => {
    if (data) {
      setSelectedListItem(null);
    }
  }, [data]);

  const { refetch } = useGetTokenConverstion();

  const renderDashboard = () => {
    if (!ethAccount || !btcAccount) {
      return (
        <div className='text text-center mt-5'>
          <p className='h4 fw-normal'>Please connect your wallets first.</p>
        </div>
      );
    }

    if (openBetaModal === undefined || openBetaModal === true) return null;

    return (
      <Container>
        <Row>
          <div className="buttoncontainer">
            <div className='left-btn'>
              <BRCButton />
              <CollectionButton />
            </div>
            <div className='right-btn'>
              <StakeButton />
            </div>
          </div>
          <Col lg={5} xxl={4} className='mb-4 mb-md-5 mb-lg-0'>
            <ConnectSwap
              selectedToken={selectedToken}
              onSelectToken={setSelectedToken}
              amount={amountToShowOnUI}
              onChangeAmount={(_amount) => {
                setAmount(_amount);
                setAmountToShowOnUI(_amount);
                setMinP(0.8);
                setMaxP(1.2);
              }}
              selectedListItem={selectedListItem}
              onSelectListItem={setSelectedListItem}
              isLoadingList={isLoading}
            />
            {selectedToken && (
              <TokenInformationSection ticker={selectedToken.tick} />
            )}
          </Col>
          <Col lg={7} xxl={8} className='d-flex flex-column gap-4'>
            {selectedToken ? (
              <SwapListing
                data={data}
                isLoading={isLoading}
                selectedToken={selectedToken}
                amount={amount}
                selectedListItem={selectedListItem}
                onSelectListItem={(item, priceInEth) => {
                  setAmountToShowOnUI(priceInEth);
                  setSelectedListItem(item);
                }}
              />
            ) : (
              <>{/* <DashboardAccordion /> */}</>
            )}
            <RecentTransactions />
          </Col>
        </Row>
      </Container>
    );
  };

  return (
    <>
      <Header />
      <div className='dashboard'>{renderDashboard()}</div>
      {openBetaModal && (
        <BetaMessageModal
          open={openBetaModal}
          onClose={() => setOpenBetaModal(false)}
        />
      )}
    </>
  );
};
export default Dashboard;
