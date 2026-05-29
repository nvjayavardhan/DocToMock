import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import './MockTest.css';

const MockTest = () => {
  const [questions, setQuestions] = useState([]);
  const [questionsStatus, setQuestionsStatus] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [pos, setPositive] = useState(0);
  const [neg, setNegative] = useState(0);
  const [title, setTitle] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const { uniqueCode } = useParams();
  const navigate = useNavigate();
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user.id;

        const fetchUserData = async () => {
          try {
            const response = await fetch('https://doctomock.onrender.com/api/auth/getUserDetails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            });
            const data = await response.json();
            if (data.name) {
              setStudentName(data.name);
            } else {
              console.error('User name not found in response');
            }
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        };

        fetchUserData();
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTestResults = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('https://doctomock.onrender.com/api/auth/getTestResultsByStudentName', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ studentName }),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch test results');
          }
          const testResultsData = await response.json();
          setTestResults(testResultsData);
        } catch (error) {
          console.error('Error fetching test results:', error);
        }
      }
    };

    fetchTestResults();
  }, [studentName]);

  useEffect(() => {
    const alreadyAttempted = testResults.some(testResult => testResult.uniqueCode === uniqueCode);
    if (alreadyAttempted) {
      navigate('/enterCode');
    } else {
      const fetchQuestions = async () => {
        try {
          const response = await fetch('https://doctomock.onrender.com/api/auth/getQuizDetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uniqueCode }),
          });
          const data = await response.json();
          if (data.questions && data.quizTime) {
            setQuestions(data.questions);
            setPositive(data.posMark);
            setTitle(data.quizTitle);
            setNegative(data.negMark);
            setQuestionsStatus(Array(data.questions.length).fill('not-viewed'));

            const savedState = localStorage.getItem(`state_${uniqueCode}`);
            if (savedState) {
              const parsedState = JSON.parse(savedState);
              setCurrentQuestion(parsedState.currentQuestion);
              setSelectedOptions(parsedState.selectedOptions);
              setQuestionsStatus(parsedState.questionsStatus);
              setTimeLeft(parsedState.timeLeft);
            } else {
              setTimeLeft(data.quizTime * 60);
            }

            setIsTestStarted(true);
          } else {
            console.error('Questions or total time not found in the response');
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching quiz questions:', error);
          navigate('/');
        }
      };
      fetchQuestions();
    }
  }, [uniqueCode, navigate, testResults]);

  useEffect(() => {
    if (isTestStarted && !showSubmitConfirmation) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(intervalId);
            handleSubmitTest();
            return 0;
          }
          localStorage.setItem(`timer_${uniqueCode}`, newTime); // Save the timer to local storage
          return newTime;
        });
      }, 1000); // Update every second
  
      return () => clearInterval(intervalId);
    }
  }, [isTestStarted, showSubmitConfirmation, uniqueCode]);

  useEffect(() => {
    const saveState = () => {
      const state = {
        currentQuestion,
        selectedOptions,
        questionsStatus,
        timeLeft,
      };
      localStorage.setItem(`state_${uniqueCode}`, JSON.stringify(state));
    };

    window.addEventListener('beforeunload', saveState);

    return () => {
      window.removeEventListener('beforeunload', saveState);
    };
  }, [currentQuestion, selectedOptions, questionsStatus, timeLeft, uniqueCode]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // For most browsers
    };

    const handleBeforeRouteChange = () => {
      setShowSubmitConfirmation(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handleBeforeRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBeforeRouteChange);
    };
  }, []);

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
    if (questionsStatus[index] === 'not-viewed') {
      const newQuestionsStatus = [...questionsStatus];
      newQuestionsStatus[index] = 'viewed';
      setQuestionsStatus(newQuestionsStatus);
    }
  };

  const updateQuestionStatus = (index, status) => {
    const newQuestionsStatus = [...questionsStatus];
    newQuestionsStatus[index] = status;
    setQuestionsStatus(newQuestionsStatus);
  };

  const handleOptionSelect = (option) => {
    const optionLetter = option.split(')')[0].trim();
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [currentQuestion]: optionLetter,
    }));
    if (questionsStatus[currentQuestion] === 'review') {
      updateQuestionStatus(currentQuestion, 'review');
    } else {
      updateQuestionStatus(currentQuestion, 'answered');
    }
  };

  const handleNextQuestion = () => {
    if (questionsStatus[currentQuestion] === 'not-viewed') {
      updateQuestionStatus(currentQuestion, 'viewed');
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prevQuestion) => prevQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (questionsStatus[currentQuestion] === 'not-viewed') {
      updateQuestionStatus(currentQuestion, 'viewed');
    }
    if (currentQuestion > 0) {
      setCurrentQuestion((prevQuestion) => prevQuestion - 1);
    }
  };

  const handleClear = () => {
    const newSelectedOptions = { ...selectedOptions };
    delete newSelectedOptions[currentQuestion];
    setSelectedOptions(newSelectedOptions);
    updateQuestionStatus(currentQuestion, 'viewed');
    calculateScore(newSelectedOptions);
  };

  const addLeadingZero = (number) => (number > 9 ? `${number}` : `0${number}`);

  const calculateSummary = () => {
    const totalQuestions = questions.length;
    const notVisited = questionsStatus.filter(status => status === 'not-viewed').length;
    const notAnswered = questionsStatus.filter(status => status === 'viewed').length;
    const answered = questionsStatus.filter(status => status === 'answered').length;
    const markedForReview = questionsStatus.filter(status => status === 'review').length;

    return { totalQuestions, notVisited, notAnswered, answered, markedForReview };
  };

  const calculateScore = (options) => {
    let newScore = 0;
    questions.forEach((question, index) => {
      if (options[index] === question.answer) {
        newScore += pos;
      } else if (options[index] !== undefined) {
        newScore -= Math.abs(neg);
      }
    });
    setScore(newScore);
    return newScore;
  };

  const summary = calculateSummary();

  const handleSubmitTest = () => {
    setShowSubmitConfirmation(true);
  };

  const confirmSubmitTest = async () => {
    const finalScore = calculateScore(selectedOptions);
    try {
      const response = await fetch('https://doctomock.onrender.com/api/auth/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uniqueCode,
          title,
          studentName,
          score: finalScore,
          totalScore: questions.length * pos
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit quiz results');
      }
    } catch (error) {
      console.error('Error submitting quiz results:', error);
    }
    localStorage.removeItem(`timer_${uniqueCode}`); // Remove the timer from local storage after submission
    localStorage.removeItem(`state_${uniqueCode}`); // Remove the saved state from local storage after submission
    navigate('/mytests');
  };

  return (
    <div className="quiz-container">
      <div className="sidebar">
        {isTestStarted && (
          <>
            <h3>Q.no 's</h3>
            <ul className="question-numbers">
              {questions.map((_, index) => (
                <li
                  key={index}
                  onClick={() => handleQuestionClick(index)}
                  className={`question-number ${questionsStatus[index]} ${index === currentQuestion ? 'current' : ''}`}
                >
                  {index + 1}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="main-content">
        {isTestStarted && questions.length > 0 && (
          <div>
            <div className="header">
              <span className="quiz-title">{title}</span>
              <div className="header1">
                <span className="timer">Time Remaining: {Math.floor(timeLeft / 60)}:{addLeadingZero(timeLeft % 60)}</span>
                <button className="submit-test" onClick={handleSubmitTest}>Submit Test</button>
              </div>
            </div>
            <div className="header2">
              <span className="active-question-no">{addLeadingZero(currentQuestion + 1)}</span>
              <span className="total-question">/{addLeadingZero(questions.length)}</span>
            </div>
            {questions[currentQuestion] ? (
              <>
                <h2>{questions[currentQuestion].question}</h2>
                <div className="question-options">
                  <ul>
                    {questions[currentQuestion].options.map((answer, index) => (
                      <li
                        key={index}
                        onClick={() => handleOptionSelect(answer)}
                        className={
                          selectedOptions[currentQuestion] === answer.split(')')[0].trim()
                            ? 'selected-answer'
                            : null
                        }
                      >
                        {answer}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="button-container">
                  {currentQuestion > 0 && (
                    <button className="nav-button" onClick={handlePreviousQuestion}>Previous</button>
                  )}
                  {currentQuestion < questions.length - 1 ? (
                    <button className="nav-button" onClick={handleNextQuestion}>Next</button>
                  ) : (
                    <button className="nav-button" onClick={handleSubmitTest}>Finish</button>
                  )}
                  <button className="nav-button" onClick={handleClear}>Clear</button>
                </div>
              </>
            ) : (
              <p>Loading question...</p>
            )}
          </div>
        )}
        {showSubmitConfirmation && (
          <Dialog open={showSubmitConfirmation} onClose={() => setShowSubmitConfirmation(false)}>
          <DialogTitle>Submit Test</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to submit the test?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={confirmSubmitTest}>Yes</Button>
            <Button variant="contained" style={{color:'#014495', backgroundColor:'white'}} onClick={() => setShowSubmitConfirmation(false)}>No</Button>
          </DialogActions>
        </Dialog>
        )}
      </div>
      <div className="right-panel">
        <h3>Test Summary</h3>
        <p>Total Questions: {summary.totalQuestions}</p>
        <p>Total Marks: {questions.length * pos}</p>
        <p>Attempted: {summary.answered + summary.markedForReview}</p>
        <p>Left: {summary.notVisited}</p>
        <p>Visited: {summary.totalQuestions - summary.notVisited}</p>
        <p>Not Answered: {summary.notAnswered}</p>
        <ul style={{ listStyleType: "none", marginLeft: "-30px", marginTop: "10px" }}>
          <li><span className="color-box answered"></span> Answered</li>
          <li><span className="color-box viewed"></span> Viewed</li>
          <li><span className="color-box not-viewed"></span> Not Visited</li>
        </ul>
      </div>
    </div>
  );
};

export default MockTest;
