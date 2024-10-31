import { Modal, Spinner } from "react-bootstrap";
import { useGeneralDataContext } from "../../hooks/useGeneralDataContext";
import { useQuery, useQueryClient } from "react-query";
import { backendAxios } from "../../utils/axiosInstances";
import { useEffect } from "react";
import { ProgressContent } from "./ProgressContent";
import { getMaxIndexByStatus } from "../../utils/helpers";

export const SwapProgressModal = ({ open, onClose, txHash }) => {
  const { btcAccount, ethAccount, ethNetwork } = useGeneralDataContext();

  const { data, isLoading } = useQuery({
    queryKey: ["account-user-transactions", ethNetwork.name],
    queryFn: () =>
      backendAxios
        .get(`api/v1/swap/user/${ethAccount}?chain=${ethNetwork.name}`)
        .then((res) => res.data),
    refetchInterval: 1000 * 5,
  });
  const transactions = data ?? [];
  const lastTransaction = transactions[0];

  const auctionItem = (lastTransaction?.outputInscriptions ?? [])[0];

  const status = lastTransaction?.status;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "Completed") {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    }
  }, [status, queryClient]);

  const maxIndexActive = getMaxIndexByStatus(status);

  return (
    <Modal
      className='swap-modal'
      centered
      size='sm'
      show={open}
      onHide={onClose}
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className='d-flex align-items-center justify-content-center'>
            <Spinner animation='border' />
          </div>
        ) : (
          <>
            <ProgressContent
              status={status}
              txHash={txHash}
              refundTxHash={lastTransaction?.refundTxHash}
              txid={auctionItem?.txid}
              ticker={auctionItem?.tick}
            />

            {maxIndexActive >= 0 && maxIndexActive < 4 && (
              <div className='d-flex align-items-center justify-content-center mt-2'>
                <Spinner animation='border' />
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
