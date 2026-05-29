import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Table,Box, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Typography, CircularProgress } from '@mui/material';

const MyTest = () => {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');

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
                    setUserName(userDetails.name);

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

    if (loading) {
        return (<Box display="flex" justifyContent="center" alignItems="center" height="100vh" >
        <CircularProgress />
      </Box>);
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (testResults.length === 0) {
        return <div>No test results found.</div>;
    }

    return (
        <div>
            {/* <Navbar /> */}
            <TableContainer component={Paper} style={{ width: '80%', margin: 'auto', marginTop: '50px' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={3} align="center" style={{ fontWeight: 'bold', backgroundColor: 'black', color: '#fff' }}>
                                <Typography variant="h6">Hey {userName.toUpperCase()}, here are your results</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow >
                            <TableCell style={{backgroundColor:"#014495", color:'white'}}>Exam</TableCell>
                            <TableCell style={{backgroundColor:"#014495", color:'white'}}>Score</TableCell>
                            <TableCell style={{backgroundColor:"#014495", color:'white'}}>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {testResults.map((result, index) => (
                            <TableRow key={index}>
                                <TableCell>{result.title}</TableCell>
                                <TableCell>{result.score} / {result.totalScore}</TableCell>
                                <TableCell>{new Date(result.submissionDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default MyTest;
