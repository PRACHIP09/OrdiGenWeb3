import { Modal } from "react-bootstrap";

export const SelectNetworkModal = ({ open, onClose, onSelect, networks }) => {
  return (
    <Modal
      className='buy-modal'
      centered
      size='md'
      show={open}
      onHide={onClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Select Network</Modal.Title>
      </Modal.Header>
      <Modal.Body className='px-4'>
        <ul className='items d-grid gap-2 gap-sm-2 pb-4'>
          {networks.map((item, index) => (
            <li
              className='d-flex align-items-center gap-2'
              key={index}
              onClick={() => onSelect(item.chainId)}
            >
              <img src={item.icon} alt='' />
              <span>{item.currency}</span>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
};
