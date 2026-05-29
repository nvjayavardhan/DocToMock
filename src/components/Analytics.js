import React, { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

const Analytics = () => {
  const { uniqueCode } = useParams(); // Retrieve uniqueCode from URL parameters
  const [analyticsData, setAnalyticsData] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/getTestResults?uniqueCode=${uniqueCode}`);
        const data = await response.json();
        console.log(data)
        setAnalyticsData(data);
        if (data.length > 0) {
          setTitle(data[0].title);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, [uniqueCode]);

  const getHeaderColor = (index) => {
    return '#014495 '; // Alternate background colors for table headers
  };

  return (
    <div>
      {/* <Navbar /> */}
      <TableContainer component={Paper} style={{ width: '80%', margin: 'auto', marginTop:"50px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'black ', color: '#fff' }}>ExamTitle: {title}</TableCell>
            </TableRow>
            <TableRow >
              <TableCell style={{ fontWeight: 'bold', backgroundColor: getHeaderColor(0), color: '#fff' }}>Student Roll No.</TableCell>
              <TableCell style={{ fontWeight: 'bold', backgroundColor: getHeaderColor(1), color: '#fff' }}>Score</TableCell>
              <TableCell style={{ fontWeight: 'bold', backgroundColor: getHeaderColor(2), color: '#fff' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analyticsData.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.studentName.toUpperCase()}</TableCell>
                <TableCell>{data.score}/{data.totalScore}</TableCell>
                <TableCell>{new Date(data.submissionDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Analytics;
