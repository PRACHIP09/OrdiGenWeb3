import React from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { EthSvg } from "../svgs/EthSvg";
import {
  btcToAny,
  btcToUsd,
  defaultTokenImg,
  satoshisToBtc,
} from "../../utils/helpers";
import { useGetTokenConverstion } from "../../hooks/useGetTokenConverstion";
import { useGetTokenConversionState } from "../../hooks/useGetTokenConversionState";
import { useGeneralDataContext } from "../../hooks/useGeneralDataContext";

export const SwapConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  selectedListItem,
  selectedToken,
}) => {
  const { refetch } = useGetTokenConverstion();
  const { data: dataConversion, isLoading: isLoadingConversion } =
    useGetTokenConversionState();

  const { ethNetwork } = useGeneralDataContext();

  const cost = parseFloat(
    btcToAny(
      satoshisToBtc(selectedListItem?.price),
      ethNetwork.name,
      dataConversion
    ).toFixed(8)
  );

  return (
    <Modal
      className='buy-modal'
      centered
      size='md'
      show={open}
      onHide={() => (isLoading ? null : onClose())}
    >
      <Modal.Header closeButton>
        <Modal.Title>Swap confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body className='pt-2 pb-5'>
        {/* <p className='mb-4 '>Are you sure you want to do the swap?</p>
        <p className='h6 fw-normal'>You pay: </p> */}
        <span>Price:</span>
        <p className='d-flex align-items-center justify-content-between h4 mb-0'>
          <span className='fw-bold'>{cost}</span> <img src={ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg} />
        </p>
        <span>Fees:</span>
        <p className='d-flex align-items-center justify-content-between h4 mb-0'>
          <span className='fw-bold'>{(cost * 0.01).toFixed(8)}</span>{" "}
          <img src={ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg} />
        </p>
        <span>Total:</span>
        <p className='d-flex align-items-center justify-content-between h4 mb-0'>
          <span className='fw-bold'>{(cost + cost * 0.01).toFixed(8)}</span>{" "}
          <img src={ethNetwork?.icon ? ethNetwork.icon : defaultTokenImg} />
        </p>
        {/* <span>
          $
          {btcToUsd(
            satoshisToBtc(selectedListItem.price * 1.01),
            dataConversion?.usdAmount,
          ).toFixed(2)}
        </span> */}
        <hr className='my-4' />
        <p className='h6 fw-normal'>You receive: </p>
        <p className='d-flex align-items-center justify-content-between h4 mb-0'>
          <span className='fw-bold'>
            {selectedListItem.amount} {selectedListItem.tick.toUpperCase()}
          </span>{" "}
          <img
            width={22}
            height={22}
            src={selectedToken?.image ? selectedToken?.image : defaultTokenImg}
            alt=''
          />
        </p>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        <Button
          className='btn-custom-outline'
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          className='btn-custom d-flex gap-2 align-items-center'
          onClick={onConfirm}
        >
          {isLoading && (
            <Spinner
              as='span'
              animation='border'
              size='sm'
              role='status'
              aria-hidden='true'
            />
          )}
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
