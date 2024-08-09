// components/CustomModal.js
import React from 'react';
import Modal from 'react-modal';
import styles from './customModal.module.css';

Modal.setAppElement('#__next'); // To prevent screen readers from reading content outside of the modal

const CustomModal = ({ isOpen, onRequestClose, onConfirm }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <h2>Confirm Sign Out</h2>
            <p>Are you sure you want to sign out? Your chat history will be saved and you can continue next time.</p>
            <div className={styles.buttonContainer}>
                <button onClick={onConfirm} className={styles.confirmButton}>Yes, Sign Out</button>
                <button onClick={onRequestClose} className={styles.cancelButton}>Cancel</button>
            </div>
        </Modal>
    );
};

export default CustomModal;
