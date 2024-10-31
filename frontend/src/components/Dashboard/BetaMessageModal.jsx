import { Button, Modal } from "react-bootstrap";

export const BetaMessageModal = ({ open, onClose }) => {
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
        <p className='mt-5 fw-light text-center' style={{ fontSize: 16 }}>
          During the public beta there is a $2000 limit per tx.
        </p>
        <div className='mt-3 d-flex justify-content-end'>
          <Button className='btn-custom' onClick={onClose}>
            Okay
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
