import React from "react";
import { ProgressContent } from "../ProgressContent";
import { Modal } from "react-bootstrap";

export const TransactionModal = ({
  open,
  onClose,
  status,
  txHash,
  refundTxHash,
  txid,
  ticker,
}) => {
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
        <ProgressContent
          status={status}
          txHash={txHash}
          refundTxHash={refundTxHash}
          txid={txid}
          ticker={ticker}
          showStatusAsTitle
        />
      </Modal.Body>
    </Modal>
  );
};
