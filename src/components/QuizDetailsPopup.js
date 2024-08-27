import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';

export default function QuizDetailsPopup({ show, handleClose, quizDetails }) {
    let navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    };

    const isPC = () => {
        const userAgent = navigator.userAgent;
        return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    };

    const handleStartQuiz = () => {
        if (isPC()) {
            enterFullscreen();
            console.log('Starting quiz with code:', quizDetails.uniqueCode);
            navigate(`/mocktest/${quizDetails.uniqueCode}`);
        } else {
            setShowAlert(true);
        }
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Quiz Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Title:</strong> {quizDetails.quizTitle}</p>
                    <p><strong>Time:</strong> {quizDetails.quizTime} minutes</p>
                    <p><strong>Positive Marking:</strong> {quizDetails.posMark}</p>
                    <p><strong>Negative Marking:</strong> {quizDetails.negMark}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleStartQuiz}>Start Quiz</Button>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Snackbar open={showAlert} autoHideDuration={6000} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleCloseAlert} severity="warning" sx={{ width: '100%' }}>
                    Quiz can only be started on a PC or Laptop!
                </Alert>
            </Snackbar>
        </>
    );
}
