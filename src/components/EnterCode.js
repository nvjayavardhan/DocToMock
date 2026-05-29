import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import { Box, Typography, TextField, Container, Paper, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import QuizDetailsPopup from './QuizDetailsPopup';

export default function EnterCode() {
  const [code, setCode] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [quizDetails, setQuizDetails] = useState(null);
  const [error, setError] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const studentId = decodedToken.user.id;

          const userDetailsResponse = await fetch('http://localhost:5000/api/auth/getUserDetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ userId: studentId }),
          });

          if (!userDetailsResponse.ok) {
            throw new Error('Failed to fetch user details');
          }

          const userDetails = await userDetailsResponse.json();

          const testResultsResponse = await fetch('http://localhost:5000/api/auth/getTestResultsByStudentName', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ studentName: userDetails.name }),
          });

          if (!testResultsResponse.ok) {
            if (testResultsResponse.status === 404) {
              setTestResults([]);
            } else {
              throw new Error('Failed to fetch test results');
            }
          } else {
            const testResultsData = await testResultsResponse.json();
            setTestResults(testResultsData);
          }
        } catch (error) {
          setError(error.message);
        }
      } else {
        setError('No authentication token found');
      }
    };

    fetchUserData();
  }, []);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setError(false); // Clear error when user starts typing
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const alreadyAttempted = testResults.some(testResult => testResult.uniqueCode === code);

    if (alreadyAttempted) {
      setErrorMessage('Test already been attempted');
      setError(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/getQuizDetails', { uniqueCode: code });
      if (response.data) {
        setQuizDetails(response.data);
        setShowPopup(true);
        setError(false);
        setErrorMessage('');
      } else {
        setErrorMessage('Invalid quiz code. Please try again.');
        setError(true);
      }
    } catch (error) {
      setErrorMessage('Error fetching quiz details. Please try again.');
      setError(true);
      console.error('Error fetching quiz details:', error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* <Navbar /> */}
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          padding: '0 16px', // Added padding for responsiveness
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            width: '100%',
            maxWidth: 700, // Adjusted maxWidth for responsiveness
            marginTop: '-200px',
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, color: '#333' }}>
            Welcome!
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#333' }}>
            To enter the test, enter the quiz code shared by your teacher.
          </Typography>
          <Form
            onSubmit={handleSubmit}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Form.Group controlId="formQuizCode" style={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Quiz Code"
                placeholder="Enter unique quiz code"
                value={code}
                onChange={handleCodeChange}
                required
                error={error}
                helperText={errorMessage}
                sx={{
                  marginBottom: "50px",
                }}
              />
            </Form.Group>
            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: '#014495',
                width: "100%", // Adjusted width for responsiveness
                color: '#FFFFFF',
                padding: 1.5,
                borderRadius: 1,
                fontSize: '1rem',
              }}
            >
              Submit
            </Button>
          </Form>
        </Paper>
        {quizDetails && (
          <QuizDetailsPopup
            show={showPopup}
            handleClose={handleClosePopup}
            quizDetails={quizDetails}
          />
        )}
      </Container>
    </Box>
  );
}
