import React from "react";
import { Modal } from "react-bootstrap";
import { LogoSvg } from "../../svgs/LogoSvg";
import logoTextImg from "../../../assets/img/logo.png";
import confettiImg from "../../../assets/img/orange-confetti.png";

import styles from "./SwapSuccessfulModal.module.scss";

export const SwapSuccessfulModal = ({ open, onClose }) => {
  return (
    <Modal
      className='swap-modal swap-modal-small'
      centered
      size='xs'
      show={open}
      onHide={onClose}
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body className='position-relative'>
        <img
          className={styles.logoImage}
          src={logoTextImg}
          alt='logo image'
          height={50}
          width={100}
        />
        <img
          className={styles.illustrationImage}
          src={confettiImg}
          alt='illustration'
        />
        <div
          className={`${styles.contentContainer} text-center d-flex flex-column justify-content-center align-items-center`}
        >
          <LogoSvg />
          <h3 className='text-white mt-2'>Swap successful !</h3>
        </div>
      </Modal.Body>
    </Modal>
  );
};
