import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { removeQna } from './qnaSlice';
import './TestFinal.css';

function TestFinal() {
    const [quizTitle, setQuizTitle] = useState('');
    const [quizTime, setQuizTime] = useState('');
    const [posMark, setPosMark] = useState('');
    const [negMark, setNegMark] = useState('');
    const [quizNameExists, setQuizNameExists] = useState(false); 
    const dispatch = useDispatch();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [qna, setQna] = useState([]);
    const [uniqueCode, setUniqueCode] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigate = useNavigate();

    const questions1 = useSelector(state => state.qna.questions);
    const answers1 = useSelector(state => state.qna.answers);

    useEffect(() => {
        if (questions1 && questions1.length === 0) {
            navigate('/createtest');
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        if (questions1 && questions1.length > 0) {
            setQuestions(questions1);
            setAnswers(answers1);
            const questionsWithAnswers = questions1.map((question, index) => ({
                ...question,
                answer: answers1[index]
            }));
            setQna(questionsWithAnswers);
            const timeout = setTimeout(() => {
                dispatch(removeQna());
            }, 1000); // Adjust the delay as needed

            return () => clearTimeout(timeout); // Cleanup function
        }
    }, [questions1, answers1, dispatch]);

    const [isClicked, setIsClicked] = useState(false);

    // Effect to handle clicks outside the dropdown
    useEffect(() => {
        const handleDocumentClick = (event) => {
            // Check if the click occurred outside the dropdown
            if (!event.target.closest('.dropdown')) {
                setIsClicked(false); // Set isClicked to false when any click occurs outside the dropdown
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick); // Cleanup
        };
    }, []);

    // Function to toggle the dropdown visibility
    const handleClick = () => {
        setIsClicked(!isClicked);
    };

    const handleKeyPress = (event, field) => {
        if (event.key === 'Enter') {
            if (field === 'negMark') {
                checkQuizNameExists();
            } else {
                // Focus the next input field or do any required action
                if (field === 'quizTitle') {
                    document.getElementById('quizTime').focus();
                } else if (field === 'quizTime') {
                    document.getElementById('posMark').focus();
                } else if (field === 'posMark') {
                    document.getElementById('negMark').focus();
                }
            }
        }
    };

    const sendToBackend = async () => {
        const teacherEmail = localStorage.getItem('userEmail');
        const newUniqueCode = uuidv4();
        setUniqueCode(newUniqueCode);
        console.log({
            teacherEmail: teacherEmail,
            quizTitle: quizTitle,
            quizTime: quizTime,
            posMark: posMark,
            negMark: negMark,
            questions: qna,
            uniqueCode: newUniqueCode
        });
        try {
            const response = await axios.post("http://localhost:5000/api/auth/createQuiz", {
                teacherEmail: teacherEmail,
                quizTitle: quizTitle,
                quizTime: quizTime,
                posMark: posMark,
                negMark: negMark,
                questions: qna,
                uniqueCode: newUniqueCode
            });
            console.log(response);
            if (response.status === 201) {
                navigate('/teacher');
            }
        } catch (error) {
            console.error("Error sending data to backend:", error);
            setSnackbarMessage("Error sending data to backend");
            setShowSnackbar(true);
        }
    };

    const checkQuizNameExists = async () => {
        if (!quizTitle || !quizTime || !posMark || !negMark) {
            setSnackbarMessage("Please fill all the fields");
            setShowSnackbar(true);
            return;
        }
        try {
            const response = await axios.post("http://localhost:5000/api/auth/quizzes", {
                teacherEmail: localStorage.getItem('userEmail')
            });
            const quizzes = response.data;
            const existingQuiz = quizzes.find(quiz => quiz.quizTitle === quizTitle);
            if (existingQuiz) {
                setQuizNameExists(true);
                setSnackbarMessage("Quiz name already exists");
                setShowSnackbar(true);
            } else {
                setQuizNameExists(false);
                sendToBackend(); // Proceed with sending data to the backend if quiz name doesn't exist
            }
        } catch (error) {
            console.error("Error checking quiz name:", error);
            setSnackbarMessage("Error checking quiz name");
            setShowSnackbar(true);
        }
    };

    const handlePopupClose = () => {
        setShowPopup(false);
        navigate('/teacher');
    };

    return (
        <div>
            <div className='body'>
                <div className='inputBox'>
                    <input 
                        type='text' 
                        required='required' 
                        name="quizTitle" 
                        value={quizTitle} 
                        onChange={(e) => setQuizTitle(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'quizTitle')}
                    />
                    <span>Quiz Title</span>
                </div>
                <div className='inputBox'>
                    <input 
                        type='number' 
                        required='required' 
                        name="quizTime" 
                        id="quizTime"
                        value={quizTime} 
                        onChange={(e) => setQuizTime(e.target.value)} 
                        onKeyPress={(e) => handleKeyPress(e, 'quizTime')}
                    />
                    <span>Quiz Time</span>
                </div>
                <div className="dropdown">
                    <button className="dropbtn" onClick={handleClick}>Marking Scheme</button>
                    <div className="dropdown-content" style={{ display: isClicked ? 'block' : 'none' }}>
                        <div className='inputBox'>
                            <input 
                                type='number' 
                                required='required' 
                                name="posMark" 
                                id="posMark"
                                value={posMark} 
                                onChange={(e) => setPosMark(e.target.value)} 
                                onKeyPress={(e) => handleKeyPress(e, 'posMark')}
                            />
                            <span>Positive Marking</span>
                        </div>
                        <div className='inputBox'>
                            <input 
                                type='number' 
                                required='required' 
                                name="negMark" 
                                id="negMark"
                                value={negMark} 
                                onChange={(e) => setNegMark(e.target.value)} 
                                onKeyPress={(e) => handleKeyPress(e, 'negMark')}
                            />
                            <span>Negative Marking</span>
                        </div>
                    </div>
                </div>
                <button className="button70" onClick={checkQuizNameExists}>
                    <p>Submit Test</p>
                </button>
            </div>

            <div style={{ marginTop:'10px', display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center' }}>
                <div>
                    <>
                        <h2>Generated Questions and Answers:</h2>
                        {questions.map((item, index) => (
                            <div key={index}>
                                <p><strong>Question: </strong>{item.question}</p>
                                <ul>
                                    {item.options.map((option, i) => (
                                        <li key={i}>{option}</li>
                                    ))}
                                </ul>
                                <p><strong>Answer: </strong>{answers[index]}</p> {/* Display answer corresponding to the question */}
                            </div>
                        ))}
                    </>
                </div>
            </div>
            {showPopup && (
                <div className="popup">
                    <div className="popup-inner">
                        <h2>Quiz Created Successfully!</h2>
                        <p>Your unique code is: <strong>{uniqueCode}</strong></p>
                        <button onClick={handlePopupClose}>Close</button>
                    </div>
                </div>
            )}
            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setShowSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default TestFinal;
