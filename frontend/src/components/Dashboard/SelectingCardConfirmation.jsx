import React from "react";
import { Modal } from "react-bootstrap";
import { btcToUsd, numberWithCommas, satoshisToBtc } from "../../utils/helpers";
import { useGetTokenConversionState } from "../../hooks/useGetTokenConversionState";

export const SelectingCardConfirmation = ({
  open,
  onClose,
  curPrice,
  ticker,
}) => {
  const { data: dataConversion, isLoading: isLoadingConversion } =
    useGetTokenConversionState();

  if (curPrice == null) return null;

  const tick = ticker?.toUpperCase();

  return (
    <Modal
      className='swap-modal swap-modal-xsmall'
      centered
      size='xs'
      show={open}
      onHide={onClose}
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <p className='mt-4 fw-light text-center' style={{ fontSize: 16 }}>
          The average price for {tick} is [{numberWithCommas(curPrice)} sats/
          {tick} or $
          {numberWithCommas(
            btcToUsd(
              satoshisToBtc(curPrice),
              dataConversion?.usdAmount,
            ).toFixed(2),
          )}
          ]. We match your spend amount to the closest Unisat listing. Adjusting
          spend amount may result in a better price.
        </p>
      </Modal.Body>
    </Modal>
  );
};
