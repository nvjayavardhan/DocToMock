import React, { useState, useEffect } from 'react';
import { Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Alert, Snackbar, CircularProgress, Box, Tooltip, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import {jwtDecode} from 'jwt-decode'; // Corrected import for jwt-decode
import Navbar from './Navbar';

export default function App() {
  const [quizzes, setQuizzes] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.user.id;

          const userDetailsResponse = await fetch('http://localhost:5000/api/auth/getUserDetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
            body: JSON.stringify({ userId }),
          });

          if (!userDetailsResponse.ok) {
            throw new Error('Failed to fetch user details');
          }

          const userDetails = await userDetailsResponse.json();
          setUserName(userDetails.name);
          setUserEmail(userDetails.email);

          const quizzesResponse = await fetch('http://localhost:5000/api/auth/quizzes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
            body: JSON.stringify({ teacherEmail: userDetails.email }),
          });

          if (!quizzesResponse.ok) {
            throw new Error('Failed to fetch quizzes');
          }

          const quizzesData = await quizzesResponse.json();
          // Simulate a loading delay of 2 seconds
          setTimeout(() => {
            setQuizzes(quizzesData);
            setLoading(false);
          });
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError('No authentication token found');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCopyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setAlertVisible(true);
    });
  };

  const handleToggleInfo = () => {
    setInfoVisible(!infoVisible);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  const handleDeleteQuiz = async (uniqueCode) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/deleteQuiz', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ uniqueCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      // Remove the deleted quiz from the state
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.uniqueCode !== uniqueCode));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* <Navbar /> */}
      <TableContainer component={Paper} style={{ width: '80%', margin: 'auto', marginTop: '50px', maxHeight: '500px', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell colSpan={5} style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'black', color: '#fff' }}>
                Hey {userName}, these are the tests created by you
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#014495', color: '#fff', fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ backgroundColor: '#014495', color: '#fff', fontWeight: 'bold' }}>Time (mins.)</TableCell>
              <TableCell sx={{ backgroundColor: '#014495', color: '#fff', fontWeight: 'bold' }}>Analytics</TableCell>
              <TableCell sx={{ backgroundColor: '#014495', color: '#fff', fontWeight: 'bold' }}>
                Code
                <Tooltip title={<span style={{ fontSize: '14px' }}>Share code with students to attempt the test</span>} arrow placement="top">
                  <IconButton onClick={handleToggleInfo} style={{ color: 'white', padding: '0', marginLeft: '8px', transform: 'translateY(-3px)' }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#014495', color: '#fff', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.map((quiz, index) => (
              <TableRow key={index}>
                <TableCell>{quiz.quizTitle}</TableCell>
                <TableCell>{quiz.quizTime}</TableCell>
                <TableCell>
                  <Link to={`/analytics/${quiz.uniqueCode}`} style={{ textDecoration: 'none' }}>
                    <Button variant="contained" sx={{ backgroundColor: '#014495', color: '#fff' }}>
                      Click Here
                    </Button>
                  </Link>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleCopyToClipboard(quiz.uniqueCode)}
                    sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'white', boxShadow: 'none' } }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteQuiz(quiz.uniqueCode)} sx={{ color: 'red' }}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={alertVisible}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" icon={<CheckIcon fontSize="inherit" />}>
          Copied to clipboard
        </Alert>
      </Snackbar>
    </div>
  );
}